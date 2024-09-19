import { HttpStatus, INestApplication } from '@nestjs/common';
import { Package, PackageDocument } from '../src/packages';
import { Test, TestingModule } from '@nestjs/testing';
import { createPackage, newPackageDTO } from './helpers/package';
import { getError, getSuccess } from './utils';

import { AppModule } from '../src/app.module';
import { PaginationModel } from '../src/common/pagination-wrapper';
import env from '../src/config/env';
import { faker } from '@faker-js/faker/.';
import mongoose from 'mongoose';
import request from 'supertest';

type Response<T> = {
  status: string;
  data: T;
};

let app: INestApplication;
beforeAll(async () => {
  await mongoose.connect(env().database.mongo_uri);
  await mongoose.connection.db.dropDatabase();
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  app = moduleFixture.createNestApplication();
  await app.init();
});

afterAll(async () => {
  await mongoose.disconnect();
  await app.close();
});

afterEach(async () => {
  await mongoose.connection.db.dropDatabase();
});

describe('PackagesController (End-to-End)', () => {
  describe('Create a package', () => {
    it('should create fail if invalid data', async () => {
      const message = await getError(
        HttpStatus.BAD_REQUEST,
        request(app.getHttpServer()).post('/packages').send({ to_location: '' }),
      );

      expect(message).toBe('to_location must be a `array` type, but the final value was: `""`.');
    });

    it('should create a package', async () => {
      const dto = newPackageDTO();
      const { data: response } = await getSuccess<Response<Package>>(
        request(app.getHttpServer()).post('/packages').send(dto),
      );
      expect(response.id).toBeDefined();
      expect(response.to_address).toBe(dto.to_address);
      expect(response.from_address).toBe(dto.from_address);
      expect(response.to_location.coordinates).toEqual(dto.to_location);
      expect(response.from_location.coordinates).toEqual(dto.from_location);
      expect(response.to_name).toBe(dto.to_name);
      expect(response.from_name).toBe(dto.from_name);
      expect(response.weight).toBe(dto.weight);
      expect(response.height).toBe(dto.height);
      expect(response.depth).toBe(dto.depth);
      expect(response.width).toBe(dto.width);
      expect(response.description).toBe(dto.description);
    });
  });

  describe('Get all packages', () => {
    it('should get all packages', async () => {
      const dto = newPackageDTO();
      await createPackage(dto);
      const { data: response } = await getSuccess<Response<PaginationModel<Package>>>(
        request(app.getHttpServer()).get('/packages'),
      );

      expect(response.total_pages).toBe(1);
      expect(response.total_data).toBe(1);
      expect(response.limit).toBe(10);
      expect(response.page).toBe(1);
    });
  });

  describe('Get a package', () => {
    it('should fail if delivery not found', async () => {
      const packageID = new mongoose.Types.ObjectId().toString();
      const message = await getError(HttpStatus.NOT_FOUND, request(app.getHttpServer()).get(`/packages/${packageID}`));

      expect(message).toBe('Package not found');
    });

    it('should get a package', async () => {
      const dto = newPackageDTO();
      const created = await createPackage(dto);
      const packageID = created.insertedId.toString();

      const { data: response } = await getSuccess<Response<PackageDocument>>(
        request(app.getHttpServer()).get(`/packages/${packageID}`),
      );

      expect(response.id).toBe(packageID);
      expect(response.to_address).toBe(dto.to_address);
      expect(response.from_address).toBe(dto.from_address);
      expect(response.to_location.coordinates).toEqual(dto.to_location);
      expect(response.from_location.coordinates).toEqual(dto.from_location);
      expect(response.to_name).toBe(dto.to_name);
      expect(response.from_name).toBe(dto.from_name);
      expect(response.weight).toBe(dto.weight);
      expect(response.height).toBe(dto.height);
      expect(response.depth).toBe(dto.depth);
      expect(response.width).toBe(dto.width);
      expect(response.description).toBe(dto.description);
    });
  });

  describe('Update a package', () => {
    it('should fail if delivery not found', async () => {
      const packageID = new mongoose.Types.ObjectId().toString();
      const message = await getError(HttpStatus.NOT_FOUND, request(app.getHttpServer()).put(`/packages/${packageID}`));

      expect(message).toBe('Package not found');
    });

    it('should update a package', async () => {
      const dto = newPackageDTO();
      const created = await createPackage(dto);
      const packageID = created.insertedId.toString();

      const description = faker.lorem.sentence();
      const { data: response } = await getSuccess<Response<PackageDocument>>(
        request(app.getHttpServer()).put(`/packages/${packageID}`).send({ description }),
      );

      expect(response.description).toBe(description);
      expect(response.id).toBe(packageID);
      expect(response.to_address).toBe(dto.to_address);
      expect(response.from_address).toBe(dto.from_address);
      expect(response.to_location.coordinates).toEqual(dto.to_location);
      expect(response.from_location.coordinates).toEqual(dto.from_location);
    });
  });

  describe('Delete a package', () => {
    it('should fail if delivery not found', async () => {
      const packageID = new mongoose.Types.ObjectId().toString();
      const message = await getError(
        HttpStatus.NOT_FOUND,
        request(app.getHttpServer()).delete(`/packages/${packageID}`),
      );

      expect(message).toBe('Package not found');
    });

    it('should delete a package', async () => {
      const dto = newPackageDTO();
      const created = await createPackage(dto);
      const packageID = created.insertedId.toString();

      const { data: response } = await getSuccess<Response<PackageDocument>>(
        request(app.getHttpServer()).delete(`/packages/${packageID}`),
      );

      expect(response).toBeNull();
    });
  });
});
