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
});

export type PackageDTO = Yup.InferType<typeof isPackage>;

export const isPackageID = Yup.object().shape({
  id: Yup.string().required().length(24),
});
