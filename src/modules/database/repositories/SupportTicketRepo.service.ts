import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Model,
  FilterQuery,
  AnyKeys,
  Types,
  ProjectionType,
  QueryOptions,
} from 'mongoose';
import { CACHE_CONSTANTS, DEFAULT_PER_PAGE } from 'src/config';
import {
  StatusLog,
  SupportTicket,
  SupportTicketDocument,
} from '../schemas/support-ticket.schema';
import { Cache } from 'cache-manager';
import { endOfDay, format, startOfDay } from 'date-fns';

@Injectable()
export class SupportTicketRepoService {
  private logger = new Logger(SupportTicketRepoService.name);
  constructor(
    @InjectModel(SupportTicket.name)
    private supportTicketModel: Model<SupportTicketDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  public async create(data: AnyKeys<SupportTicketDocument>) {
    try {
      const ticketNumber = await this.getLatestTicketNumber();
      const createdTicket = await this.supportTicketModel.create({
        ...data,
        ticketNumber,
      });
      return this.findById(createdTicket.id);
    } catch (error) {
      this.logger.error(`Error while creating ticket`, error);
      throw error;
    }
  }

  private async getLatestTicketNumber() {
    try {
      const startDate = startOfDay(new Date());
      const endDate = endOfDay(new Date());

      const countDocs = await this.supportTicketModel.countDocuments({
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      });
      return `${format(new Date(), 'yyMMdd')}${(countDocs + 1)
        .toString(10)
        .padStart(5, '0')}`;
    } catch (error) {
      this.logger.error(`Error while creating ticket number`, error);
      throw error;
    }
  }

  public async paginate(
    query: FilterQuery<SupportTicketDocument>,
    projection: ProjectionType<SupportTicketDocument> = null,
    options: QueryOptions = {},
    page = 1,
    limit = DEFAULT_PER_PAGE,
  ) {
    try {
      const skip = (page - 1) * limit;
      const total = await this.supportTicketModel.countDocuments(query);
      const users = await this.supportTicketModel.find(query, projection, {
        ...options,
        skip,
        limit,
        lean: true,
      });
      return {
        total,
        page,
        perPage: limit,
        items: users,
      };
    } catch (error) {
      this.logger.error(`Error while finding tickets`, error);
      throw error;
    }
  }

  public async findById(
    id: string | object,
    projection: ProjectionType<SupportTicketDocument> = null,
    options: QueryOptions = {},
    refreshCache = false,
  ) {
    try {
      let ticketData: SupportTicketDocument = null;
      const idStr = typeof id === 'string' ? id : id.toString();
      if (!refreshCache) {
        ticketData = await this.cacheManager.get(
          CACHE_CONSTANTS.SUPPORT_TICKET.BY_ID(idStr),
        );
      }
      if (!ticketData) {
        ticketData = await this.supportTicketModel
          .findById(id, projection, {
            ...options,
            lean: true,
          })
          .populate(['createdBy', 'relatedDevice', 'statusLog.updatedBy']);
        if (ticketData) {
          await this.setSupportTicketCache(ticketData);
        }
      }
      return ticketData;
    } catch (error) {
      this.logger.error(`Error while finding ticket by id`, error);
      throw error;
    }
  }

  public async findByIdAndUpdate(
    id: string | object,
    updateData: AnyKeys<SupportTicketDocument>,
  ) {
    try {
      await this.supportTicketModel.findByIdAndUpdate(
        id,
        {
          ...updateData,
        },
        {
          new: true,
        },
      );
      const updatedTicketData = await this.findById(id, null, {}, true);
      return updatedTicketData;
    } catch (error) {
      this.logger.error(`Error while updating ticket`, error);
      throw error;
    }
  }

  public async findAll(
    query: FilterQuery<SupportTicketDocument>,
    projection: ProjectionType<SupportTicketDocument> = null,
    options: QueryOptions = {},
  ) {
    try {
      return this.supportTicketModel
        .find(query, projection, options)
        .populate(['createdBy', 'relatedDevice', 'statusLog.updatedBy']);
    } catch (error) {
      this.logger.error(`Error while finding tickets`, error);
      throw error;
    }
  }

  public async findOne(
    query: FilterQuery<SupportTicketDocument>,
    projection: ProjectionType<SupportTicketDocument> = null,
    options: QueryOptions = {},
  ) {
    try {
      return this.supportTicketModel
        .findOne(query, projection, options)
        .populate(['createdBy', 'relatedDevice', 'statusLog.updatedBy']);
    } catch (error) {
      this.logger.error(`Error while finding ticket`, error);
      throw error;
    }
  }

  public async createLog(ticketId: string | object, data: StatusLog) {
    try {
      await this.supportTicketModel.findByIdAndUpdate(ticketId, {
        $push: {
          ...data,
          updatedAt: new Date(),
        },
        $set: {
          lastStatus: data.status,
          lastStatusUpdatedAt: new Date(),
        },
      });
      return this.findById(ticketId, null, {}, true);
    } catch (error) {
      this.logger.error(`Error while creating log`, error);
      throw error;
    }
  }

  private async setSupportTicketCache(ticketData: SupportTicketDocument) {
    try {
      await this.cacheManager.set(
        CACHE_CONSTANTS.SUPPORT_TICKET.BY_ID(ticketData.id),
        ticketData,
      );
    } catch (error) {
      this.logger.error(`Error while setting ticket cache`, error);
      throw error;
    }
  }

  private async deleteTicketCache(ticketData: SupportTicketDocument) {
    try {
      await this.cacheManager.del(
        CACHE_CONSTANTS.SUPPORT_TICKET.BY_ID(ticketData.id),
      );
    } catch (error) {
      this.logger.error(`Error while deleting user cache`, error);
      throw error;
    }
  }
}
