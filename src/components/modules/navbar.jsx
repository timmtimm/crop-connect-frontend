import {
  Button,
  FormControl,
  FormGroup,
  InputAdornment,
  Menu,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { FaSearch, FaUserCircle } from "react-icons/fa";
import { useProfileUser } from "@/context/profileUserContext";
import Loading from "./loading";
import { roleUser } from "@/constant/constant";
import { FiMenu } from "react-icons/fi";

const listSearchBy = [
  {
    text: "Komoditas",
    value: "komoditas",
    placeholder: "Cari komoditas pertanian yang segar disini...",
  },
  {
    text: "Petani",
    value: "petani",
    placeholder: "Cari petani yang terpercaya disini...",
  },
];

export default () => {
  const router = useRouter();

  const { profileUser, isLoadingProfile, logout } = useProfileUser();
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState({
    searchBy: router.query?.searchBy || listSearchBy[0].value,
    searchQuery: router.query?.searchQuery || "",
  });
  const [placeholder, setPlaceholder] = useState(listSearchBy[0].placeholder);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleChange = ({ target: { name, value } }) => {
    if (name == "searchBy") {
      setPlaceholder(
        listSearchBy.find((item) => item.value === value).placeholder
      );
      setInput({ ...input, [name]: value, searchQuery: "" });
    } else {
      setInput({ ...input, [name]: value });
    }
  };

  const handleLogout = () => {
    setIsLoading(true);
    setAnchorEl(null);
    router.push("/");
    logout();
    setIsLoading(false);
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSearch = (e) => {
    e.preventDefault();

    if (input.searchQuery) {
      router.push({
        pathname: "/search",
        query: {
          page: 1,
          searchBy: input.searchBy,
          searchQuery: input.searchQuery,
        },
      });
    }
  };

  const setRedirect = () => {
    if (router.asPath == "/") {
      return {};
    } else {
      return {
        redirect: JSON.stringify({
          pathname: router.pathname,
          query: router.query,
        }),
      };
    }
  };

  useEffect(() => {
    setInput({
      searchBy: router.query?.searchBy || listSearchBy[0].value,
      searchQuery: router.query?.searchQuery || "",
    });
  }, [router.query.searchBy]);

  return (
    <>
      {(isLoadingProfile || isLoading) && <Loading />}
      <nav className="bg-[#52A068]">
        <div className="container mx-auto my-auto py-4">
          <div className="flex items-center justify-between flex-nowrap gap-2 sm:gap-4 md:gap-6 lg:gap-14 mx-2">
            <div className="max-h-full">
              <Link href="/">
                <Image
                  // className="hidden md:block"
                  src="/logo.svg"
                  width={60}
                  height={60}
                  alt="Logo Crop Connect"
                ></Image>
              </Link>
            </div>
            <FormControl className="flex-auto">
              <FormGroup className="flex items-center flex-row flex-nowrap">
                <Select
                  inputProps={{
                    className: "py-3",
                  }}
                  variant="outlined"
                  value={input.searchBy}
                  name="searchBy"
                  onChange={handleChange}
                  className="font-bold sm:min-w-[9rem] max-w-[4rem] bg-white rounded-lg rounded-r-none text-sm md:text-base focus:border-0 hover:border-0"
                >
                  {listSearchBy.map((item) => {
                    return (
                      <MenuItem
                        key={item.value}
                        value={item.value}
                        className="font-bold"
                      >
                        {item.text}
                      </MenuItem>
                    );
                  })}
                </Select>
                <TextField
                  placeholder={placeholder}
                  variant="outlined"
                  className="lg:min-w-[22rem] w-full"
                  name="searchQuery"
                  required
                  InputProps={{
                    className:
                      "bg-white rounded-lg rounded-l-none text-sm md:text-base focus:border-0 hover:border-0",
                    endAdornment: (
                      <InputAdornment position="end">
                        <FaSearch
                          className="cursor-pointer"
                          onClick={(e) => handleSearch(e)}
                          size={20}
                        />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ "& input": { padding: "0.75rem" } }}
                  value={input.searchQuery}
                  onChange={handleChange}
                  onKeyDown={(e) => (e.keyCode === 13 ? handleSearch(e) : null)}
                />
              </FormGroup>
            </FormControl>
            {profileUser?.name ? (
              <div>
                <div
                  className="flex flex-row items-center bg-white rounded-lg p-3 cursor-pointer max-w-[12rem] sm:mr-0"
                  id="basic-button"
                  aria-controls={open ? "basic-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? "true" : undefined}
                  onClick={handleClick}
                >
                  <FaUserCircle className="lg:mr-2" size={25} />
                  <span className="font-semibold text-gray-500 hidden lg:flex">
                    Hi,{" "}
                  </span>
                  <span className="font-semibold text-gray-500 hidden lg:flex truncate">
                    {profileUser.name}
                  </span>
                </div>
                <Menu
                  className="mt-3"
                  id="basic-menu"
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                  MenuListProps={{
                    "aria-labelledby": "basic-button",
                  }}
                >
                  <Link href="/profile">
                    <MenuItem onClick={handleClose}>Pengaturan akun</MenuItem>
                  </Link>
                  {profileUser.role == roleUser.buyer ? (
                    <Link href="/transaction-history">
                      <MenuItem onClick={handleClose}>
                        Riwayat transaksi
                      </MenuItem>
                    </Link>
                  ) : (
                    <Link href="/dashboard">
                      <MenuItem onClick={handleClose}>Dashboard</MenuItem>
                    </Link>
                  )}
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
              </div>
            ) : (
              <>
                <div className="sm:flex gap-2 hidden sm:mr-0">
                  <Link
                    href={{
                      pathname: "/login",
                      query: setRedirect(),
                    }}
                  >
                    <Button
                      className="border-white text-white font-bold hover:border-white"
                      variant="outlined"
                    >
                      Masuk
                    </Button>
                  </Link>
                  <Link
                    href={{
                      pathname: "/register",
                      query: setRedirect(),
                    }}
                  >
                    <Button
                      className="bg-white text-[#52A068] font-bold hover:bg-white"
                      variant="contained"
                    >
                      Daftar
                    </Button>
                  </Link>
                </div>
                <FiMenu
                  className="text-white mx-2 sm:hidden"
                  size={30}
                  onClick={handleClick}
                />
                <Menu
                  className="mt-3"
                  id="basic-menu"
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                  MenuListProps={{
                    "aria-labelledby": "basic-button",
                  }}
                >
                  <Link href="/login">
                    <MenuItem onClick={handleClose}>Masuk</MenuItem>
                  </Link>
                  <Link href="/register">
                    <MenuItem onClick={handleClose}>Daftar</MenuItem>
                  </Link>
                </Menu>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};
