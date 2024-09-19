import { Model } from 'mongoose';

/**
 * Paginates a mongoose model, with optional sorting, selection and population.
 *
 * @param filter The filter to apply to the query
 * @param schema The mongoose schema to query
 * @param options A set of options to customize the query
 * @param options.limit The number of items per page
 * @param options.page The page number to query
 * @param options.order_by A comma-separated list of fields to sort the query by
 * @param options.select A comma-separated list of fields to select in the query
 * @param options.populate A comma-separated list of fields to populate
 *
 * @returns A promise that resolves to a PaginationModel, which contains the
 * result of the query, the current page, the limit, the total number of pages
 * and the total number of items.
 */
export const paginate = async function <T, K>(
  filter: K,
  schema: Model<T>,
  options?: Partial<PaginationOptions>,
): Promise<PaginationModel<T>> {
  let sort = '';

  if (options?.order_by) {
    const sortingCriteria: string[] = [];
    options.order_by.split(',').forEach((sortOption: string) => {
      const [key, order] = sortOption.split(':');
      sortingCriteria.push((order === 'desc' ? '-' : '') + key);
    });
    sort = sortingCriteria.join(' ');
  } else {
    sort = 'created_at';
  }

  const limit = options?.limit && parseInt(options?.limit, 10) > 0 ? parseInt(options.limit, 10) : 10;
  const page = options?.page && parseInt(options?.page, 10) > 0 ? parseInt(options.page, 10) : 1;
  const skip = (page - 1) * limit;

  const count = await schema?.countDocuments();
  let doc = schema.find(filter).sort(sort).skip(skip).limit(limit).select(options?.select);

  if (options?.populate) {
    options.populate.split(',').forEach((populateOption: string) => {
      doc = doc.populate(populateOption);
    });
  }

  const docPromise = await doc.exec();

  return Promise.all([count, docPromise]).then((values) => {
    const [totalData, data] = values;
    const totalPages = Math.ceil(totalData / limit);
    const result = {
      result: data,
      page,
      limit,
      total_pages: totalPages,
      total_data: totalData,
    };
    return Promise.resolve(result);
  });
};

export interface PaginationModel<T> {
  total_data: number | undefined;
  limit: number | undefined;
  total_pages: number | undefined;
  page: number | undefined;
  result: T[];
}

export interface PaginationOptions {
  limit: string;
  page: string;
  order_by: string;
  select: string;
  populate: string;
}
