import { Logger, NotFoundException } from '@nestjs/common';
import {
  Connection,
  FilterQuery,
  Model,
  SaveOptions,
  Types,
  UpdateQuery,
  QueryOptions
} from 'mongoose';
import { AbstractDocument } from './abstract.schema';

export abstract class AbstractRepository<TDocument extends AbstractDocument> {
  protected abstract readonly logger: Logger;

  constructor(
    protected readonly model: Model<TDocument>,
    private readonly connection: Connection,
  ) { }

  async exists(filterQuery: FilterQuery<TDocument>): Promise<boolean> {
    return this.model.exists(filterQuery).then((result) => !!result);
  }

  // Create a single document
  async create(
    document: Omit<TDocument, '_id'>,
    options?: SaveOptions,
  ): Promise<TDocument> {
    const createdDocument = new this.model({
      ...document,
      _id: new Types.ObjectId(),
    });
    return (
      await createdDocument.save(options)
    ).toJSON() as unknown as TDocument;
  }

  // Create multiple documents (Bulk Insert with optimized batch processing)
  async createAll(
    documents: Omit<TDocument, '_id'>[],
    options?: SaveOptions
  ): Promise<TDocument[]> {
    const BATCH_SIZE = 1000; // Process in batches of 1000 to optimize large bulk inserts.
    const chunks = this.chunkArray(documents, BATCH_SIZE);
    const insertedDocuments: TDocument[] = [];

    for (const chunk of chunks) {

      // Add _id and ensure the documents are treated as TDocument
      const documentsToCreate = chunk.map((doc) => ({
        ...doc,
        _id: new Types.ObjectId(), // Add _id to each document
      })) as (TDocument & { _id: Types.ObjectId })[]; // Cast the resulting documents

      const createdDocuments = await this.model.insertMany(documentsToCreate, {
        ordered: false, // Proceed with the remaining documents even if some fail.
        ...options,
      });

      // Use toJSON() and assert the result as TDocument[] to satisfy the type constraint
      insertedDocuments.push(...createdDocuments.map((doc) => doc.toJSON() as TDocument));

    }
    return insertedDocuments;
  }




  // Helper function to chunk an array into smaller arrays
  private chunkArray<T>(array: T[], size: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
  }

  async findOne(filterQuery: FilterQuery<TDocument>, options: any = {}): Promise<TDocument | null> {
    const document = await this.model
      .findOne(filterQuery, null, options)  // Pass options for sorting or other queries
      .lean<TDocument>(true);

    return document || null; // Return null if no document is found
  }


  async findOneAndUpdate(
    filterQuery: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
  ): Promise<TDocument> {
    const document = await this.model
      .findOneAndUpdate(filterQuery, update, {
        new: true,
      })
      .lean<TDocument>(true);

    if (!document) {
      return null;
    }

    return document;
  }

  async updateOne(
    filterQuery: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
    options?: Pick<QueryOptions<TDocument>, 'sort' | 'upsert'>,
  ): Promise<{ matchedCount: number; modifiedCount: number }> {
    const result = await this.model.updateOne(filterQuery, update, options);
    return {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    };
  }

  async upsert(
    filterQuery: FilterQuery<TDocument>,
    document: Partial<TDocument>,
  ) {
    return this.model
      .findOneAndUpdate(filterQuery, document, {
        upsert: true,
        new: true,
      })
      .lean<TDocument>(true);
  }

  async find(filterQuery: FilterQuery<TDocument>): Promise<TDocument[]> {
    return this.model.find(filterQuery).lean<TDocument[]>(true);
  }

  /**
   * Retrieves documents based on the provided filter query with pagination.
   * @param filterQuery The query to filter the documents.
   * @param pageIndex The index of the page (0-based).
   * @param pageSize The number of documents to retrieve per page.
   * @returns A promise that resolves to an array of documents.
   */
  async findWithPaging(
    filterQuery: FilterQuery<TDocument>,
    pageIndex: number,
    pageSize: number,
  ): Promise<TDocument[]> {
    return this.model
      .find(filterQuery)
      .skip((pageIndex - 1) * pageSize)
      .limit(pageSize)
      .lean<TDocument[]>(true);
  }

  // Delete a single document
  async findOneAndDelete(
    filterQuery: FilterQuery<TDocument>,
  ): Promise<TDocument> {
    return this.model.findOneAndDelete(filterQuery).lean<TDocument>(true);
  }

  // Delete multiple documents
  async deleteAll(
    filterQuery: FilterQuery<TDocument>,
  ): Promise<{ deletedCount?: number }> {
    const result = await this.model.deleteMany(filterQuery);
    return { deletedCount: result.deletedCount };
  }

  // Update multiple documents
  async updateAll(
    filterQuery: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
  ): Promise<{ modifiedCount?: number; matchedCount?: number }> {
    const result = await this.model.updateMany(filterQuery, update);
    return {
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount,
    };
  }

  // async startTransaction() {
  //   const session = await this.connection.startSession();
  //   session.startTransaction();
  //   return session;
  // }
}
