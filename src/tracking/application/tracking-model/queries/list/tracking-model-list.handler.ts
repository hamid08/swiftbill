import { Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { TrackingBrand, TrackingBrandError, TrackingBrandRepository, TrackingModelRepository } from 'src/tracking/domain';
import { Inject } from '@nestjs/common';
import { AppException, SelectItemDto } from 'src/common';
import { TrackingModelListQuery } from './tracking-model-list.query';


@QueryHandler(TrackingModelListQuery)
export class TrackingModelListQueryHandler implements IQueryHandler<TrackingModelListQuery, SelectItemDto[]> {
  constructor(
    @Inject(TrackingModelRepository)
    private readonly trackingModelRepository: TrackingModelRepository,

    @Inject(TrackingBrandRepository)
    private readonly trackingBrandRepository: TrackingBrandRepository,
  ) { }

  async execute(query: TrackingModelListQuery): Promise<SelectItemDto[]> {
    const trackingBrand: TrackingBrand | null = await this.trackingBrandRepository.getTrackingBrandById(query.trackingBrandId);

    if (!trackingBrand) {
      throw AppException.BadRequest(TrackingBrandError.NotFound);
    }

    return await this.trackingModelRepository.getList(query.trackingBrandId);
  }
}   