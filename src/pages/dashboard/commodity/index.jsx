import Seo from "@/components/elements/seo";
import Dashboard from "@/components/layouts/dashboard";
import { Button, Menu, MenuItem } from "@mui/material";
import Link from "next/link";
import { GoPlus } from "react-icons/go";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Paper from "@mui/material/Paper";
import { visuallyHidden } from "@mui/utils";
import { useRouter } from "next/router";
import useSWR from "swr";
import { getPagination } from "@/utils/url";
import { runOnce } from "@/lib/swr";
import Loading from "@/components/modules/loading";
import { Delete, fetcher } from "@/lib/axios";
import { dateFormatToIndonesia, setPriceFormat } from "@/utils/utilities";
import { useEffect, useState } from "react";
import { roleUser } from "@/constant/constant";
import { BsThreeDots } from "react-icons/bs";
import { HttpStatusCode } from "axios";

const headCells = [
  {
    id: "name",
    numeric: false,
    label: "Nama",
    isSort: true,
  },
  {
    id: "plantingPeriod",
    numeric: true,
    label: "Jangka waktu penanaman",
    isSort: true,
  },
  {
    id: "pricePerKg",
    numeric: true,
    label: "Harga per kilogram",
    isSort: true,
  },
  {
    id: "isAvailable",
    numeric: false,
    label: "Status",
    isSort: true,
  },
  {
    id: "createdAt",
    numeric: false,
    label: "Dibuat waktu",
    isSort: true,
  },
  {
    id: "action",
    numeric: false,
    label: "Tindakan",
    isSort: false,
  },
];

function EnhancedTableHead(props) {
  const { order, orderBy, isSort, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align="center"
            padding="normal"
            sortDirection={orderBy === headCell.id ? order : false}
          >
            {headCell.isSort ? (
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : "asc"}
                onClick={createSortHandler(headCell.id)}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order === "desc"
                      ? "sorted descending"
                      : "sorted ascending"}
                  </Box>
                ) : null}
              </TableSortLabel>
            ) : (
              <TableCell className="border-0 p-0 flex justify-center">
                {headCell.label}
              </TableCell>
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.oneOf(["asc", "desc"]).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

export default () => {
  const router = useRouter();
  const pagination = getPagination();

  /* Menu */
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const [input, setInput] = useState({
    ...pagination,
    page: pagination.page - 1,
  });
  const [error, setError] = useState({
    message: "",
  });

  const { data, isLoading, mutate } = useSWR(
    ["/api/v1/commodity", { ...pagination }],
    ([url, params]) => fetcher(url, params),
    runOnce
  );

  const handleRequestSort = (event, property) => {
    const isAsc = input.sort === property && input.order === "asc";
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        sortBy: property,
        orderBy: isAsc ? "desc" : "asc",
      },
    });
  };

  const handleChangePage = (event, newPage) => {
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        page: newPage + 1,
      },
    });
  };

  const handleChangeRowsPerPage = (event) => {
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        limit: event.target.value,
      },
    });
  };

  const handleDelete = async (e, id) => {
    e.preventDefault();
    const dataDelete = await Delete(`/api/v1/commodity/${id}`);
    if (dataDelete.status == HttpStatusCode.Ok) {
      mutate();
    } else {
      setError({
        message: dataDelete.message,
      });
    }
  };

  useEffect(() => {
    setInput({
      ...pagination,
      page: pagination.page - 1,
    });
  }, [router.query]);

  if (isLoading) return <Loading />;

  return (
    <>
      <Seo title="Daftar Komoditas Petani" />
      <Dashboard roles={roleUser.farmer}>
        <div className="flex flex-row justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Daftar Komoditas</h1>
          <Link href="/dashboard/commodity/create">
            <Button
              className="text-white bg-[#52A068] normal-case font-bold"
              variant="contained"
            >
              <GoPlus className="sm:mr-2" />
              <span className="hidden sm:block">Tambah komoditas</span>
            </Button>
          </Link>
        </div>
        <div className="overflow-auto w-full table table-fixed">
          <Box sx={{ width: "100%" }}>
            <Paper sx={{ width: "100%", mb: 2 }}>
              <TableContainer>
                <Table
                  sx={{ minWidth: 400 }}
                  aria-labelledby="tableTitle"
                  size={"medium"}
                >
                  <EnhancedTableHead
                    order={input.order || "desc"}
                    orderBy={input.sort || "createdAt"}
                    onRequestSort={handleRequestSort}
                    rowCount={data.pagination.totalData}
                  />
                  <TableBody>
                    {Array.isArray(data.data) &&
                      data.data?.map((data) => {
                        return (
                          <TableRow
                            className="cursor-default"
                            hover
                            role="checkbox"
                            key={data.name}
                          >
                            <TableCell
                              component="th"
                              id={data._id}
                              scope="row"
                              padding="none"
                              align="center"
                            >
                              {data.name}
                            </TableCell>
                            <TableCell align="center">
                              {data.plantingPeriod} hari
                            </TableCell>
                            <TableCell align="center">
                              {setPriceFormat(data.pricePerKg)}
                            </TableCell>
                            <TableCell align="center">
                              {data.isAvailable ? "Tersedia" : "Tidak tersedia"}
                            </TableCell>
                            <TableCell align="center">
                              {dateFormatToIndonesia(data.createdAt, true)}
                            </TableCell>
                            <TableCell
                              className="flex justify-center"
                              align="center"
                            >
                              <div className="hover:bg-gray-200 rounded-lg p-1 w-fit">
                                <BsThreeDots
                                  className="cursor-pointer"
                                  onClick={handleClick}
                                />
                              </div>
                              <Menu
                                className="mt-3"
                                anchorEl={anchorEl}
                                open={open}
                                onClose={handleClose}
                              >
                                <Link
                                  href={`/dashboard/commodity/edit/${data._id}`}
                                >
                                  <MenuItem>Ubah</MenuItem>
                                </Link>
                                <MenuItem
                                  onClick={(e) => handleDelete(e, data._id)}
                                >
                                  Hapus
                                </MenuItem>
                              </Menu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[10, 20, 25]}
                component="div"
                count={data.pagination.totalData}
                rowsPerPage={input.limit}
                page={input.page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Paper>
          </Box>
        </div>
      </Dashboard>
    </>
  );
};
