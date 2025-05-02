import { Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Brackets, Repository, SelectQueryBuilder } from "typeorm";
import { BaseGridViewDto, GridViewDto } from "../models";
import { ReflectorUtils } from "./reflector.utils";
import { DECORATOR_CONSTANT } from "../constants";

export interface SearchableField {
  /**
   * Can be either:
   * - Entity property path (e.g., "terminalNumber")
   * - Direct column name (e.g., "terminal_number")
   * - Relation path (e.g., "trackingDevice.imei")
   */
  name: string;
  searchType?: 'contains' | 'exact' | 'startsWith' | 'endsWith';
  priority?: number;
}

export interface SortableField {
  fieldPath: string;
  columnName?: string;
  defaultDirection?: 'ASC' | 'DESC';
}

export interface GridConfig {
  searchableFields?: SearchableField[];
  sortableFields?: SortableField[];
  defaultSort?: string;
}

@Injectable()
export class GridUtilsService {
  constructor(private reflector: Reflector) { }

  async applySearchFilters<TEntity, TDto>(
    repository: Repository<TEntity>,
    queryBuilder: SelectQueryBuilder<TEntity>,
    request: BaseGridViewDto,
    mapToDto: (entity: TEntity) => TDto,
    gridConfig?: GridConfig | undefined
  ): Promise<GridViewDto<TDto>> {
    const { pageIndex, pageSize, sort, searchTerm, filters } = request;

    // Safe defaults when config is undefined
    const safeConfig = gridConfig || {
      searchableFields: [],
      sortableFields: [],
      defaultSort: undefined
    };

    // Apply search term if provided and fields exist
    if (searchTerm && safeConfig.searchableFields?.length) {
      this.applySearchTerm(queryBuilder, searchTerm, safeConfig.searchableFields);
    }

    // Apply sorting
    this.applySorting(
      queryBuilder,
      sort,
      safeConfig.sortableFields,
      safeConfig.defaultSort
    );

    // Apply filters if provided
    if (filters) {
      this.applyFilters(queryBuilder, filters);
    }

    // Apply pagination
    const total = await queryBuilder.getCount();
    const entities = await queryBuilder
      .skip((pageIndex - 1) * pageSize)
      .take(pageSize)
      .getMany();

    return {
      list: entities.map(mapToDto),
      page: pageIndex,
      size: pageSize,
      total,
    };
  }

  private applySearchTerm(
    queryBuilder: SelectQueryBuilder<any>,
    searchTerm: string,
    searchableFields: SearchableField[]
  ) {
    const cleanSearchTerm = searchTerm.trim();
    if (!cleanSearchTerm) return;

    const searchTerms = cleanSearchTerm.split(/\s+/).filter(term => term.length > 0);

    queryBuilder.andWhere(new Brackets(qb => {
      searchTerms.forEach(term => {
        const termConditions = searchableFields.map(field => {
          // Use the name directly - TypeORM will handle the conversion
          const searchPattern = this.getSearchPattern(term, field.searchType);

          return {
            condition: `LOWER(${field.name}) LIKE LOWER(:${field.name.replace('.', '_')})`,
            parameters: { [field.name.replace('.', '_')]: searchPattern },
            priority: field.priority || 1
          };
        });

        termConditions.sort((a, b) => b.priority - a.priority);
        termConditions.forEach((cond, index) => {
          index === 0
            ? qb.where(cond.condition, cond.parameters)
            : qb.orWhere(cond.condition, cond.parameters);
        });
      });
    }));
  }

  private getSearchPattern(term: string, searchType?: string): string {
    switch (searchType) {
      case 'exact': return term;
      case 'startsWith': return `${term}%`;
      case 'endsWith': return `%${term}`;
      default: return `%${term}%`;
    }
  }

  private applySorting(
    queryBuilder: SelectQueryBuilder<any>,
    sort: string | undefined,
    sortableFields: SortableField[] = [],
    defaultSort?: string
  ) {

    let sortToApply = defaultSort;
    if (sort && sortableFields.length > 0) {
      sortToApply = sort;
    }
    if (!sortToApply) return;

    // Handle comma-separated sort fields (e.g., "field1 ASC, field2 DESC")
    const sortClauses = sortToApply.split(',').map(s => s.trim());

    sortClauses.forEach(clause => {
      const [sortField, sortDirection] = clause.split(/\s+/);
      const sortConfig = sortableFields?.find(f => f.fieldPath === sortField);

      if (sortConfig) {
        const dbField = sortConfig.columnName || sortConfig.fieldPath;
        const direction = (sortDirection || sortConfig.defaultDirection || 'ASC').toUpperCase();
        queryBuilder.addOrderBy(dbField, direction as 'ASC' | 'DESC');
      }
    });
  }

  private applyFilters(
    queryBuilder: SelectQueryBuilder<any>,
    filters: Record<string, any>
  ) {
    // for (const [key, value] of Object.entries(filters)) {
    //   if (value !== undefined && value !== null) {
    //     if (Array.isArray(value)) {
    //       queryBuilder.andWhere(`${key} IN (:...${key})`, { [key]: value });
    //     } else {
    //       queryBuilder.andWhere(`${key} = :${key}`, { [key]: value });
    //     }
    //   }
    // }
  }
}