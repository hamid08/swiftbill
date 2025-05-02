import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, IsBoolean } from 'class-validator';

export class BaseGridViewDto {
  @IsInt()
  @IsOptional()
  @ApiProperty({ example: 1, description: 'The page index for pagination.' })
  pageIndex?: number = 1;

  @IsInt()
  @IsOptional()
  @ApiProperty({ example: 10, description: 'The number of items per page.' })
  pageSize?: number = 10;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'createdAt DESC', description: 'The sorting criteria.' })
  sort?: string = '';

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ example: false, description: 'Whether to export to Excel.', required: false })
  excelExport?: boolean = false;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'search term', description: 'The search term for filtering.', required: false })
  searchTerm?: string = '';

  @IsOptional()
  @ApiProperty({
    example: { type: 'SPEEDING' },
    description: 'The filters to apply.',
    required: false,
  })
  filters?: Record<string, any> = {};
}

