// import { Injectable, Logger } from '@nestjs/common';
// import { Connection, Model } from 'mongoose';
// import { InjectConnection, InjectModel } from '@nestjs/mongoose';
// import { AbstractRepository } from 'src/common';
// import { BrandDocument } from '../schema';
// import { Brand, BrandRepository } from 'src/tracking/domain';

// @Injectable()
// export class MongoBrandRepository
//     extends AbstractRepository<BrandDocument>
//     implements BrandRepository {

//     protected readonly logger = new Logger(MongoBrandRepository.name);

//     constructor(
//         @InjectModel(BrandDocument.name) private brand: Model<BrandDocument>,
//         @InjectConnection() connection: Connection,
//     ) {
//         super(brand, connection);
//     }

//     async upsertBrands(brands: Brand[]): Promise<void> {
//         const bulkOps = brands.map(brand => ({
//             updateOne: {
//                 filter: { brandId: brand.getBrandId() }, // Filter by `brandId`
//                 update: {
//                     $set: {
//                         caption: brand.getCaption(),
//                         name: brand.getName(),
//                         isMobile: brand.getIsMobile(),
//                     }
//                 },
//                 upsert: true, // Enable upsert
//             }
//         }));

//         try {
//             // Perform bulk write for all brands
//             const result = await this.brand.bulkWrite(bulkOps);
//         } catch (error) {
//             this.logger.error(`Failed to upsert brands: ${error.message}`, error.stack);
//         }
//     }
// }
