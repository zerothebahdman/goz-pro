import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Query, Req, Res, UseFilters } from '@nestjs/common';

import { ControllerRes } from '../common/http';
import { HttpExceptionFilter } from '../middlewares/http-exception-filter';
import { PackagesService } from './packages.service';
import TYPES from '../config/inversify.types';
import { Request, Response } from 'express';

type PackageControllerRes = null;

@UseFilters(new HttpExceptionFilter())
@Controller({ path: 'packages', version: '1' })
export class PackagesController extends ControllerRes<PackageControllerRes> {
  @Inject(TYPES.PackageService) private readonly packages: PackagesService;

  @Get('/')
  async getPackages(@Req req: Request, @Res() res: Response, @Query() query: any) {
    try {
    } catch (error) {
      throw error;
    }
  }
}
