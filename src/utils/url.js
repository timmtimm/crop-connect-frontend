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
