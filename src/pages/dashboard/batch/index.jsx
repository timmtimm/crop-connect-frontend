import Seo from "@/components/elements/seo";
import Dashboard from "@/components/layouts/dashboard";
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import Link from "next/link";
import { GoPlus } from "react-icons/go";
import useSWR from "swr";
import { getPagination } from "@/utils/url";
import { runOnce } from "@/lib/swr";
import Loading from "@/components/modules/loading";
import { fetcher } from "@/lib/axios";
import { useEffect, useState } from "react";
import { batchStatus, roleUser } from "@/constant/constant";
import Table from "@/components/modules/table";
import { useRouter } from "next/router";
import Status, { convertStatusForBatch } from "@/components/elements/status";
import {
  dateFormatToIndonesia,
  setIfNotNone,
  setIfNotNull,
} from "@/utils/utilities";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import { Global } from "@emotion/react";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import { FaFilter } from "react-icons/fa";

const headCells = [
  {
    id: "_id",
    label: "ID",
    isSort: false,
    customDisplayRow: null,
  },
  {
    id: "commodity",
    label: "Komoditas",
    isSort: false,
    customDisplayRow: (data) => data.proposal.commodity.name,
  },
  {
    id: "proposal",
    label: "Proposal",
    isSort: false,
    customDisplayRow: (data) => data.proposal.name,
  },
  {
    id: "name",
    label: "Nama Periode",
    isSort: false,
    customDisplayRow: null,
  },
  {
    id: "estimatedHarvestDate",
    label: "Estimasi waktu panen",
    isSort: false,
    customDisplayRow: (data) =>
      dateFormatToIndonesia(data.estimatedHarvestDate),
  },
  {
    id: "isAvailable",
    label: "Tersedia",
    isSort: false,
    customDisplayRow: (data) => (data.isAvailable ? "Ya" : "Tidak"),
  },
  {
    id: "status",
    label: "Status",
    isSort: false,
    customDisplayRow: (data) => (
      <div className="flex w-full justify-center">
        <Status
          className="w-fit"
          type={convertStatusForBatch(data.status)}
          status={data.status}
        />
      </div>
    ),
  },
  {
    id: "createdAt",
    label: "Dibuat waktu",
    isSort: true,
    customDisplayRow: (data) => dateFormatToIndonesia(data.createdAt, true),
  },
];

const listStatus = [
  {
    text: "Semua Status",
    value: "none",
  },
  {
    text: "Ditanam",
    value: batchStatus.planting,
  },
  {
    text: "Panen",
    value: batchStatus.harvest,
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

  const { data, isLoading } = useSWR(
    ["/api/v1/batch", { ...pagination, ...router.query }],
    ([url, params]) => fetcher(url, params),
    runOnce
  );

  /* Drawer */
  const [open, setOpen] = useState(null);
  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const [input, setInput] = useState({
    name: "",
    status: "none",
  });

  const handleChange = ({ target: { name, value } }) => {
    setInput({ ...input, [name]: value });
  };

  const handleFilter = () => {
    const query = { ...input };
    setIfNotNull(query, "name", input.name);
    setIfNotNone(query, "status", input.status);
    router.push({
      pathname: router.pathname,
      query,
    });
  };

  const handleFilterStatus = ({ target: { value } }) => {
    let query = { ...input };
    query = setIfNotNone(query, "status", value);
    setInput(query);
  };

  useEffect(() => {
    setInput({
      name: router.query.name || "",
      status: router.query.status || "none",
    });
  }, [router.query]);

  return (
    <>
      <Seo title="Daftar Periode Penanaman" />
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
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-semibold">Filter</h2>
              <TextField
                label="Nama"
                variant="outlined"
                name="name"
                value={input.name}
                onChange={handleChange}
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
              <Button
                variant="contained"
                className="text-white bg-[#52A068] normal-case font-bold"
                onClick={() => {
                  toggleDrawer(false)();
                  handleFilter();
                }}
              >
                Terapkan
              </Button>
            </div>
          </StyledBox>
        </SwipeableDrawer>
      </Root>
      {isLoading && <Loading />}
      <Dashboard roles={roleUser.farmer}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-row justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Daftar Periode Penanaman</h1>
            <Link href={`${router.pathname}/create`}>
              <Button
                className="text-white bg-[#52A068] normal-case font-bold"
                variant="contained"
              >
                <GoPlus className="sm:mr-2" />
                <span className="hidden sm:block">Tambah Periode</span>
              </Button>
            </Link>
          </div>
          <Button
            variant="contained"
            className="w-fit text-black normal-case bg-white hover:bg-white flex md:hidden"
            onClick={toggleDrawer(true)}
          >
            <FaFilter className="text-[#52A068] mr-2" />
            Filter
          </Button>
          <div className="w-fit bg-white rounded-lg p-4 shadow-md hidden md:block">
            <h2 className="text-md font-semibold mb-2">Filter</h2>
            <div className="flex flex-row justify-between gap-4">
              <div className="flex gap-2">
                <TextField
                  label="Nama"
                  name="name"
                  variant="outlined"
                  onChange={handleChange}
                  value={input.name || ""}
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
              </div>
              <Button
                className="text-white bg-[#52A068] normal-case"
                variant="contained"
                onClick={handleFilter}
              >
                Terapkan
              </Button>
            </div>
          </div>
          {!isLoading && data.pagination && (
            <Table
              minWidth={400}
              headCells={headCells}
              data={data}
              menuAction={(data) => (
                <>
                  <Link href={`${router.pathname}/detail/${data._id}`}>
                    <MenuItem>Lihat detail</MenuItem>
                  </Link>
                </>
              )}
            />
          )}
        </div>
      </Dashboard>
    </>
  );
};
