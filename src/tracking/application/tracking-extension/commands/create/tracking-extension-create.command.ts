import { ICommand } from '@nestjs/cqrs';
import { TrackingExtensionCreateDomainDto } from 'src/tracking/domain';
export class TrackingExtensionCreateCommand implements ICommand {
  constructor(
    public readonly trackerAssignmentId: number,
    public readonly extensionDto: TrackingExtensionCreateDomainDto
  ) {

  }
}