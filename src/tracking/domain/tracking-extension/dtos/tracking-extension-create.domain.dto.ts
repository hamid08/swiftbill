import { IsNotEmpty, IsString, IsDate, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class TrackingExtensionCreateDomainDto {
    @ApiProperty({ description: 'عنوان افزونه' })
    @IsNotEmpty({ message: 'عنوان افزونه الزامی است' })
    caption: string;

    @ApiProperty({ description: 'توضیحات افزونه' })
    @IsOptional()
    description: string;

    @ApiProperty({ description: 'شناسه افزونه' })
    @IsNotEmpty({ message: 'شناسه افزونه الزامی است' })
    extensionId: string;
}


