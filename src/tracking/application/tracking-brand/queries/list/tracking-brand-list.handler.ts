import { Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { TrackingBrandRepository } from 'src/tracking/domain';
import { Inject } from '@nestjs/common';
import { AppException, SelectItemDto } from 'src/common';
import { TrackingBrandListQuery } from './tracking-brand-list.query';


@QueryHandler(TrackingBrandListQuery)
export class TrackingBrandListQueryHandler implements IQueryHandler<TrackingBrandListQuery, SelectItemDto[]> {
    constructor(
        @Inject(TrackingBrandRepository)
        private readonly trackingBrandRepository: TrackingBrandRepository,
    ) { }

    async execute(query: TrackingBrandListQuery): Promise<SelectItemDto[]> {
        return await this.trackingBrandRepository.getList();
    }
}   