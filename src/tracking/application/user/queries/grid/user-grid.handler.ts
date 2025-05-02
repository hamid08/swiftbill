import { Inject, Injectable, Logger } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GridViewDto } from "src/common";
import { UserGridQuery } from "./user-grid.query";
import { UserGridResponseDto, UserRepository } from "src/tracking/domain";


@QueryHandler(UserGridQuery)
export class UserGridQueryHandler
    implements IQueryHandler<UserGridQuery, GridViewDto<UserGridResponseDto>> {
    private readonly logger = new Logger(UserGridQueryHandler.name);

    constructor(
        @Inject(UserRepository)
        private readonly userRepository: UserRepository,
    ) { }

    async execute(query: UserGridQuery): Promise<GridViewDto<UserGridResponseDto>> {
        return await this.userRepository.grid(query.filter, query.businessExternalId);
    }

}