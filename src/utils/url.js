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
  const router = useRouter();

  return {
    page:
      router.query[`page-${uniqueKey}`] &&
      !isNaN(router.query[`page-${uniqueKey}`])
        ? parseInt(router.query[`page-${uniqueKey}`])
        : 1,
    limit:
      router.query[`limit-${uniqueKey}`] &&
      !isNaN(router.query[`limit-${uniqueKey}`])
        ? parseInt(router.query[`limit-${uniqueKey}`])
        : 20,
    sort: router.query[`sortBy-${uniqueKey}`]
      ? router.query[`sortBy-${uniqueKey}`]
      : "createdAt",
    order: router.query[`orderBy-${uniqueKey}`]
      ? router.query[`orderBy-${uniqueKey}`]
      : "desc",
  };
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
