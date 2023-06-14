import axiosInstance from "@/lib/axios";
import { useRouter } from "next/router";

export const getPagination = () => {
  const router = useRouter();
  const { page, limit, sortBy, orderBy } = router.query;
  return {
    page: page && !isNaN(page) ? parseInt(page) : 1,
    limit: limit && !isNaN(limit) ? parseInt(limit) : 20,
    sort: sortBy ? sortBy : "createdAt",
    order: orderBy ? orderBy : "desc",
  };
};

export const getUniquePagination = (uniqueKey) => {
  const query = useRouter().query;

  return {
    page:
      query[`page-${uniqueKey}`] && !isNaN(query[`page-${uniqueKey}`])
        ? parseInt(query[`page-${uniqueKey}`])
        : 1,
    limit:
      query[`limit-${uniqueKey}`] && !isNaN(query[`limit-${uniqueKey}`])
        ? parseInt(query[`limit-${uniqueKey}`])
        : 20,
    sort: query[`sortBy-${uniqueKey}`]
      ? query[`sortBy-${uniqueKey}`]
      : "createdAt",
    order: query[`orderBy-${uniqueKey}`]
      ? query[`orderBy-${uniqueKey}`]
      : "desc",
  };
};

export const deleteUniquePagination = (router, uniqueKey) => {
  const query = router.query;

  delete query[`page-${uniqueKey}`];
  delete query[`limit-${uniqueKey}`];
  delete query[`sortBy-${uniqueKey}`];
  delete query[`orderBy-${uniqueKey}`];

  return query;
};

export const setParamRegionFetch = (input, region) => {
  switch (region) {
    case "province":
      return {
        country: input.country,
        province: input.province,
      };
    case "regency":
      return {
        country: input.country,
        province: input.province,
      };
    case "district":
      return {
        country: input.country,
        province: input.province,
        regency: input.regency,
      };
    case "subdistrict":
      return {
        country: input.country,
        province: input.province,
        regency: input.regency,
        district: input.district,
      };
    default:
      return {};
  }
};
