import { Package, PackageDocument, PackageLocation } from './schema/package.schema';
import mongoose, { Model } from 'mongoose';

import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { PackageDTO } from './package.validator';
import { paginate, PaginationModel, PaginationOptions } from '../common/pagination-wrapper';

@Injectable()
export class PackagesService {
  @InjectModel(Package.name) private readonly package: Model<Package>;

  /**
   * Creates a new package
   * @param dto - The package to create
   * @returns The created package
   */
  async create(dto: PackageDTO) {
    const toLocation: PackageLocation = {
      type: 'Point',
      coordinates: dto.to_location,
    };
    const fromLocation: PackageLocation = {
      type: 'Point',
      coordinates: dto.from_location,
    };
    return await this.package.create({
      ...dto,
      to_location: toLocation,
      from_location: fromLocation,
    });
  }

  /**
   * Finds all packages
   * @param query the query object
   * @returns the array of packages
   */
  async findAll(filter: Partial<PackageDocument>, options?: Partial<PaginationOptions>, shouldPaginate = true) {
    Object.assign(options, { populate: 'active_delivery' });
    return shouldPaginate
      ? <PaginationModel<Package>>await paginate(filter, this.package, options)
      : await this.package.find(<mongoose.FilterQuery<Package>>filter).populate('package');
  }

  async findOne(id: string) {
    return await this.package.findById(new mongoose.Types.ObjectId(id));
  }

  /**
   * Updates a package document in the database.
   * @param id - The id of the package document to update.
   * @param dto - The package data to update with.
   * @returns The updated package document.
   */
  async update(packageData: PackageDocument, dto: PackageDTO) {
    const toLocation: PackageLocation = {
      type: 'Point',
      coordinates: dto.to_location ?? packageData.to_location.coordinates,
    };

    const fromLocation: PackageLocation = {
      type: 'Point',
      coordinates: dto.from_location ?? packageData.from_location.coordinates,
    };
    packageData.set({ ...dto, to_location: toLocation, from_location: fromLocation });
    return packageData.save();
  }

  /**
   * Removes a package document from the database.
   * @param id - The id of the package document to remove.
   * @returns The removed package document.
   */
  async remove(id: string) {
    return await this.package.findByIdAndDelete(new mongoose.Types.ObjectId(id));
  }
}
