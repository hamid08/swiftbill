import { IsNotEmpty, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
export class TrackingExtensionUpdateDomainDto {
    @ApiProperty({
        description: 'عنوان افزونه',
        example: 'Tracking Extension',
        required: true,
    })
    @IsNotEmpty({ message: 'عنوان افزونه الزامی است' })
    caption: string;

    @ApiProperty({
        description: 'توضیحات افزونه',
        example: 'Tracking Extension Description',
        required: false,
    })
    @IsOptional()
    description: string;

}
    

export class TrackingExtensionMinimalInfoDto {
  caption: string;
  description: string;
  extensionId: string;
}
