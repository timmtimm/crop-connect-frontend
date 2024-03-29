import Default from "@/components/layouts/default";
import { fetcher, get, triggerfetcher } from "@/lib/axios";
import { getPagination } from "@/utils/url";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { dateFormatToIndonesia } from "@/utils/utilities";
import Loading from "@/components/modules/loading";
import { FormControl, MenuItem, Pagination, Select } from "@mui/material";
import Card from "@/components/modules/card";
import useSWR from "swr";
import { runOnce } from "@/lib/swr";
import Seo from "@/components/elements/seo";
import useSWRMutation from "swr/mutation";
import { FiInfo } from "react-icons/fi";
import { GrNotes } from "react-icons/gr";
import { AiOutlineContacts } from "react-icons/ai";
import NotFound from "@/components/templates/notFound";

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

  /* Function */
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

  /* Fetch */
  const { data: farmerCommodity, isLoading: commodityLoading } = useSWR(
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
  const {
    data: dataTotalProposal,
    trigger: triggerTotalProposal,
    isMutating: mutatingTotalProposal,
  } = useSWRMutation(
    `/api/v1/proposal/farmer-total/${queryParam.id}`,
    triggerfetcher
  );

  useEffect(() => {
    if (!profileFarmer?.data?._id) return;
    triggerTotalProposal();
  }, [profileFarmer?.data?._id]);

  return (
    <>
      <Seo
        title={
          profileLoading
            ? "Loading..."
            : profileFarmer?.data?.name
            ? `Petani ${profileFarmer?.data?.name}`
            : "Petani Tidak Ditemukan"
        }
      />
      {profileLoading || (commodityLoading && <Loading />)}
      <Default>
        {!profileLoading && !profileFarmer?.data?._id && (
          <NotFound content="Petani" redirectPageTitle="utama" />
        )}
        {!profileLoading && profileFarmer?.data?._id && (
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4 bg-white rounded-xl shadow-md px-7 py-4">
              <span className="text-2xl font-bold">
                {profileFarmer?.data?.name}
              </span>
              <div className="flex lg:flex-row gap-2 lg:divide-x-2 lg:divide-y-0 flex-col divide-y-2 divide-black">
                <div className="flex flex-col w-full">
                  <div className="flex flex-row items-center gap-2 mb-2">
                    <FiInfo size={20} />
                    <span className="text-xl font-bold">Informasi</span>
                  </div>
                  <span>
                    Bergabung sejak{" "}
                    {dateFormatToIndonesia(profileFarmer?.data?.createdAt)}
                  </span>
                  <span>
                    Komoditas: {farmerCommodity?.pagination?.totalData} jenis
                  </span>
                  <span>
                    Proposal: {JSON.stringify(dataTotalProposal?.data)} proposal
                  </span>
                </div>
                <div className="w-full">
                  <div className="flex flex-col lg:ml-4 lg:mt-0 mt-2">
                    <div className="flex flex-row items-center gap-2 mb-2">
                      <GrNotes size={20} />
                      <span className="text-xl font-bold">Deskripsi</span>
                    </div>
                    <p>{profileFarmer?.data.description}</p>
                  </div>
                </div>
                <div className="w-full">
                  <div className="flex flex-col lg:ml-4 lg:mt-0 mt-2">
                    <div className="flex flex-row items-center gap-2 mb-2">
                      <AiOutlineContacts size={20} />
                      <span className="text-xl font-bold">Kontak</span>
                    </div>
                    <span>Email: {profileFarmer?.data.email}</span>
                    <span>
                      Nomor telepon: {profileFarmer?.data.phoneNumber}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-y-4">
              <div className="flex flex-col gap-7 w-full">
                <div className="flex justify-between md:items-center">
                  <span className="text-2xl font-bold">Komoditas</span>
                  <div className="flex flex-col md:flex-row md:items-center">
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
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 lg:gap-7">
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
        )}
      </Default>
    </>
  );
};
