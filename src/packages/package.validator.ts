import * as Yup from 'yup';

export const isPackage = Yup.object().shape({
  description: Yup.string().required(),
  weight: Yup.number().required(),
  width: Yup.number().required(),
  height: Yup.number().required(),
  depth: Yup.number().required(),
  from_name: Yup.string().required(),
  from_address: Yup.string().required(),
  from_location: Yup.array().of(Yup.number().required()).required(),
  to_name: Yup.string().required(),
  to_address: Yup.string().required(),
  to_location: Yup.array().of(Yup.number().required()).required(),
  active_delivery: Yup.string().optional(),
});

export type PackageDTO = Yup.InferType<typeof isPackage>;

export const isPackageID = Yup.object().shape({
  id: Yup.string().required().length(24),
});

export const isUpdatePackage = Yup.object().shape({
  description: Yup.string().optional(),
  weight: Yup.number().optional(),
  width: Yup.number().optional(),
  height: Yup.number().optional(),
  depth: Yup.number().optional(),
  from_name: Yup.string().optional(),
  from_address: Yup.string().optional(),
  from_location: Yup.array().of(Yup.number().optional()).optional(),
  to_name: Yup.string().optional(),
  to_address: Yup.string().optional(),
  to_location: Yup.array().of(Yup.number().optional()).optional(),
  active_delivery: Yup.string().optional(),
});

export type UpdatePackageDTO = Yup.InferType<typeof isUpdatePackage>;

const isPaginate = Yup.object().shape({
  limit: Yup.number().optional().min(1),
  page: Yup.number().optional().min(1),
  populate: Yup.string().optional(),
  order_by: Yup.string().optional(),
});

export const isGetPackages = isPaginate;

export type GetPackagesQuery = Yup.InferType<typeof isGetPackages>;
