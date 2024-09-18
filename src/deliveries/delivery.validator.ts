import * as Yup from 'yup';

import { deliveryStatus } from './schema/delivery.schema';

export const isDelivery = Yup.object().shape({
  package_id: Yup.string().required().length(24),
  status: Yup.string().required().oneOf(deliveryStatus),
});

export type DeliveryDTO = Yup.InferType<typeof isDelivery>;

export const isDeliveryID = Yup.object().shape({
  id: Yup.string().required().length(24),
});
