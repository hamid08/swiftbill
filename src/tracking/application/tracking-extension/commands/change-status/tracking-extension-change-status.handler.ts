import { Inject, Injectable, Logger } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import {
    TrackingDeviceRepository,
    TrackingDeviceError,
    TrackingExtension,
    TrackingExtensionError,
    TrackingExtensionRepository,
    TrackingExtensionStatus,
    TrackingDevice,
    TrackerAssignmentRepository,
    TrackerAssignmentError
} from "src/tracking/domain";
import { AppException, RMQ_CONSTANT } from "src/common";
import { TrackingExtensionChangeStatusCommand } from "./tracking-extension-change-status.command";

@CommandHandler(TrackingExtensionChangeStatusCommand)
export class TrackingExtensionChangeStatusCommandHandler
    implements ICommandHandler<TrackingExtensionChangeStatusCommand, void> {

    private readonly logger = new Logger(TrackingExtensionChangeStatusCommandHandler.name);

    constructor(
        @Inject(TrackingExtensionRepository)
        private readonly extensionRepository: TrackingExtensionRepository,
        @Inject(TrackingDeviceRepository)
        private readonly deviceRepository: TrackingDeviceRepository,
        @Inject(TrackerAssignmentRepository)
        private readonly trackerAssignmentRepository: TrackerAssignmentRepository,
        private readonly amqpConnection: AmqpConnection,
    ) { }

    async execute(command: TrackingExtensionChangeStatusCommand): Promise<void> {
        // اعتبارسنجی و آماده سازی اطلاعات اکستنشن و دستگاه
        const { trackingExtension, trackingDevice } = await this.validateAndPrepareExtension(command);

        // بروزرسانی وضعیت اکستنشن در دیتابیس
        await this.updateExtensionStatus(trackingExtension.getId(), trackingExtension.getStatus());

        // ارسال رویداد تغییر وضعیت به صف پیام
        await this.publishStatusChangeEvent(trackingExtension, trackingDevice);
    }

    private async validateAndPrepareExtension(
        command: TrackingExtensionChangeStatusCommand
    ): Promise<{ trackingExtension: TrackingExtension; trackingDevice: TrackingDevice }> {

        const trackerAssignment = await this.trackerAssignmentRepository.getByTrackerAssignmentId(command.trackerAssignmentId);

        if (!trackerAssignment) {
            throw AppException.BadRequest(TrackerAssignmentError.TrackerAssignmentNotFound);
        }

        // دریافت همزمان اطلاعات دستگاه و اکستنشن به صورت موازی
        const [trackingDevice, trackingExtension] = await Promise.all([
            this.validateTrackingDevice(trackerAssignment.getTrackingDeviceId()),
            this.validateTrackingExtension(command.trackingExtensionId),
        ]);

        // اعتبارسنجی انتقال وضعیت
        this.validateStatusTransition(trackingExtension, command.status);

        // اگر وضعیت جدید 'فعال' باشد، بررسی می‌کنیم که اکستنشن در دستگاه دیگری استفاده نشده باشد
        if (command.status === TrackingExtensionStatus.Active) {
            await this.validateExtensionNotUsedElsewhere(trackingExtension);
        }

        // تعیین وضعیت انتقالی (Transition State)
        trackingExtension.setStatus(this.getTransitionStatus(command.status));

        return { trackingExtension, trackingDevice };
    }

    private async validateTrackingDevice(deviceId: number): Promise<TrackingDevice> {
        // درخواست به ریپازیتوری برای دریافت اطلاعات دستگاه
        const device = await this.deviceRepository.getTrackingDeviceById(deviceId);
        if (!device) {
            throw AppException.BadRequest(TrackingDeviceError.TRACKING_DEVICE_NOT_FOUND);
        }
        return device;
    }

    private async validateTrackingExtension(extensionId: number): Promise<TrackingExtension> {
        // درخواست به ریپازیتوری برای دریافت اطلاعات اکستنشن
        const extension = await this.extensionRepository.getTrackingExtensionById(extensionId);
        if (!extension) {
            throw AppException.BadRequest(TrackingExtensionError.TRACKING_EXTENSION_NOT_FOUND);
        }
        return extension;
    }

    private validateStatusTransition(
        extension: TrackingExtension,
        newStatus: TrackingExtensionStatus
    ): void {
        const currentStatus = extension.getStatus();
        const validTransitions = {
            [TrackingExtensionStatus.Activating]: [TrackingExtensionStatus.Activating],
            [TrackingExtensionStatus.Deactivating]: [
                TrackingExtensionStatus.Deactivating,
                TrackingExtensionStatus.Active,
                TrackingExtensionStatus.Activating
            ],
            [TrackingExtensionStatus.Active]: [TrackingExtensionStatus.Deactive]
        };

        if (!validTransitions[newStatus]?.includes(currentStatus)) {
            throw AppException.BadRequest(
                this.getStatusTransitionError(newStatus, currentStatus)
            );
        }
    }

    private getStatusTransitionError(
        targetStatus: TrackingExtensionStatus,
        currentStatus: TrackingExtensionStatus
    ): string {
        const errorMap = {
            [TrackingExtensionStatus.Activating]: TrackingExtensionError.TRACKING_EXTENSION_STATUS_NOT_ACTIVATING,
            [TrackingExtensionStatus.Deactivating]: TrackingExtensionError.TRACKING_EXTENSION_STATUS_NOT_DEACTIVATING,
            [TrackingExtensionStatus.Active]: TrackingExtensionError.TRACKING_EXTENSION_STATUS_NOT_DEACTIVE
        };
        return errorMap[targetStatus];
    }

    private async validateExtensionNotUsedElsewhere(extension: TrackingExtension): Promise<void> {
        // درخواست به ریپازیتوری برای بررسی استفاده اکستنشن در دستگاه‌های دیگر
        const isUsed = await this.extensionRepository.trackingExtensionUsedInOtherDevice(extension.getExtensionId());
        if (isUsed) {
            throw AppException.BadRequest(TrackingExtensionError.TRACKING_EXTENSION_STATUS_ALREADY_USED_IN_OTHER_DEVICE);
        }
    }

    private getTransitionStatus(targetStatus: TrackingExtensionStatus): TrackingExtensionStatus {
        return targetStatus === TrackingExtensionStatus.Active
            ? TrackingExtensionStatus.Activating
            : targetStatus;
    }

    private async updateExtensionStatus(
        extensionId: number,
        status: TrackingExtensionStatus
    ): Promise<void> {
        // ایجاد شیء اکستنشن با وضعیت جدید
        const extension = TrackingExtension.changeStatus(extensionId, status);
        // درخواست به ریپازیتوری برای ذخیره وضعیت جدید
        await this.extensionRepository.changeStatus(extension);
    }

    private async publishStatusChangeEvent(
        extension: TrackingExtension,
        device: TrackingDevice
    ): Promise<void> {
        const status = extension.getStatus();
        const publishableStatuses = [TrackingExtensionStatus.Activating, TrackingExtensionStatus.Deactivating];

        // اگر وضعیت از نوعی نباشد که نیاز به ارسال رویداد داشته باشد، از متد خارج می‌شویم
        if (!publishableStatuses.includes(status)) {
            return;
        }

        // تعیین صف پیام بر اساس نوع وضعیت
        const exchange = status === TrackingExtensionStatus.Activating
            ? RMQ_CONSTANT.TRACKING_EXTENSION.ACTIVATE.EXCHANGE
            : RMQ_CONSTANT.TRACKING_EXTENSION.DEACTIVATE.EXCHANGE;

        // ارسال پیام به صف RabbitMQ
        await this.amqpConnection.publish(exchange, '', {
            extensionId: extension.getExtensionId(),
            imei: device.getImei(),
        });

        this.logger.log(`🚀 Published tracking extension status change for ${extension.getExtensionId()}`);

    }
}