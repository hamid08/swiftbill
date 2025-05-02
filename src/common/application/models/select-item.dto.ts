import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { error } from 'console';


export class SelectItemDto<TId = number> {
    id: TId;
    caption: string;

    constructor(id: TId, caption: string) {
        this.id = id;
        this.caption = caption;
    }
}

export class SelectItemFilter {

    @ApiProperty({ required: true })
    @IsString()
    @IsNotEmpty({ message: 'مقداری برای جستجو وارد نشده است' })
    searchTerm: string;
}