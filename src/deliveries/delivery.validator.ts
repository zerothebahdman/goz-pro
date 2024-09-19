import * as Yup from 'yup';

import { deliveryEvents } from '../web-socket/ws.model';
import { deliveryStatus } from './schema/delivery.schema';

export const isDelivery = Yup.object().shape({
  package_id: Yup.string().required().length(24),
  status: Yup.string().required().oneOf(deliveryStatus),
});

export type DeliveryDTO = Yup.InferType<typeof isDelivery>;

export const isDeliveryID = Yup.object().shape({
  id: Yup.string().required().length(24),
});

export const isUpdateDeliveryStatus = Yup.object().shape({
  event: Yup.string().required().oneOf(deliveryEvents),
  status: Yup.string().required().oneOf(deliveryStatus),
  delivery_id: Yup.string().required().length(24),
});

export type UpdateDeliveryStatusDTO = Yup.InferType<typeof isUpdateDeliveryStatus>;

export const isUpdateDeliveryLocation = Yup.object().shape({
  event: Yup.string().required().oneOf(deliveryEvents),
  delivery_id: Yup.string().required().length(24),
  location: Yup.array().of(Yup.number().required()).required(),
});

export type UpdateDeliveryLocationDTO = Yup.InferType<typeof isUpdateDeliveryLocation>;

export const isPaginate = Yup.object().shape({
  limit: Yup.number().optional().min(1),
  page: Yup.number().optional().min(1),
  populate: Yup.string().optional(),
  order_by: Yup.string().optional(),
});

export const isGetDeliveries = isPaginate.shape({
  package: Yup.string().optional().length(24),
  status: Yup.string().optional().oneOf(deliveryStatus),
});

export type GetDeliveriesQuery = Yup.InferType<typeof isGetDeliveries>;
