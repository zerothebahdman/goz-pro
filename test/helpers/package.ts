import { PackageDTO } from '../../src/packages/package.validator';
import { PackageLocation } from 'src/packages';
import { faker } from '@faker-js/faker/.';
import mongoose from 'mongoose';

export function newPackageDTO(extras?: Partial<PackageDTO>): PackageDTO {
  return {
    description: faker.lorem.sentence(),
    depth: faker.number.int(),
    from_address: faker.location.streetAddress(),
    from_location: [faker.location.longitude(), faker.location.latitude()],
    from_name: faker.person.fullName(),
    height: faker.number.int(),
    to_address: faker.location.streetAddress(),
    to_location: [faker.location.longitude(), faker.location.latitude()],
    to_name: faker.person.fullName(),
    weight: faker.number.int(),
    width: faker.number.int(),
    ...extras,
  };
}

export async function createPackage(dto: PackageDTO) {
  const toLocation: PackageLocation = {
    type: 'Point',
    coordinates: dto.to_location,
  };
  const fromLocation: PackageLocation = {
    type: 'Point',
    coordinates: dto.from_location,
  };
  return await mongoose.connection.db
    .collection('packages')
    .insertOne({ ...dto, to_location: toLocation, from_location: fromLocation });
}

export async function getPackageByID(id: string) {
  return await mongoose.connection.db.collection('packages').findOne({ _id: new mongoose.Types.ObjectId(id) });
}
