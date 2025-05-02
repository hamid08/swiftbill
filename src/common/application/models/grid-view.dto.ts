import { ApiProperty } from "@nestjs/swagger";

export class GridViewDto<T> {
    @ApiProperty({ description: 'The list of items.' })
    list: T[];

    @ApiProperty({ example: 1, description: 'The current page index.' })
    page: number;

    @ApiProperty({ example: 10, description: 'The number of items per page.' })
    size: number;

    @ApiProperty({ example: 100, description: 'The total number of items.' })
    total: number;
}