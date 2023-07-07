import Default from "@/components/layouts/default";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Seo from "@/components/elements/seo";
import {
  Button,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  TextField,
} from "@mui/material";
import { FaFilter, FaSearch } from "react-icons/fa";
import { getPagination } from "@/utils/url";
import useSWR from "swr";
import { runOnce } from "@/lib/swr";
import Loading from "@/components/modules/loading";
import { fetcher } from "@/lib/axios";
import {
  isValidDate,
  dateFormatToIndonesia,
  setIfNotNull,
  setPriceFormat,
  setIfNotNone,
} from "@/utils/utilities";
import Status, {
  convertStatusForTransaction,
} from "@/components/elements/status";
import Image from "next/image";
import Link from "next/link";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { roleUser, transactionStatus } from "@/constant/constant";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import { Global } from "@emotion/react";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";

const listStatus = [
  {
    text: "Semua Status",
    value: "none",
  },
  {
    text: "Pending",
    value: transactionStatus.pending,
  },
  {
    text: "Diterima",
    value: transactionStatus.accepted,
  },
  {
    text: "Ditolak",
    value: transactionStatus.cancel,
  },
];

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
  pagination.limit = 10;

  /* Drawer */
  const [open, setOpen] = useState(null);
  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  /* State */
  const [input, setInput] = useState({
    search: router.query.search || "",
    status: router.query.status || "none",
    startDate:
      (isValidDate(router.query.startDate) && dayjs(router.query.startDate)) ||
      null,
    endDate:
      (isValidDate(router.query.endDate) && dayjs(router.query.endDate)) ||
      null,
  });

  /* Function */
  const handleChange = ({ target: { name, value } }) => {
    setInput({ ...input, [name]: value });
  };

  const handleFilter = (e) => {
    e.preventDefault();
    let query = {};

    if (input.search) {
      query.search = input.search;
    }

    if (input.status != "none") {
      query.status = input.status;
    }

    router.push({
      pathname: "/transaction-history",
      query,
    });
  };

  const handleFilterStatus = ({ target: { value } }) => {
    let query = { ...router.query };

    query = setIfNotNone(router.query, "status", value);

    router.push({
      pathname: "/transaction-history",
      query,
    });
  };

  const handleFilterDate = ({ target: { name, value } }) => {
    let query = { ...router.query };

    if (!isValidDate(input.startDate)) {
      input.startDate = dayjs();
    }

    if (!isValidDate(input.endDate)) {
      input.endDate = dayjs();
    }

    if (name == "startDate" && value > router.query.endDate) {
      input.endDate = dayjs();
      delete query.endDate;
    }

    router.push({
      pathname: "/transaction-history",
      query: {
        ...query,
        [name]: value,
      },
    });
  };

  useEffect(() => {
    setInput({
      ...input,
      ...router.query,
    });
  }, [router.query]);

  /* Fetch */
  const setQueryparam = () => {
    let query = { ...pagination };
    query = setIfNotNull(query, "commodity", router.query.search);
    query = setIfNotNone(query, "status", router.query.status);

    if (isValidDate(router.query.startDate)) {
      query.startDate = router.query.startDate;
    }

    if (isValidDate(router.query.endDate)) {
      query.endDate = router.query.endDate;
    }

    return query;
  };

  const { data, isLoading } = useSWR(
    ["api/v1/transaction", setQueryparam()],
    ([url, params]) => fetcher(url, params),
    runOnce
  );

  return (
    <>
      <Seo title="Riwayat Transaksi" />
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
          open={open}
          onClose={toggleDrawer(false)}
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
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold">Filter</h2>
              <TextField
                name="search"
                variant="outlined"
                onChange={handleChange}
                placeholder="Cari transaksimu disini..."
                value={input.search || ""}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <FaSearch
                        className="cursor-pointer"
                        onClick={(e) => {
                          toggleDrawer(false)();
                          handleFilter(e);
                        }}
                        size={20}
                      />
                    </InputAdornment>
                  ),
                }}
                onKeyDown={(e) => {
                  if (e.keyCode === 13) {
                    toggleDrawer(false)();
                    handleFilter(e);
                  }
                }}
              />
              <FormControl className="min-w-[10rem]">
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={input.status}
                  label="Status"
                  onChange={handleChange}
                >
                  {listStatus.map((item) => (
                    <MenuItem
                      key={item.value}
                      value={item.value}
                      onClick={() => {
                        toggleDrawer(false)();
                        handleFilterStatus({
                          target: {
                            value: item.value,
                          },
                        });
                      }}
                    >
                      {item.text}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Rentang awal transaksi"
                  maxDate={dayjs()}
                  value={input.startDate ? dayjs(input.startDate) : null}
                  views={["year", "month", "day"]}
                  onChange={(newValue) => {
                    toggleDrawer(false)();
                    handleFilterDate({
                      target: {
                        name: "startDate",
                        value: dayjs(newValue).format("YYYY-MM-DD"),
                      },
                    });
                  }}
                />
                <DatePicker
                  label="Rentang akhir transaksi"
                  minDate={dayjs(input.startDate)}
                  maxDate={dayjs()}
                  value={input.endDate ? dayjs(input.endDate) : null}
                  onChange={(newValue) => {
                    toggleDrawer(false)();
                    handleFilterDate({
                      target: {
                        name: "endDate",
                        value: dayjs(newValue).format("YYYY-MM-DD"),
                      },
                    });
                  }}
                />
              </LocalizationProvider>
            </div>
          </StyledBox>
        </SwipeableDrawer>
      </Root>
      <Default isAuth={true} roles={roleUser.buyer}>
        <h1 className="text-2xl font-bold mb-4">Riwayat Transaksi</h1>
        <Button
          variant="contained"
          className="w-fit text-black normal-case bg-white hover:bg-white flex md:hidden mb-4"
          onClick={toggleDrawer(true)}
        >
          <FaFilter className="text-[#52A068] mr-2" />
          Filter
        </Button>
        <div className="flex flex-col gap-4 w-full bg-white rounded-xl p-4 shadow-md">
          <div className="hidden md:flex flex-row gap-2 mb-2">
            <TextField
              name="search"
              variant="outlined"
              onChange={handleChange}
              placeholder="Cari transaksimu disini..."
              value={input.search || ""}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <FaSearch
                      className="cursor-pointer"
                      onClick={(e) => handleFilter(e)}
                      size={20}
                    />
                  </InputAdornment>
                ),
              }}
              onKeyDown={(e) => (e.keyCode === 13 ? handleFilter(e) : null)}
            />
            <FormControl className="min-w-[10rem]">
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={input.status}
                label="Status"
                onChange={handleChange}
              >
                {listStatus.map((item) => (
                  <MenuItem
                    key={item.value}
                    value={item.value}
                    onClick={() =>
                      handleFilterStatus({
                        target: {
                          value: item.value,
                        },
                      })
                    }
                  >
                    {item.text}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Rentang awal transaksi"
                maxDate={dayjs()}
                value={input.startDate ? dayjs(input.startDate) : null}
                views={["year", "month", "day"]}
                onChange={(newValue) => {
                  handleFilterDate({
                    target: {
                      name: "startDate",
                      value: dayjs(newValue).format("YYYY-MM-DD"),
                    },
                  });
                }}
              />
              <DatePicker
                label="Rentang akhir transaksi"
                minDate={dayjs(input.startDate)}
                maxDate={dayjs()}
                value={input.endDate ? dayjs(input.endDate) : null}
                onChange={(newValue) =>
                  handleFilterDate({
                    target: {
                      name: "endDate",
                      value: dayjs(newValue).format("YYYY-MM-DD"),
                    },
                  })
                }
              />
            </LocalizationProvider>
          </div>
          {Array.isArray(data?.data) &&
            data?.data?.map((item) => (
              <Link href={`/transaction-history/${item._id}`}>
                <div className="flex flex-col w-full border-2 p-4 rounded-lg gap-2 divide-y-2">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                    <span className="text-lg font-bold">
                      {item.commodity.farmer.name}
                    </span>
                    <div className="flex flex-row gap-x-2 items-center">
                      <span>
                        {item._id} -{" "}
                        {dateFormatToIndonesia(item.createdAt, true)}
                      </span>
                      <Status
                        type={convertStatusForTransaction(item.status)}
                        status={item.status}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex-1 flex md:flex-row gap-x-2 mt-2">
                      <div className="pr-[10%] min-w-[100px] relative">
                        <Image
                          className="rounded-lg"
                          src={
                            item.commodity?.imageURLs[0]
                              ? item.commodity?.imageURLs[0]
                              : "/logo-no-background.png"
                          }
                          fill
                          style={{ objectFit: "cover" }}
                          alt={"Gambar" + item.commodity.name}
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold">{item.commodity.name}</span>
                        <span>
                          Estimasi berat panen{" "}
                          {item.proposal.estimatedTotalHarvest} kg
                        </span>
                        <span>
                          {setPriceFormat(item.commodity.pricePerKg)} / kilogram
                        </span>
                      </div>
                    </div>
                    <div className="text-right mt-4">
                      <span className="mr-2">Total Pembayaran</span>
                      <span className="font-bold">
                        {setPriceFormat(item.totalPrice)}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          <Pagination
            className="flex justify-center"
            count={data?.pagination.totalPage}
            page={pagination.page}
            variant="outlined"
            shape="rounded"
            onChange={(e, value) => {
              e.preventDefault();
              router.push({
                pathname: "/transaction-history",
                query: {
                  ...router.query,
                  page: value,
                },
              });
            }}
          />
        </div>
      </Default>
    </>
  );
};
