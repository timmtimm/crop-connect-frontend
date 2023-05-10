import Default from "@/components/layouts/default";
import { fetcher, get } from "@/lib/axios";
import { getPagination } from "@/utils/url";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import profile from "../profile";
import { dateFormatToIndonesia } from "@/utils/utilities";
import Loading from "@/components/elements/loading";
import { FormControl, MenuItem, Pagination, Select } from "@mui/material";
import Card from "@/components/elements/card";
import useSWR from "swr";
import { runOnce } from "@/lib/swr";
import Seo from "@/components/elements/seo";

const listSorting = [
  {
    text: "Terbaru",
    sort: "createdAt",
    order: "desc",
  },
  {
    text: "Harga Terendah",
    sort: "pricePerKg",
    order: "asc",
  },
  {
    text: "Harga Tertinggi",
    sort: "pricePerKg",
    order: "desc",
  },
  {
    text: "Masa Panen Tercepat",
    sort: "plantingPeriod",
    order: "asc",
  },
];

const setQueryParamWithoutID = (queryParam) => {
  const { id, ...rest } = queryParam;
  return rest;
};

export default () => {
  const router = useRouter();
  const pagination = getPagination();
  const queryParam = router.query;

  const {
    data: farmerCommodity,
    error: commmodityError,
    isLoading: commodityLoading,
  } = useSWR(
    [
      "/api/v1/commodity",
      {
        ...pagination,
        farmerID: queryParam.id,
      },
    ],
    ([url, params]) => {
      if (!queryParam.id) return;
      return fetcher(url, params);
    },
    runOnce
  );

  const { data: profileFarmer, isLoading: profileLoading } = useSWR(
    [`/api/v1/user/farmer/${queryParam.id}`, {}],
    ([url, params]) => {
      if (!queryParam.id) return;
      return fetcher(url, params);
    },
    runOnce
  );

  const handleChangeSorting = ({ target: { sort, order } }) => {
    router.push({
      pathname: `/farmer/${queryParam.id}`,
      query: {
        ...setQueryParamWithoutID(queryParam),
        sortBy: sort,
        orderBy: order,
      },
    });
  };

  return (
    <>
      <Seo title={`Petani ${profileFarmer?.data?.name}`} />
      {profileLoading || commodityLoading ? <Loading /> : <></>}
      <Default>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4 bg-white rounded-xl px-7 py-4">
            <span className="text-2xl font-bold">
              {profileFarmer?.data?.name}
            </span>
            <div className="flex lg:flex-row gap-2 lg:divide-x-2 lg:divide-y-0 flex-col divide-y-2">
              <div className="flex flex-col w-full">
                <span className="text-xl font-bold mb-2">Informasi</span>
                <span>
                  Bergabung sejak{" "}
                  {dateFormatToIndonesia(profileFarmer?.data?.createdAt)}
                </span>
                <span>
                  Komoditas: {farmerCommodity?.pagination?.totalData} jenis
                </span>
                <span>Proposal: belom implement</span>
                <span>Transaksi: belom implement</span>
              </div>
              <div className="w-full">
                <div className="flex flex-col lg:ml-4 lg:mt-0 mt-2">
                  <span className="text-xl font-bold mb-2">Deskripsi</span>
                  <p>{profileFarmer?.data.description}</p>
                </div>
              </div>
              <div className="w-full">
                <div className="flex flex-col lg:ml-4 lg:mt-0 mt-2">
                  <span className="text-xl font-bold mb-2">Kontak</span>
                  <span>Email: {profileFarmer?.data.email}</span>
                  <span>Nomor telepon: {profileFarmer?.data.phoneNumber}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-y-4">
            <span className="text-2xl font-bold">Komoditas</span>
            <div className="flex flex-col gap-7 w-full">
              <div className="flex justify-end items-center">
                <div className="flex items-center">
                  <span className="whitespace-nowrap mr-2 font-bold">
                    Urutkan berdasarkan
                  </span>
                  <FormControl className="w-52">
                    <Select
                      className="bg-white"
                      value={
                        listSorting?.find(
                          (item) =>
                            item.sort == queryParam.sortBy &&
                            item.order == queryParam.orderBy
                        )?.text || listSorting[0].text
                      }
                      inputProps={{
                        className: "py-3",
                      }}
                    >
                      {listSorting?.map((item) => (
                        <MenuItem
                          key={item.value}
                          value={item.text}
                          sort={item.sort}
                          order={item.order}
                          onClick={() =>
                            handleChangeSorting({
                              target: {
                                sort: item.sort,
                                order: item.order,
                              },
                            })
                          }
                        >
                          {item.text}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
              </div>
              <div className="flex flex-wrap flex-row gap-7">
                {farmerCommodity?.data?.map((item) => (
                  <Card
                    className="gap-7"
                    type="komoditas"
                    withName={false}
                    data={item}
                  />
                ))}
              </div>
              <Pagination
                className="flex justify-center"
                count={farmerCommodity?.pagination.totalPage}
                page={pagination.page || 1}
                variant="outlined"
                shape="rounded"
                onChange={(e, value) =>
                  router.push({
                    pathname: `/farmer/${queryParam.id}`,
                    query: {
                      ...setQueryParamWithoutID(queryParam),
                      page: value,
                    },
                  })
                }
              />
            </div>
          </div>
        </div>
        {/* <span>{JSON.stringify(commmodityError)}</span> */}
      </Default>
    </>
  );
};
