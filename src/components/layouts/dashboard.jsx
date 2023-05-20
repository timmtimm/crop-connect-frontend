import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import MailIcon from "@mui/icons-material/Mail";
import { useEffect, useState } from "react";
import { FaHome, FaUserCircle } from "react-icons/fa";
import { Menu, MenuItem, Tooltip } from "@mui/material";
import Link from "next/link";
import { get } from "@/lib/axios";
import Cookies from "js-cookie";
import {
  AiOutlineMenuUnfold,
  AiOutlineMenuFold,
  AiOutlineHome,
} from "react-icons/ai";
import Image from "next/image";
import { useRouter } from "next/router";
import { TbPlant, TbReport } from "react-icons/tb";
import { IoDocumentTextOutline } from "react-icons/io5";
import { GiFarmTractor } from "react-icons/gi";
import { GrTransaction, GrValidate } from "react-icons/gr";
import { useProfileUser } from "@/context/profileUserContext";
import Loading from "../modules/loading";
import { roleUser } from "@/constant/constant";

const drawerWidth = 270;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

export default (props) => {
  const { children } = props;
  const router = useRouter();

  const { profileUser, isLoadingProfile, isAuthenticated, logout, checkRole } =
    useProfileUser();
  const [openDrawer, setOpenDrawer] = useState(false);

  const handleDrawer = () => {
    setOpenDrawer(!openDrawer);
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    setAnchorEl(null);
    logout();
  };

  useEffect(() => {
    if (
      !isLoadingProfile &&
      isAuthenticated &&
      !checkRole(false, roleUser.buyer)
    ) {
      router.replace({
        pathname: "/",
      });
    }
  }, [isLoadingProfile, isAuthenticated]);

  useEffect(() => {
    if (!Cookies.get("token")) {
      router.replace({
        pathname: "/login",
        query: {
          redirect: router.pathname,
        },
      });
    }
  }, []);

  if (isLoadingProfile || !isAuthenticated) {
    return <Loading />;
  }

  const listMenu =
    profileUser?.role == roleUser.farmer
      ? [
          {
            text: "Daftar Komoditas",
            to: "/dashboard/commodity",
            icon: <TbPlant className="text-black" size={20} />,
          },
          {
            text: "Daftar proposal",
            to: "/dashboard/proposal",
            icon: <IoDocumentTextOutline className="text-black" size={20} />,
          },
          {
            text: "Riwayat Perawatan",
            to: "/dashboard/treatment-record",
            icon: <TbReport className="text-black" size={20} />,
          },
          {
            text: "Daftar Panen",
            to: "/dashboard/harvest",
            icon: <GiFarmTractor className="text-black" size={20} />,
          },
          {
            text: "Daftar penjualan",
            to: "/dashboard/sales",
            icon: <GrTransaction className="text-black" size={20} />,
          },
        ]
      : profileUser?.role == roleUser.validator
      ? [
          {
            text: "Validasi proposal",
            to: "/dashboard/validation-proposal",
            icon: <IoDocumentTextOutline className="text-black" size={20} />,
          },
          {
            text: "Validasi riwayat perawatan",
            to: "/dashboard/validation-treatment-record",
            icon: <TbReport className="text-black" size={20} />,
          },
          {
            text: "Validasi hasil panen",
            to: "/dashboard/validation-harvest",
            icon: <GiFarmTractor className="text-black" size={20} />,
          },
        ]
      : profileUser?.role == roleUser.admin
      ? [
          {
            text: "Daftar Validator",
            to: "/dashboard/list-validator",
            icon: <GrValidate className="text-black" size={20} />,
          },
        ]
      : [];

  return (
    <>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <AppBar className="z-0" position="fixed" open={openDrawer}>
          <Toolbar>
            <div className="flex w-full items-center flex-row justify-between">
              <div
                className={`flex flex-row items-center ${
                  !openDrawer && "ml-16"
                }`}
              >
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  onClick={handleDrawer}
                  edge="start"
                >
                  {openDrawer ? <AiOutlineMenuFold /> : <AiOutlineMenuUnfold />}
                </IconButton>
              </div>
              <div
                className="flex flex-row items-center bg-white rounded-lg p-3 cursor-pointer max-w-[12rem]"
                id="basic-button"
                aria-controls={openDrawer ? "basic-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={openDrawer ? "true" : undefined}
                onClick={handleClick}
              >
                <FaUserCircle className="text-black" size={25} />
                <span className="sm:ml-2 font-semibold text-gray-500 hidden sm:flex">
                  Hi,{" "}
                </span>
                <span
                  className={`font-semibold text-gray-500 hidden sm:flex truncate`}
                >
                  {profileUser?.name && profileUser?.name}
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
                <Link href="/dashboard">
                  <MenuItem onClick={handleClose}>Dashboard</MenuItem>
                </Link>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </div>
          </Toolbar>
        </AppBar>
        <Drawer className="z-10" variant="permanent" open={openDrawer}>
          <DrawerHeader>
            <div className="flex flex-row w-full items-center justify-center">
              <Link href="/">
                <Image
                  src="/logo.svg"
                  width={60}
                  height={60}
                  alt="Logo Crop Connect"
                />
              </Link>
            </div>
          </DrawerHeader>
          <Divider />
          <List className="p-0">
            {openDrawer ? (
              <Link href="/dashboard">
                <ListItem
                  key={"dashboard"}
                  disablePadding
                  className={`${
                    router.asPath == "/dashboard" && "bg-gray-300"
                  }`}
                  sx={{ display: "block" }}
                >
                  <ListItemButton
                    sx={{
                      minHeight: 48,
                      justifyContent: openDrawer ? "initial" : "center",
                      px: 2.5,
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: openDrawer ? 3 : "auto",
                        justifyContent: "center",
                      }}
                    >
                      <AiOutlineHome className="text-black" size={20} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Beranda"
                      sx={{ opacity: openDrawer ? 1 : 0 }}
                    />
                  </ListItemButton>
                </ListItem>
              </Link>
            ) : (
              <Tooltip title="Dashboard" placement="right">
                <Link href="/dashboard">
                  <ListItem
                    key={"dashboard"}
                    disablePadding
                    className={`${
                      router.asPath == "/dashboard" && "bg-gray-300"
                    }`}
                    sx={{ display: "block" }}
                  >
                    <ListItemButton
                      sx={{
                        minHeight: 48,
                        justifyContent: openDrawer ? "initial" : "center",
                        px: 2.5,
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: openDrawer ? 3 : "auto",
                          justifyContent: "center",
                        }}
                      >
                        <AiOutlineHome className="text-black" size={20} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Dashboard"
                        sx={{ opacity: openDrawer ? 1 : 0 }}
                      />
                    </ListItemButton>
                  </ListItem>
                </Link>
              </Tooltip>
            )}
            {listMenu.map((menu) =>
              openDrawer ? (
                <Link href={menu.to}>
                  <ListItem
                    key={menu.text}
                    disablePadding
                    className={`${router.asPath == menu.to && "bg-gray-300"}`}
                    sx={{ display: "block" }}
                  >
                    <ListItemButton
                      sx={{
                        minHeight: 48,
                        justifyContent: openDrawer ? "initial" : "center",
                        px: 2.5,
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: openDrawer ? 3 : "auto",
                          justifyContent: "center",
                        }}
                      >
                        {menu.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={menu.text}
                        sx={{ opacity: openDrawer ? 1 : 0 }}
                      />
                    </ListItemButton>
                  </ListItem>
                </Link>
              ) : (
                <Tooltip title={menu.text} placement="right">
                  <Link href={menu.to}>
                    <ListItem
                      key={menu.text}
                      disablePadding
                      className={`${router.asPath == menu.to && "bg-gray-300"}`}
                      sx={{ display: "block" }}
                    >
                      <ListItemButton
                        sx={{
                          minHeight: 48,
                          justifyContent: openDrawer ? "initial" : "center",
                          px: 2.5,
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 0,
                            mr: openDrawer ? 3 : "auto",
                            justifyContent: "center",
                          }}
                        >
                          {menu.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={menu.text}
                          sx={{ opacity: openDrawer ? 1 : 0 }}
                        />
                      </ListItemButton>
                    </ListItem>
                  </Link>
                </Tooltip>
              )
            )}
          </List>
        </Drawer>
        <Box
          component="main"
          className="bg-[#F7F6F0] flex flex-col min-h-screen"
          sx={{ flexGrow: 1, p: 3 }}
        >
          <DrawerHeader />
          <main>{children}</main>
        </Box>
      </Box>
    </>
  );
};
