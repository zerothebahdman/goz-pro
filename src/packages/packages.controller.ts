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
  Query,
  Req,
  Res,
  UseFilters,
} from '@nestjs/common';

import { ControllerRes } from '../common/http';
import { HttpExceptionFilter } from '../middlewares/http-exception-filter';
import { PackagesService } from './packages.service';
import TYPES from '../config/inversify.types';
import { Request, Response } from 'express';
import { YupValidationPipe } from '@blinkclaud/octobus';
import { isPackage, isPackageID, PackageDTO } from './package.validator';
import { Package } from './schema/package.schema';
import { DeliveryService } from '../deliveries';
import pick from '../common/pick';
import { PaginationModel } from '../common/pagination-wrapper';

type PackageControllerRes = Package | Package[] | PaginationModel<Package>;

@UseFilters(new HttpExceptionFilter())
@Controller({ path: 'packages', version: '1' })
export class PackagesController extends ControllerRes<PackageControllerRes> {
  @Inject(TYPES.PackageService) private readonly packages: PackagesService;
  @Inject(TYPES.DeliveryService) private readonly deliveries: DeliveryService;

  @Get('/')
  async getPackages(@Req() req: Request, @Res() res: Response, @Query() query: any) {
    try {
      const options = pick(query, ['page', 'limit', 'populate', 'order_by']);
      const resp = await this.packages.findAll({}, options);
      this.send(req, res, resp);
    } catch (error) {
      throw error;
    }
  }

  @Post('/')
  async createPackage(
    @Req() req: Request,
    @Res() res: Response,
    @Body(new YupValidationPipe(isPackage)) body: PackageDTO,
  ) {
    const resp = await this.packages.create(body);
    this.send(req, res, resp);
  }

  @Get('/:id')
  async getPackage(@Req() req: Request, @Res() res: Response, @Param(new YupValidationPipe(isPackageID)) id: string) {
    const resp = await this.packages.findOne(id);
    if (!resp) {
      throw new NotFoundException('Package not found');
    }

    this.send(req, res, resp);
  }

  @Put('/:id')
  async updatePackage(
    @Req() req: Request,
    @Res() res: Response,
    @Param(new YupValidationPipe(isPackageID)) id: string,
    @Body(new YupValidationPipe(isPackage)) body: PackageDTO,
  ) {
    let resp = await this.packages.findOne(id);
    if (!resp) {
      throw new NotFoundException('Package not found');
    }

    resp = await this.packages.update(resp, body);
    this.send(req, res, resp);
  }

  @Delete('/:id')
  async deletePackage(
    @Req() req: Request,
    @Res() res: Response,
    @Param(new YupValidationPipe(isPackageID)) id: string,
  ) {
    const resp = await this.packages.findOne(id);
    if (!resp) {
      throw new NotFoundException('Package not found');
    }

    await this.packages.remove(resp.id);
    this.send(req, res, null);

    await this.deliveries.deletePackageDeliveries(resp.id);
  }
}
