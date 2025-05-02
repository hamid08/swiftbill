import { Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { IoParameter, IoParameterRepository } from 'src/tracking/domain';
import { Inject } from '@nestjs/common';
import { AppException, IO_PARAMETER_CONSTANT, SelectItemDto } from 'src/common';
import { IoParameterListQuery } from './io-parameter-list.query';


@QueryHandler(IoParameterListQuery)
export class IoParameterListQueryHandler implements IQueryHandler<IoParameterListQuery, SelectItemDto<string>[]> {
    constructor(
        @Inject(IoParameterRepository)
        private readonly ioParameterRepository: IoParameterRepository,
    ) { }

    async execute(query: IoParameterListQuery): Promise<SelectItemDto<string>[]> {

        let list = await this.ioParameterRepository.getList();

        const speedParameter: IoParameter | null = await this.ioParameterRepository.getIoParameterByName(IO_PARAMETER_CONSTANT.STATIC_NAME.SPEED);
        if (speedParameter) {
            list.push(new SelectItemDto('سرعت', speedParameter.getParameterKey()));
        }
        else {
            list.push(new SelectItemDto('سرعت', IO_PARAMETER_CONSTANT.STATIC_NAME.SPEED));
        }
        return list;
    }
}   