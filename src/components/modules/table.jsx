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
import { BsThreeDots } from "react-icons/bs";
import { useRouter } from "next/router";
import { getPagination, getUniquePagination } from "@/utils/url";
import { useState } from "react";
import { Menu } from "@mui/material";

function EnhancedTableHead(props) {
  const { headCells, order, orderBy, onRequestSort, canAction } = props;
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
        {canAction && (
          <TableCell align="center" padding="normal">
            <TableCell
              className="border-0 p-0 flex justify-center"
              align="center"
              padding="normal"
            >
              Aksi
            </TableCell>
          </TableCell>
        )}
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

export default (props) => {
  const { minWidth, data, headCells, menuAction, uniqueKeyPagination } = props;
  const router = useRouter();

  let pagination = {};

  if (uniqueKeyPagination) {
    pagination = getUniquePagination(uniqueKeyPagination);
  } else {
    pagination = getPagination();
  }

  /* Menu */
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event, i) => {
    setChoosenMenuIndex(i);
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const [choosenMenuIndex, setChoosenMenuIndex] = useState(0);

  /* Function */
  const handleRequestSort = (event, property) => {
    const isAsc = pagination.sort === property && pagination.order === "asc";
    let query = {
      ...router.query,
    };
    if (uniqueKeyPagination) {
      query = {
        ...query,
        [`sortBy-${uniqueKeyPagination}`]: property,
        [`orderBy-${uniqueKeyPagination}`]: isAsc ? "desc" : "asc",
      };
    } else {
      query = {
        ...query,
        sortBy: property,
        orderBy: isAsc ? "desc" : "asc",
      };
    }

    router.push({
      pathname: router.pathname,
      query,
    });
  };

  const handleChangePage = (event, newPage) => {
    let query = {
      ...router.query,
    };
    if (uniqueKeyPagination) {
      query = {
        ...query,
        [`page-${uniqueKeyPagination}`]: newPage + 1,
      };
    } else {
      query = {
        ...query,
        page: newPage + 1,
      };
    }

    router.push({
      pathname: router.pathname,
      query,
    });
  };

  const handleChangeRowsPerPage = (event) => {
    let query = {
      ...router.query,
    };

    if (uniqueKeyPagination) {
      query = {
        ...query,
        [`limit-${uniqueKeyPagination}`]: event.target.value,
      };
    } else {
      query = {
        ...query,
        limit: event.target.value,
      };
    }

    router.push({
      pathname: router.pathname,
      query,
    });
  };

  const setDisplayRow = (data, headCell) =>
    headCell.customDisplayRow
      ? headCell.customDisplayRow(data)
      : data[headCell.id];

  return (
    <div className="overflow-auto w-full table table-fixed">
      <Menu
        className="mt-3"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        {menuAction &&
          Array.isArray(data.data) &&
          data.data.length > 0 &&
          menuAction(data.data[choosenMenuIndex])}
      </Menu>
      <Box sx={{ width: "100%" }}>
        <Paper sx={{ width: "100%", mb: 2 }}>
          <TableContainer>
            <Table
              sx={{ minWidth: minWidth }}
              aria-labelledby="tableTitle"
              size={"medium"}
            >
              <EnhancedTableHead
                order={pagination.order || "desc"}
                orderBy={pagination.sort || "createdAt"}
                onRequestSort={handleRequestSort}
                rowCount={data.pagination.totalData}
                headCells={headCells}
                canAction={menuAction ? true : false}
              />
              <TableBody>
                {Array.isArray(data?.data) &&
                  data.data.map((data, index1) => (
                    <TableRow
                      className="cursor-default"
                      hover
                      role="checkbox"
                      key={data.name}
                    >
                      {headCells.map((headCell, index2) => {
                        let dataRow;
                        if (headCell.customDisplayRow) {
                          dataRow = data[headCell.customDisplayRow];
                        } else {
                          dataRow = data[headCell.id];
                        }

                        return index2 == 0 ? (
                          <TableCell
                            component="th"
                            id={data._id}
                            scope="row"
                            align="center"
                          >
                            {setDisplayRow(data, headCell)}
                          </TableCell>
                        ) : (
                          <TableCell scope="row" align="center">
                            {setDisplayRow(data, headCell)}
                          </TableCell>
                        );
                      })}
                      {menuAction ? (
                        <TableCell scope="row" align="center">
                          <div className="w-full flex justify-center">
                            <div className="hover:bg-gray-200 rounded-lg p-1 w-fit">
                              <BsThreeDots
                                className="cursor-pointer"
                                onClick={(e) => handleClick(e, index1)}
                              />
                            </div>
                          </div>
                        </TableCell>
                      ) : null}
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 20, 25]}
            component="div"
            count={data?.pagination?.totalData}
            rowsPerPage={pagination.limit}
            page={pagination.page - 1}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </Box>
    </div>
  );
};
