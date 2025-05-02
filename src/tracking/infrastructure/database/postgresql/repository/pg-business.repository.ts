import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Business, BusinessRepository } from 'src/tracking/domain';
import { BusinessOrmEntity } from '../entities';
import chunk from 'lodash/chunk';

@Injectable()
export class PgBusinessRepo extends Repository<BusinessOrmEntity> implements BusinessRepository {
  constructor(private dataSource: DataSource) {
    super(BusinessOrmEntity, dataSource.createEntityManager());
  }


  async getByExternalId(externalId: string): Promise<Business | null> {
    const businessOrmEntity = await this.findOne({ where: { externalId } });
    return businessOrmEntity ? this.mapToDomain(businessOrmEntity) : null;
  } 

  /**
   * Get all businesses from the database.
   *
   * @returns A list of Business domain entities.
   */
  async getAllBusinesses(): Promise<Business[]> {
    const businessOrmEntities = await this.find();

    // Map ORM entities to domain entities
    return businessOrmEntities.map((entity) => this.mapToDomain(entity)) || [];
  }

  async findById(id: number): Promise<Business | null> {
    const businessOrmEntity = await this.findOne({ where: { id } });
    return businessOrmEntity ? this.mapToDomain(businessOrmEntity) : null;
  }

  async findByExternalId(externalId: string): Promise<Business | null> {
    const businessOrmEntity = await this.findOne({ where: { externalId } });
    return businessOrmEntity ? this.mapToDomain(businessOrmEntity) : null;
  }

  async saveBusiness(business: Business): Promise<Business> {
    const businessOrmEntity = this.mapToOrmEntity(business);
    const savedEntity = await this.save(businessOrmEntity);
    return this.mapToDomain(savedEntity);
  }

  async findAll(): Promise<Business[]> {
    const businessOrmEntities = await this.find();
    return businessOrmEntities.map((entity) => this.mapToDomain(entity));
  }

  async upsertBusiness(business: Business): Promise<Business> {
    const existingBusiness = await this.findByExternalId(business.getExternalId());

    if (existingBusiness) {
      // Update existing business
      existingBusiness.setDisplayName(business.getDisplayName());
      existingBusiness.setIcon(business.getIcon());
      return this.saveBusiness(existingBusiness);
    } else {
      // Create new business
      return this.saveBusiness(business);
    }
  }

  /**
   * Upsert businesses in bulk using TypeORM's query builder for better performance.
   * This method uses batch processing and conflict resolution to handle large datasets efficiently.
   */
  async upsertBusinesses(businesses: Business[], batchSize: number = 2000): Promise<void> {
    const batches = chunk(businesses, batchSize);

    for (const batch of batches) {
      try {
        await this.upsertBatch(batch);
      } catch (error) {
        console.error('Error upserting batch:', error);
      }
    }
  }

  /**
   * Upsert a batch of businesses using TypeORM's query builder.
   */
  private async upsertBatch(businesses: Business[]): Promise<void> {
    const ormEntities = businesses.map((business) => this.mapToOrmEntity(business));

    await this.dataSource
      .createQueryBuilder()
      .insert()
      .into(BusinessOrmEntity)
      .values(ormEntities)
      .orUpdate(['display_name', 'icon'], ['external_id']) // Update these columns on conflict
      .execute();
  }

  async getFirstOrDefault(): Promise<Business | null> {
    const businesses = await this.find({ take: 1 });
    if (businesses.length === 0) {
      return null;
    }

    const business = businesses[0];
    return this.mapToDomain(business);
  }

  private mapToOrmEntity(business: Business): BusinessOrmEntity {
    const businessOrmEntity = new BusinessOrmEntity();
    businessOrmEntity.id = business.getId();
    businessOrmEntity.externalId = business.getExternalId();
    businessOrmEntity.displayName = business.getDisplayName();
    businessOrmEntity.icon = business.getIcon();
    return businessOrmEntity;
  }

  private mapToDomain(businessOrmEntity: BusinessOrmEntity): Business {
    return Business.mapToDomain({
      id: businessOrmEntity.id,
      externalId: businessOrmEntity.externalId,
      displayName: businessOrmEntity.displayName,
      icon: businessOrmEntity.icon,
    });
  }
}