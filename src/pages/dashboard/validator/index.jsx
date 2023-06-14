import Seo from "@/components/elements/seo";
import Dashboard from "@/components/layouts/dashboard";
import {
  Alert,
  Button,
  Menu,
  MenuItem,
  Slide,
  Snackbar,
  TextField,
} from "@mui/material";
import Link from "next/link";
import { GoPlus } from "react-icons/go";
import useSWR from "swr";
import { getPagination } from "@/utils/url";
import { runOnce } from "@/lib/swr";
import Loading from "@/components/modules/loading";
import { Delete, fetcher } from "@/lib/axios";
import { useEffect, useState } from "react";
import { roleUser } from "@/constant/constant";
import { HttpStatusCode } from "axios";
import Table from "@/components/modules/table";
import { useRouter } from "next/router";
import { dateFormatToIndonesia, setIfNotNull } from "@/utils/utilities";
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
    customDisplayRow: null,
  },
  {
    id: "name",
    label: "Nama",
    isSort: true,
    customDisplayRow: null,
  },
  {
    id: "email",
    label: "Email",
    isSort: true,
    customDisplayRow: null,
  },
  {
    id: "phoneNumber",
    label: "Nomor handphone",
    isSort: true,
    customDisplayRow: null,
  },
  {
    id: "province",
    label: "Provinsi",
    customDisplayRow: (data) => data.region.province,
  },
  {
    id: "regency",
    label: "Kabupaten",
    customDisplayRow: (data) => data.region.regency,
  },
  {
    id: "district",
    label: "Kecamatan",
    customDisplayRow: (data) => data.region.district,
  },
  {
    id: "subdistrict",
    label: "Kelurahan",
    customDisplayRow: (data) => data.region.subdistrict,
  },
  {
    id: "createdAt",
    label: "Dibuat waktu",
    isSort: true,
    customDisplayRow: (data) => dateFormatToIndonesia(data.createdAt, true),
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

  /* Drawer */
  const [open, setOpen] = useState(null);
  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const { data, isLoading } = useSWR(
    [
      "/api/v1/user",
      { ...pagination, ...router.query, role: roleUser.validator },
    ],
    ([url, params]) => fetcher(url, params),
    runOnce
  );

  const [input, setInput] = useState({
    name: "",
    email: "",
    phoneNumber: "",
  });

  const handleChange = ({ target: { name, value } }) => {
    setInput({ ...input, [name]: value });
  };

  const handleFilter = () => {
    const query = { ...input };
    setIfNotNull(query, "name", input.name);
    setIfNotNull(query, "email", input.email);
    setIfNotNull(query, "phoneNumber", input.phoneNumber);
    router.push({
      pathname: router.pathname,
      query,
    });
  };

  useEffect(() => {
    setInput({
      name: router.query.name || "",
      email: router.query.email || "",
      phoneNumber: router.query.phoneNumber || "",
    });
  }, [router.query]);

  return (
    <>
      <Seo title="Daftar Validator" />
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
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-semibold">Filter</h2>
              <TextField
                label="Nama"
                variant="outlined"
                name="name"
                value={input.name}
                onChange={handleChange}
              />
              <TextField
                label="Email"
                variant="outlined"
                name="email"
                value={input.email}
                onChange={handleChange}
              />
              <TextField
                type="number"
                label="Nomor handphone"
                variant="outlined"
                name="phoneNumber"
                value={input.phoneNumber}
                onChange={handleChange}
              />
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
      <Dashboard roles={roleUser.admin}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-row justify-between items-center">
            <h1 className="text-2xl font-bold">Daftar Validator</h1>
            <Link href={`${router.pathname}/create`}>
              <Button
                className="text-white bg-[#52A068] normal-case font-bold"
                variant="contained"
              >
                <GoPlus className="sm:mr-2" />
                <span className="hidden sm:block">Tambah Validator</span>
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
                <TextField
                  label="Email"
                  name="email"
                  variant="outlined"
                  onChange={handleChange}
                  value={input.email || ""}
                />
                <TextField
                  type="number"
                  label="Nomor handphone"
                  name="phoneNumber"
                  variant="outlined"
                  onChange={handleChange}
                  value={input.phoneNumber || ""}
                />
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
          {!isLoading && data.data && (
            <Table
              minWidth={400}
              headCells={headCells}
              data={data}
              menuAction={(data) => (
                <Link href={`${router.pathname}/detail/${data._id}`}>
                  <MenuItem>Lihat Detail</MenuItem>
                </Link>
              )}
            />
          )}
        </div>
      </Dashboard>
    </>
  );
};
