import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { Menu, MenuItem, SwipeableDrawer, Tooltip } from "@mui/material";
import Link from "next/link";
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
import { GiClockwiseRotation, GiFarmTractor } from "react-icons/gi";
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
  const { children, roles } = props;
  const router = useRouter();

  const { profileUser, isLoadingProfile, isAuthenticated, logout, checkRole } =
    useProfileUser();
  const [openDrawer, setOpenDrawer] = useState(false);
  const [openSwipeableDrawer, setOpenSwipeableDrawer] = useState(false);
  const [width, setWidth] = useState(0);

  const handleDrawer = () => {
    if (window.innerWidth >= 640) {
      setOpenDrawer(!openDrawer);
    } else {
      if (
        event &&
        event.type === "keydown" &&
        (event.key === "Tab" || event.key === "Shift")
      ) {
        return;
      }

      setOpenSwipeableDrawer(!openSwipeableDrawer);
    }
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

  const handleCheckRole = () => {
    if (Array.isArray(roles)) {
      let flag = false;
      roles.forEach((role) => {
        if (!checkRole(true, role)) {
          flag = true;
        }
      });
      return !flag;
    } else {
      return !checkRole(true, roles);
    }
  };

  useEffect(() => {
    if (!isLoadingProfile && isAuthenticated && handleCheckRole()) {
      router.replace({
        pathname: "/",
      });
    }
  }, [isLoadingProfile, isAuthenticated]);

  useEffect(() => {
    if (!Cookies.get("token")) {
      router.replace({
        pathname: "/login",
      });
    }
  }, []);

  useEffect(() => {
    setWidth(window.innerWidth);
  }, []);

  const listMenu =
    profileUser?.role == roleUser.farmer
      ? [
          {
            text: "Komoditas",
            to: "commodity",
            icon: <TbPlant className="text-black" size={20} />,
          },
          {
            text: "Proposal",
            to: "proposal",
            icon: <IoDocumentTextOutline className="text-black" size={20} />,
          },
          {
            text: "Penjualan",
            to: "sales",
            icon: <GrTransaction className="text-black" size={20} />,
          },
          {
            text: "Periode Penanaman",
            to: "batch",
            icon: <GiClockwiseRotation className="text-black" size={20} />,
          },
          {
            text: "Riwayat Perawatan",
            to: "treatment-record",
            icon: <TbReport className="text-black" size={20} />,
          },
          {
            text: "Panen",
            to: "harvest",
            icon: <GiFarmTractor className="text-black" size={20} />,
          },
        ]
      : profileUser?.role == roleUser.validator
      ? [
          {
            text: "Proposal",
            to: "validation-proposal",
            icon: <IoDocumentTextOutline className="text-black" size={20} />,
          },
          {
            text: "Riwayat Perawatan",
            to: "validation-treatment-record",
            icon: <TbReport className="text-black" size={20} />,
          },
          {
            text: "Panen",
            to: "validation-harvest",
            icon: <GiFarmTractor className="text-black" size={20} />,
          },
        ]
      : profileUser?.role == roleUser.admin
      ? [
          {
            text: "Validator",
            to: "validator",
            icon: <GrValidate className="text-black" size={20} />,
          },
        ]
      : [];

  return (
    <>
      {isLoadingProfile || !isAuthenticated ? (
        <Loading />
      ) : (
        <Box sx={{ display: "flex" }}>
          <CssBaseline />
          <AppBar className="z-10" position="fixed" open={openDrawer}>
            <Toolbar>
              <div className="flex w-full items-center flex-row justify-between">
                <div
                  className={`flex flex-row items-center ${
                    !openDrawer && "sm:ml-16"
                  }`}
                >
                  <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    onClick={handleDrawer}
                    edge="start"
                  >
                    {openDrawer ? (
                      <AiOutlineMenuFold />
                    ) : (
                      <AiOutlineMenuUnfold />
                    )}
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
          <Drawer
            className="z-20 hidden sm:block"
            variant="permanent"
            open={openDrawer}
          >
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
            <List className="p-0 hidden sm:block">
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
                <Tooltip title="Beranda" placement="right">
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
                  <Link href={`/dashboard/${menu.to}`}>
                    <ListItem
                      key={menu.text}
                      disablePadding
                      className={`${
                        router.asPath.includes(`/dashboard/${menu.to}`) &&
                        "bg-gray-300"
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
                    <Link href={`/dashboard/${menu.to}`}>
                      <ListItem
                        key={menu.text}
                        disablePadding
                        className={`${
                          router.asPath.includes(`/dashboard/${menu.to}`) &&
                          "bg-gray-300"
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
          {width < 640 && (
            <SwipeableDrawer
              open={openSwipeableDrawer}
              onClose={handleDrawer}
              onOpen={handleDrawer}
            >
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
              <Box
                sx={{
                  width: "auto",
                }}
                role="presentation"
                onClick={handleDrawer}
                onKeyDown={handleDrawer}
              >
                <List className="p-0">
                  <Link href="/dashboard">
                    <ListItem
                      key="Beranda"
                      disablePadding
                      className={`${
                        router.asPath == "/dashboard" && "bg-gray-300"
                      }`}
                    >
                      <ListItemButton>
                        <ListItemIcon>
                          <AiOutlineHome className="text-black" size={20} />
                        </ListItemIcon>
                        <ListItemText primary="Beranda" />
                      </ListItemButton>
                    </ListItem>
                  </Link>
                  {listMenu.map((menu) => (
                    <Link href={`/dashboard/${menu.to}`}>
                      <ListItem
                        key={menu.text}
                        disablePadding
                        className={`${
                          router.asPath.includes(`/dashboard/${menu.to}`) &&
                          "bg-gray-300"
                        }`}
                      >
                        <ListItemButton>
                          <ListItemIcon>{menu.icon}</ListItemIcon>
                          <ListItemText primary={menu.text} />
                        </ListItemButton>
                      </ListItem>
                    </Link>
                  ))}
                </List>
              </Box>
            </SwipeableDrawer>
          )}
          <Box
            component="main"
            className="bg-[#F7F6F0] flex flex-col min-h-screen"
            sx={{ flexGrow: 1, p: 3 }}
          >
            <DrawerHeader />
            <main className="z-0">{children}</main>
          </Box>
        </Box>
      )}
    </>
  );
};
