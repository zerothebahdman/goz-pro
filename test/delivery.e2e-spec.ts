import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createDelivery, newDeliveryDTO } from './helpers/delivery';
import { createPackage, getPackageByID, newPackageDTO } from './helpers/package';
import { getError, getSuccess } from './utils';

import { AppModule } from '../src/app.module';
import { Delivery } from 'src/deliveries';
import { PaginationModel } from 'src/common/pagination-wrapper';
import env from '../src/config/env';
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

describe('DeliveriesController (End-to-End)', () => {
  describe('Create a delivery', () => {
    it('should create a delivery', async () => {
      const packageDTO = newPackageDTO();
      const packageID = (await createPackage(packageDTO)).insertedId;
      const deliveryDTO = newDeliveryDTO({ package_id: packageID.toString() });

      const { data: response } = await getSuccess<Response<Delivery>>(
        request(app.getHttpServer()).post('/deliveries').send(deliveryDTO),
      );

      expect(response.id).toBeDefined();
      expect(response.package).toBe(packageID.toString());
      expect(response.status).toBe(deliveryDTO.status);
    });
  });

  describe('Get all deliveries', () => {
    it('should get all deliveries', async () => {
      const packageDTO = newPackageDTO();
      const packageID = (await createPackage(packageDTO)).insertedId;
      const deliveryDTO = newDeliveryDTO({ package_id: packageID.toString() });

      await createDelivery(deliveryDTO);

      const { data: response } = await getSuccess<Response<PaginationModel<Delivery>>>(
        request(app.getHttpServer()).get('/deliveries'),
      );
      const packageData = await getPackageByID(packageID.toString());

      expect(response.total_data).toBe(1);
      expect(response.total_pages).toBe(1);
      expect(response.limit).toBe(10);
      expect(response.page).toBe(1);
      for (const result of response.result) {
        expect(result.package.id).toEqual(packageData._id.toString());
        expect(result.status).toBe(deliveryDTO.status);
      }
    });
  });

  describe('Get a delivery', () => {
    it('should fail if delivery not found', async () => {
      const deliveryID = new mongoose.Types.ObjectId().toString();
      const message = await getError(
        HttpStatus.NOT_FOUND,
        request(app.getHttpServer()).get(`/deliveries/${deliveryID}`),
      );

      expect(message).toBe('Delivery not found');
    });

    it('should get a delivery', async () => {
      const packageDTO = newPackageDTO();
      const packageID = (await createPackage(packageDTO)).insertedId;
      const deliveryDTO = newDeliveryDTO({ package_id: packageID.toString() });

      const created = await createDelivery(deliveryDTO);
      const deliveryID = created.insertedId.toString();

      const { data: response } = await getSuccess<Response<Delivery>>(
        request(app.getHttpServer()).get(`/deliveries/${deliveryID}`),
      );

      const packageData = await getPackageByID(packageID.toString());

      expect(response.id).toEqual(deliveryID);
      expect(response.package.id).toEqual(packageData._id.toString());
      expect(response.status).toBe(deliveryDTO.status);
    });
  });

  describe('Update a delivery', () => {
    it('should fail if delivery not found', async () => {
      const deliveryID = new mongoose.Types.ObjectId().toString();
      const message = await getError(
        HttpStatus.NOT_FOUND,
        request(app.getHttpServer())
          .put(`/deliveries/${deliveryID}`)
          .send({ package_id: new mongoose.Types.ObjectId().toString(), status: 'in-transit' }),
      );

      expect(message).toBe('Delivery not found');
    });

    it('should update a delivery', async () => {
      const packageDTO = newPackageDTO();
      const packageID = (await createPackage(packageDTO)).insertedId;
      const deliveryDTO = newDeliveryDTO({ package_id: packageID.toString() });

      const created = await createDelivery(deliveryDTO);
      const deliveryID = created.insertedId.toString();

      const { data: response } = await getSuccess<Response<Delivery>>(
        request(app.getHttpServer())
          .put(`/deliveries/${deliveryID}`)
          .send({ package_id: packageID.toString(), status: 'in-transit' }),
      );

      const packageData = await getPackageByID(packageID.toString());

      expect(response.id).toEqual(deliveryID);
      expect(response.package.id).toEqual(packageData._id.toString());
      expect(response.status).toBe('in-transit');
    });
  });

  describe('Delete a delivery', () => {
    it('should fail if delivery not found', async () => {
      const deliveryID = new mongoose.Types.ObjectId().toString();
      const message = await getError(
        HttpStatus.NOT_FOUND,
        request(app.getHttpServer()).delete(`/deliveries/${deliveryID}`),
      );

      expect(message).toBe('Delivery not found');
    });

    it('should delete a delivery', async () => {
      const packageDTO = newPackageDTO();
      const packageID = (await createPackage(packageDTO)).insertedId;
      const deliveryDTO = newDeliveryDTO({ package_id: packageID.toString() });

      const created = await createDelivery(deliveryDTO);
      const deliveryID = created.insertedId.toString();

      const { data: response } = await getSuccess<Response<Delivery>>(
        request(app.getHttpServer()).delete(`/deliveries/${deliveryID}`),
      );

      const packageData = await getPackageByID(packageID.toString());

      expect(response).toBeNull();
      expect(packageData.active_delivery).toBeNull();
    });
  });
});
