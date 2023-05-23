import { getPagination } from "@/utils/url";
import { fetcher } from "@/lib/axios";
import { useRouter } from "next/router";
import useSWR from "swr";
import Default from "@/components/layouts/default";
import Card from "@/components/modules/card";
import Filter from "@/components/modules/filter";
import Loading from "@/components/modules/loading";
import {
  Button,
  FormControl,
  MenuItem,
  Pagination,
  Select,
} from "@mui/material";
import { useEffect, useState } from "react";
import { runOnce } from "@/lib/swr";
import { FaFilter, FaSort } from "react-icons/fa";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import { Global } from "@emotion/react";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import Seo from "@/components/elements/seo";

/* Menu */
const Root = styled("div")(({ theme }) => ({
  height: "100%",
}));

const StyledBox = styled(Box)(({ theme }) => ({
  backgroundColor: "#fff",
}));

const Puller = styled(Box)(({ theme }) => ({
  width: 30,
  height: 6,
  backgroundColor: "#52A068",
  borderRadius: 3,
  position: "relative",
  top: 8,
  left: "calc(50% - 15px)",
}));

export default () => {
  const router = useRouter();
  const pagination = getPagination();
  const queryParam = {
    ...router.query,
    ...pagination,
  };

  /* Initial */
  const fetch = {
    url:
      queryParam.searchBy == "komoditas"
        ? "/api/v1/commodity"
        : "/api/v1/user/farmer",
    params:
      queryParam.searchBy == "komoditas"
        ? {
            ...pagination,
            name: queryParam.searchQuery,
            province: queryParam.province,
            regency: queryParam.regency,
            district: queryParam.district,
            regionID: queryParam.regionID,
            minPrice: queryParam.minPrice,
            maxPrice: queryParam.maxPrice,
          }
        : {
            ...pagination,
            name: queryParam.searchQuery,
            province: queryParam.province,
            regency: queryParam.regency,
            district: queryParam.district,
            regionID: queryParam.regionID,
          },
  };

  const listSorting =
    queryParam.searchBy == "komoditas"
      ? [
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
        ]
      : [
          {
            text: "Terbaru",
            sort: "createdAt",
            order: "desc",
          },
          {
            text: "Urutan Nama A-Z",
            sort: "name",
            order: "asc",
          },
          {
            text: "Urutan Nama Z-A",
            sort: "name",
            order: "desc",
          },
        ];

  /* Drawer */
  const [open, setOpen] = useState(null);
  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  /* Fetch */
  const { data, isLoading } = useSWR(
    [fetch.url, fetch.params],
    ([url, params]) => fetcher(url, params),
    runOnce
  );

  /* Function */
  const handleChangeSorting = ({ target: { sort, order } }) => {
    setOpen(null);
    router.push({
      pathname: "/search",
      query: {
        ...router.query,
        sortBy: sort,
        orderBy: order,
      },
    });
  };

  return (
    <>
      <Seo
        title={`${
          queryParam.searchBy == "komoditas"
            ? "Cari Komoditas "
            : "Cari Petani "
        } ${queryParam.searchQuery}`}
      />
      {isLoading && <Loading />}
      <Root>
        <CssBaseline />
        <Global
          styles={{
            ".MuiDrawer-root > .MuiPaper-root": {
              height: `calc(50%)`,
              overflow: "visible",
            },
          }}
        />
        <SwipeableDrawer
          anchor="bottom"
          open={open ? true : false}
          onClose={toggleDrawer(null)}
          disableSwipeToOpen={false}
          ModalProps={{
            keepMounted: true,
          }}
        >
          <StyledBox
            sx={{
              position: "absolute",
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
              visibility: "visible",
              right: 0,
              left: 0,
            }}
          >
            <Puller />
          </StyledBox>
          <StyledBox
            sx={{
              px: 2,
              py: 3,
              height: "100%",
              overflow: "auto",
            }}
          >
            {open == "filter" && (
              <>
                <p className="text-xl font-bold mb-4">Filter</p>
                <Filter
                  type={queryParam.searchBy}
                  onSubmit={toggleDrawer(false)}
                />
              </>
            )}
            {open == "sorting" && (
              <div className="flex flex-col">
                <p className="text-xl font-bold mb-4">Urutkan berdasarkan</p>
                <FormControl className="w-full">
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
            )}
          </StyledBox>
        </SwipeableDrawer>
      </Root>
      <Default>
        <div className="flex flex-row gap-8">
          <div className="hidden lg:block">
            <h1 className="text-xl font-bold mb-4">Filter</h1>
            <div className="flex flex-col gap-4 min-w-[15rem] max-w-[24ch] bg-white rounded-xl p-4">
              <Filter type={queryParam.searchBy} />
            </div>
          </div>
          <div className="flex flex-col gap-7 w-full">
            <div className="lg:hidden bg-white w-full p-3 rounded-lg">
              <p className="font-bold mb-2">Pengaturan</p>
              <div className="flex flex-row items-center gap-4">
                <Button
                  variant="contained"
                  className="text-black normal-case hover:bg-white"
                  onClick={toggleDrawer("filter")}
                >
                  <FaFilter className="text-[#52A068] mr-2" />
                  Filter
                </Button>
                <Button
                  variant="contained"
                  className="text-black normal-case hover:bg-white"
                  onClick={toggleDrawer("sorting")}
                >
                  <FaSort className="text-[#52A068] mr-2" />
                  Urutkan berdasarkan
                </Button>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span>
                {data?.pagination.totalData}{" "}
                {queryParam.searchBy == "komoditas"
                  ? "komoditas ditemukan untuk pencarian"
                  : "petani ditemukan untuk pencarian"}{" "}
                "<span className="font-bold">{queryParam.searchQuery}</span>"
              </span>
              <div className="lg:flex flex-col lg:flex-row lg:items-center hidden">
                <span className="whitespace-nowrap mr-2 font-bold">
                  Urutkan berdasarkan
                </span>
                <FormControl className="w-32 lg:w-52">
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
            <div
              className={`gap-7 ${
                queryParam.searchBy == "komoditas"
                  ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
                  : "flex-col"
              }`}
            >
              {data?.data?.map((item) => (
                <Card
                  className="w-1/4 gap-7"
                  type={queryParam.searchBy}
                  withName
                  data={item}
                />
              ))}
            </div>
            <Pagination
              className="flex justify-center"
              count={data?.pagination.totalPage}
              page={queryParam.page || 1}
              variant="outlined"
              shape="rounded"
              onChange={(e, value) => {
                e.preventDefault();
                router.push({
                  pathname: "/search",
                  query: {
                    ...router.query,
                    page: value,
                  },
                });
              }}
            />
          </div>
        </div>
      </Default>
    </>
  );
};
