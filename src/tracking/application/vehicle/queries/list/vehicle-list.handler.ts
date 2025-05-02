import { Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { VehicleRepository } from 'src/tracking/domain';
import { Inject } from '@nestjs/common';
import { AppException, SelectItemDto } from 'src/common';
import { VehicleListQuery } from './vehicle-list.query';


@QueryHandler(VehicleListQuery)
export class VehicleListQueryHandler implements IQueryHandler<VehicleListQuery, SelectItemDto[]> {
    constructor(
        @Inject(VehicleRepository)
        private readonly VehicleRepository: VehicleRepository,
    ) { }

    async execute(query: VehicleListQuery): Promise<SelectItemDto[]> {
        return await this.VehicleRepository.getList(query.filter, query.businessExternalId);
    }
}   