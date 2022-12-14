import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Document, Model, ObjectId, QueryWithHelpers } from 'mongoose';
import { User } from './user.schema';
import { InConfirmDto } from '../auth/dtos/in-confirm.dto';
import { InLoginDto } from '../auth/dtos/in-login.dto';

@Injectable()
export class UserRepo {
  constructor(@InjectModel(User.name) private readonly model: Model<User>) {}

  async create(userInfo: User): Promise<MongoDoc<User>> {
    return await this.model.create(userInfo);
  }

  async getByUsername(username: string): Promise<MongoDoc<User> | null> {
    return await this.model.findOne({ username });
  }

  async getByEmail(email: string): Promise<MongoDoc<User> | null> {
    return await this.model.findOne({ email });
  }

  async getById(userId: string): Promise<MongoDoc<User> | null> {
    return await this.model.findById(userId);
  }

  async updateProfileImage(
    userId: string,
    profileImage: string,
  ): Promise<MongoDoc<User> | null> {
    return await this.model.findByIdAndUpdate(
      userId,
      { $set: { profileImage } },
      { new: true },
    );
  }

  async getPaginatedUsers(
    limit: number,
    skip: number,
    search: string,
  ): Promise<PaginatedType<MongoDoc<User>>> {
    return (
      await this.model.aggregate([
        {
          $match: {
            $or: [
              { username: new RegExp(search, 'i') },
              { firstname: new RegExp(search, 'i') },
              { lastname: new RegExp(search, 'i') },
            ],
          },
        },
        {
          $facet: {
            values: [{ $skip: skip }, { $limit: limit }],
            count: [{ $count: 'count' }],
          },
        },
        { $set: { count: '$count.count' } },
        { $unwind: { path: '$count', preserveNullAndEmptyArrays: true } },
      ])
    )[0];
  }
}
