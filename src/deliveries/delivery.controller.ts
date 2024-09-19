import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  NotFoundException,
  Param,
  Put,
  Post,
  Req,
  Res,
  UseFilters,
} from '@nestjs/common';

import { DeliveryService } from './delivery.service';
import TYPES from '../config/inversify.types';
import { HttpExceptionFilter } from '../middlewares/http-exception-filter';
import { ControllerRes } from '../common/http';
import { Delivery } from './schema/delivery.schema';
import { Request, Response } from 'express';
import { YupValidationPipe } from '@blinkclaud/octobus';
import { DeliveryDTO, isDelivery, isDeliveryID } from './delivery.validator';
import { PackagesService } from '../packages';

type ControllerResponse = Delivery | Delivery[];
@UseFilters(new HttpExceptionFilter())
@Controller({ path: '/deliveries', version: '1' })
export class DeliveriesController extends ControllerRes<ControllerResponse> {
  @Inject(TYPES.DeliveryService) private readonly deliveries: DeliveryService;
  @Inject(TYPES.PackageService) private readonly packages: PackagesService;

  @Post('/')
  async createDelivery(
    @Req() req: Request,
    @Res() res: Response,
    @Body(new YupValidationPipe(isDelivery)) body: DeliveryDTO,
  ) {
    const packageDetail = await this.packages.findOne(body.package_id);
    if (!packageDetail) {
      throw new NotFoundException('Package not found');
    }

    const resp = await this.deliveries.create(body);

    await this.packages.update(packageDetail, {
      active_delivery: resp._id.toString(),
      to_location: packageDetail.to_location.coordinates,
      from_location: packageDetail.from_location.coordinates,
    });
    this.send(req, res, resp);
  }

  @Get('/')
  async getDeliveries(@Req() req: Request, @Res() res: Response) {
    const resp = await this.deliveries.findAll();
    this.send(req, res, resp);
  }

  @Get('/:id')
  async getDelivery(@Req() req: Request, @Res() res: Response, @Param(new YupValidationPipe(isDeliveryID)) id: string) {
    const resp = await this.deliveries.findOne(id, true, 'package');
    if (!resp) {
      throw new NotFoundException('Delivery not found');
    }

    this.send(req, res, resp);
  }

  @Put('/:id')
  async updateDelivery(
    @Req() req: Request,
    @Res() res: Response,
    @Param(new YupValidationPipe(isDeliveryID)) id: string,
    @Body(new YupValidationPipe(isDelivery)) body: DeliveryDTO,
  ) {
    const delivery = await this.deliveries.findOne(id, true, 'package');
    if (!delivery) {
      throw new NotFoundException('Delivery not found');
    }

    const resp = await this.deliveries.update(delivery, body);
    this.send(req, res, resp);
  }

  @Delete('/:id')
  async deleteDelivery(
    @Req() req: Request,
    @Res() res: Response,
    @Param(new YupValidationPipe(isDeliveryID)) id: string,
  ) {
    const delivery = await this.deliveries.findOne(id, true, 'package');
    if (!delivery) {
      throw new NotFoundException('Delivery not found');
    }

    const packageDetails = await this.packages.findOne(delivery.package.id);
    await this.packages.update(packageDetails, { active_delivery: null });

    await this.deliveries.delete(id);
    this.send(req, res, null);
  }
}
