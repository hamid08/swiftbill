import { Inject, Injectable, Logger } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { CronUtils, TimeUnit } from 'src/common';
import { CommandBus } from '@nestjs/cqrs';
import { StopTraceDeviceCommand } from 'src/tracking/application';


@Injectable()
export class ApplicationScheduler {
    private readonly logger = new Logger(ApplicationScheduler.name);

    constructor(
        private schedulerRegistry: SchedulerRegistry,
        private readonly commandBus: CommandBus,
    ) { }

    onModuleInit() {
        this.initializeJobs();
    }

    /**
     * Initializes all scheduled jobs when the module starts.
     */
    private initializeJobs() {
        this.scheduleStopTracingJob();
    }

    /**
     * Schedules the job responsible for tracking data validation.
     */
    private scheduleStopTracingJob() {
        const cronExpression = CronUtils.getCronExpression(1, TimeUnit.HOURS);
        const jobName = 'stop-tracing-job';

        this.registerCronJob(jobName, cronExpression, async () => {
            await this.commandBus.execute(new StopTraceDeviceCommand([], true));
        });
    }

    /**
     * Registers and starts a cron job.
     * @param jobName - Unique name of the job.
     * @param cronExpression - Cron schedule expression.
     * @param jobFunction - The function to execute on schedule.
     */
    private registerCronJob(jobName: string, cronExpression: string, jobFunction: () => Promise<void>) {
        const job = new CronJob(cronExpression, async () => {
            try {
                this.logger.log(`⏰ Running ${jobName}...`);
                await jobFunction();
            } catch (error) {
                this.logger.error(`❌ Error executing ${jobName}: ${error.message}`, error.stack);
            }
        });

        this.schedulerRegistry.addCronJob(jobName, job);
        job.start();
        this.logger.log(`✅ Scheduled ${jobName} to run at ${cronExpression}`);
    }
}
