import { ICommand } from '@nestjs/cqrs';
import { TrackingExtensionUpdateDomainDto } from 'src/tracking/domain';
export class TrackingExtensionUpdateCommand implements ICommand {
  constructor(
    public readonly trackerAssignmentId: number,
    public readonly trackingExtensionId: number,
    public readonly extensionDto: TrackingExtensionUpdateDomainDto
  ) {

  }
}