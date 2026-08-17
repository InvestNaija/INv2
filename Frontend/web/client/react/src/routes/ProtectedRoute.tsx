import { Link, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/authContext";
import AccountVerification from "../components/dialogs/account-verification";
import isKycComplete from "../hooks/isKycComplete";
// material-ui

import { styled } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MuiList from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import Drawer from "@mui/material/Drawer";
import { useEffect, useState } from "react";
import AppLogo from "../assets/icons/investnaija-full-logo.svg";
import AppSmallLogo from "../assets/icons/investnaija-icon.svg";
import UserLogo from "../assets/icons/user.svg";
import "../App.css";
import User, { useUser } from "../contexts/userContext";
import Menu from "@mui/material/Menu";
import Divider from "@mui/material/Divider";
import LogoutConfirmation from "../components/dialogs/logout-confirmation";
import SwitchAccount from "../components/dialogs/switch-account";
import { useThemeMode } from "../contexts/themeContext";

const drawerWidth = 320;

interface Props {
  /**
   * Injected by the documentation to work in an iframe.
   * Remove this when copying and pasting into your project.
   */
  window?: () => Window;
}

const List = styled(MuiList)({
  "&& .Mui-selected, && .Mui-selected:hover": {
    backgroundColor: "rgba(0, 88, 94, 0.08)",
    color: "#00585E",
    marginLeft: 16,
    marginRight: 16,
    marginBottom: 4,
    padding: "12px 20px",
    borderRadius: "16px",
    border: "none",
    "&, & .MuiListItemIcon-root": {
      color: "#00585E",
    },
  },
  "& .MuiListItemButton-root:hover": {
    backgroundColor: "rgba(0, 88, 94, 0.03)",
    marginLeft: 16,
    marginRight: 16,
    marginBottom: 4,
    padding: "12px 20px",
    borderRadius: "16px",
    border: "none",
  },
  "& .MuiListItemButton-root": {
    marginLeft: 16,
    marginRight: 16,
    marginBottom: 4,
    padding: "12px 20px",
    borderRadius: "16px",
    border: "none",
    transition: "all 0.2s ease-in-out",
  },
});

// Renders the authenticated dashboard shell. Split out from ProtectedRoute
// so it mounts as a child of <User>, since a component can't consume a
// context provider that it itself renders further down its own JSX tree.
const DashboardShell = (props: Props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { currentUser, isLoading: isLoadingUser } = useUser();
  const { mode, toggleMode } = useThemeMode();
  // Driven by the currently-fetched profile (not any remembered client
  // state — switching profiles is a plain token replace, see authContext's
  // submitSwitchProfile) — swaps the tier labels below for a "Dependent
  // account" hint instead.
  const isViewingMinor = Boolean(currentUser?.isMinor);

  const [openLogoutDialog, setLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [openAccountVerification, setOpenAccountVerification] = useState(false);
  const [openSwitchAccount, setOpenSwitchAccount] = useState(false);

  // Prompts email verification on landing on the dashboard, and again on
  // every subsequent page landed on (location.pathname in the deps) —
  // navigation itself is never blocked, the prompt just follows along.
  // Requires a real, loaded profile (currentUser?.id) before evaluating
  // verified status — isLoadingUser alone isn't enough: if the initial
  // fetch fails, isLoading flips back to false while currentUser is still
  // the empty placeholder object, which would otherwise read as
  // "unverified" and flash this open for a profile that was never
  // actually loaded.
  useEffect(() => {
    const promptIfUnverified = () => {
      if (!isLoadingUser && currentUser?.id && !isKycComplete(currentUser)) {
        setOpenAccountVerification(true);
      }
    };
    promptIfUnverified();
  }, [isLoadingUser, currentUser, location.pathname]);

  // Handle post-switch redirection
  useEffect(() => {
    if (!isLoadingUser && currentUser?.id) {
      const postSwitchUrl = localStorage.getItem("postSwitchRedirectUrl");
      if (postSwitchUrl) {
        localStorage.removeItem("postSwitchRedirectUrl");
        navigate(postSwitchUrl);
      }
    }
  }, [isLoadingUser, currentUser?.id, navigate]);

  const handleLogoutClick = () => {
    setLogoutDialog(true);
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
    setLogoutDialog(false);
    navigate("/auth/login");
  };

  // Split the pathname and filter out empty strings (like the trailing slash)
  const pathSegments = location.pathname.split("/").filter(Boolean);

  // Get the first and second item in the array
  const path = "/" + pathSegments[0] + "/" + pathSegments[1];

  const { window } = props;

  const menuItems = [
    {
      text: "Home",
      iconInactive: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M21 20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V9.48907C3 9.18048 3.14247 8.88917 3.38606 8.69972L11.3861 2.47749C11.7472 2.19663 12.2528 2.19663 12.6139 2.47749L20.6139 8.69972C20.8575 8.88917 21 9.18048 21 9.48907V20ZM19 19V9.97815L12 4.53371L5 9.97815V19H19Z"
            fill="#9B9B9B"
          />
        </svg>
      ),
      iconActive: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="19"
          viewBox="0 0 18 19"
          fill="none"
        >
          <path
            d="M18 17.7332C18 18.2855 17.5523 18.7332 17 18.7332H1C0.44772 18.7332 0 18.2855 0 17.7332V7.22223C0 6.91364 0.14247 6.62233 0.38606 6.43288L8.3861 0.210645C8.7472 -0.070215 9.2528 -0.070215 9.6139 0.210645L17.6139 6.43288C17.8575 6.62233 18 6.91364 18 7.22223V17.7332Z"
            fill="#00585E"
          />
        </svg>
      ),
      path: "/app/home",
    },
    {
      text: "Learn",
      iconInactive: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M10.0001 13C10.5523 13 11 13.4478 11.0001 14V20C11.0001 20.5523 10.5524 21 10.0001 21H4.00001C3.44772 21 3 20.5523 3 20V14C3.00011 13.4478 3.44778 13 4.00001 13H10.0001ZM20.0002 13C20.5524 13 21.0001 13.4478 21.0002 14V20C21.0002 20.5523 20.5525 21 20.0002 21H14.0001C13.4478 21 13.0001 20.5523 13.0001 20V14C13.0002 13.4478 13.4479 13 14.0001 13H20.0002ZM5.00002 19H9.00006V15H5.00002V19ZM15.0001 19H19.0002V15H15.0001V19ZM16.5294 3.31933C16.7059 2.89329 17.2944 2.89329 17.4708 3.31933L17.7238 3.93066C18.1558 4.97348 18.9617 5.80619 19.9748 6.25683L20.6926 6.57617C21.1027 6.75908 21.1029 7.35627 20.6926 7.53906L19.9328 7.87695C18.945 8.31627 18.1535 9.11932 17.714 10.1279L17.4669 10.6934C17.2865 11.1075 16.7138 11.1075 16.5333 10.6934L16.2872 10.1279C15.8477 9.11929 15.0553 8.31628 14.0675 7.87695L13.3077 7.53906C12.8975 7.35629 12.8976 6.75906 13.3077 6.57617L14.0255 6.25683C15.0386 5.80619 15.8446 4.9735 16.2765 3.93066L16.5294 3.31933ZM10.0001 3C10.5523 3 11 3.4478 11.0001 4V10C11.0001 10.5523 10.5524 11 10.0001 11H4.00001C3.44772 11 3 10.5523 3 10V4C3.00011 3.4478 3.44778 3 4.00001 3H10.0001ZM5.00002 9H9.00006V5H5.00002V9Z"
            fill="#9B9B9B"
          />
        </svg>
      ),
      iconActive: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M3 4C3 3.44772 3.44772 3 4 3H10C10.5523 3 11 3.44772 11 4V10C11 10.5523 10.5523 11 10 11H4C3.44772 11 3 10.5523 3 10V4ZM3 14C3 13.4477 3.44772 13 4 13H10C10.5523 13 11 13.4477 11 14V20C11 20.5523 10.5523 21 10 21H4C3.44772 21 3 20.5523 3 20V14ZM13 14C13 13.4477 13.4477 13 14 13H20C20.5523 13 21 13.4477 21 14V20C21 20.5523 20.5523 21 20 21H14C13.4477 21 13 20.5523 13 20V14ZM17.7134 10.1276L17.4668 10.6933C17.2864 11.1074 16.7136 11.1074 16.5331 10.6933L16.2866 10.1276C15.8471 9.11898 15.0555 8.31592 14.0677 7.87659L13.308 7.53873C12.8973 7.35604 12.8973 6.75832 13.308 6.57563L14.0252 6.25665C15.0384 5.80602 15.8442 4.97324 16.2761 3.93034L16.5293 3.31904C16.7058 2.893 17.2942 2.893 17.4706 3.31904L17.7238 3.93034C18.1558 4.97324 18.9616 5.80602 19.9748 6.25665L20.6919 6.57563C21.1027 6.75832 21.1027 7.35604 20.6919 7.53873L19.9323 7.87659C18.9445 8.31592 18.1529 9.11898 17.7134 10.1276Z"
            fill="#00585E"
          />
        </svg>
      ),
      path: "/app/learn",
    },
    {
      text: "Goals",
      iconInactive: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M5.99805 3C9.48787 3 12.3812 5.55379 12.9112 8.8945C14.0863 7.72389 15.7076 7 17.498 7H21.998V9.5C21.998 13.0899 19.0879 16 15.498 16H12.998V21H10.998V13H8.99805C5.13205 13 1.99805 9.86599 1.99805 6V3H5.99805ZM19.998 9H17.498C15.0128 9 12.998 11.0147 12.998 13.5V14H15.498C17.9833 14 19.998 11.9853 19.998 9.5V9ZM5.99805 5H3.99805V6C3.99805 8.76142 6.23662 11 8.99805 11H10.998V10C10.998 7.23858 8.75947 5 5.99805 5Z"
            fill="#9B9B9B"
          />
        </svg>
      ),
      iconActive: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M21.998 7V9.5C21.998 13.0899 19.0879 16 15.498 16H12.998V21H10.998V14L11.0169 13.0007C11.2719 9.64413 14.0762 7 17.498 7H21.998ZM5.99805 3C9.0904 3 11.7144 5.00519 12.6408 7.78626C11.1417 9.06119 10.1516 10.9143 10.0144 13.0004L8.99805 13C5.13205 13 1.99805 9.86599 1.99805 6V3H5.99805Z"
            fill="#00585E"
          />
        </svg>
      ),
      path: "/app/save",
    },
    {
      text: "Invest",
      iconInactive: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M3 12H5V21H3V12ZM19 8H21V21H19V8ZM11 2H13V21H11V2Z"
            fill="#9B9B9B"
          />
        </svg>
      ),
      iconActive: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M3 12H5V21H3V12ZM19 8H21V21H19V8ZM11 2H13V21H11V2Z"
            fill="#00585E"
          />
        </svg>
      ),
      path: "/app/invest",
    },
    {
      text: "Transactions",
      iconInactive: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M11.9493 7.94975L10.5351 9.36396L8.0003 6.828L7.99955 20H5.99955L6.0003 6.828L3.46402 9.36396L2.0498 7.94975L6.99955 3L11.9493 7.94975ZM21.9493 16.0503L16.9995 21L12.0498 16.0503L13.464 14.636L16.0003 17.172L15.9995 4H17.9995L18.0003 17.172L20.5351 14.636L21.9493 16.0503Z"
            fill="#9B9B9B"
          />
        </svg>
      ),
      iconActive: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M11.9493 7.94975L10.5351 9.36396L8.0003 6.828L7.99955 20H5.99955L6.0003 6.828L3.46402 9.36396L2.0498 7.94975L6.99955 3L11.9493 7.94975ZM21.9493 16.0503L16.9995 21L12.0498 16.0503L13.464 14.636L16.0003 17.172L15.9995 4H17.9995L18.0003 17.172L20.5351 14.636L21.9493 16.0503Z"
            fill="#00585E"
          />
        </svg>
      ),
      path: "/app/transactions",
    },
  ];

  // screen size and control drawer

  const [mobileOpen, setMobileOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  // screen size and control drawer

  // user setting pages
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  // user setting pages

  const drawer = (
    <div className="bg-[var(--surface-default)] text-(--text-content-default) h-full">
      <span className="flex justify-between my-3 px-[24px] sm:px-[32px] items-center mt-[24px] sm:mt-[40px]">
        <img src={AppLogo} height="150" width="150" alt="Hotel Logo" />
        <div
          className="cursor-pointer xs:block sm:block block md:hidden lg:hidden xl:hidden"
          onClick={handleDrawerClose}
        >
          <i className="ri-layout-left-line text-[24px] text-(--icon-muted) cursor-pointer"></i>
        </div>
      </span>
      {/* <Toolbar />}
      {/* <Divider /> */}
      <List
        sx={{
          width: "100%",
          bgcolor: "transparent",
          color: "var(--text-content-default)",
          marginTop: { xs: "24px", sm: "40px" },
          paddingTop: 0,
          border: "none",
        }}
      >
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={path === item.path}
              component={Link}
              to={item.path}
              onClick={handleDrawerClose}
            >
              <ListItemIcon>
                {path === item.path ? item.iconActive : item.iconInactive}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{
                  "& .MuiListItemText-primary": {
                    fontSize: "16px !important",
                    fontWeight:
                      path === item.path ? "600 !important" : "400 !important",
                      color: path === item.path ? "#00585E !important" : "var(--text-content-default) !important",
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <div className="absolute bottom-[40px] px-[24px] w-full">

        <div className="p-[12px]">
          <div
            onClick={handleClick}
            id="user-positioned-button"
            aria-controls={open ? "user-positioned-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open}
            className="flex justify-between w-full items-center cursor-pointer p-3 rounded-[20px] hover:bg-black/5 active:scale-[0.98] transition-all border border-transparent"
          >
            <div className="flex gap-3 items-center min-w-0">
              <div
                className="relative shrink-0 cursor-pointer"
                onClick={(event) => {
                  // Opens the switch-account dialog directly, bypassing the
                  // settings/logout dropdown the rest of this row opens.
                  event.stopPropagation();
                  setOpenSwitchAccount(true);
                }}
              >
                <div className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-white ring-2 ring-[#00868D]/40 ring-offset-2 ring-offset-[var(--surface-default)] transition-all">
                  {isLoadingUser || !currentUser ? (
                    <span className="h-[42px] w-[42px] rounded-full animate-pulse bg-gray-100"></span>
                  ) : (
                    <img
                      src={currentUser?.image || UserLogo}
                      height="42"
                      width="42"
                      className="rounded-full object-cover w-[42px] h-[42px]"
                      alt="User Logo"
                    />
                  )}
                </div>
                {(!isLoadingUser && currentUser) && (
                  <span className="absolute -bottom-1 -right-1 flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[#008080] ring-[3px] ring-[var(--surface-default)]">
                    <i className="ri-arrow-left-right-line text-[11px] text-white"></i>
                  </span>
                )}
              </div>
              <div className="flex flex-col min-w-0 pr-3">
                {isLoadingUser || !currentUser ? (
                  <>
                    <span className="h-[14px] w-[96px] animate-pulse rounded bg-gray-100"></span>
                    <span className="mt-[6px] h-[10px] w-[56px] animate-pulse rounded bg-gray-100"></span>
                  </>
                ) : (
                  <>
                    <span className="truncate whitespace-nowrap text-[15px] text-(--text-content-default) leading-[20px] font-bold tracking-tight">
                    {currentUser?.firstName} {currentUser?.lastName}
                    </span>
                    <span className="text-[13px] text-[#E77731] leading-[18px] font-semibold tracking-wide">
                      {isViewingMinor ? "Dependent account" : `Tier ${currentUser?.tier}`}
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="shrink-0">
              <i className="ri-arrow-right-s-line text-[#BFBFBF] text-[24px]"></i>
            </div>
          </div>
          <Menu
            id="user-positioned-menu"
            aria-labelledby="user-positioned-button"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            slotProps={{
              paper: {
                sx: {
                  borderRadius: "24px",
                  border: "1px solid rgba(0,0,0,0.04)",
                  boxShadow: "0 12px 48px rgba(0,0,0,0.08)",
                  overflowX: "hidden",
                  width: "320px",
                  maxWidth: "320px",
                  mt: "10px", 
                  p: "8px", 
                  "@media (max-width: 639px)": {
                    position: "fixed !important",
                    top: "50% !important",
                    left: "50% !important",
                    right: "auto !important",
                    bottom: "auto !important",
                    transform: "translate(-50%, -50%) !important",
                    margin: 0,
                    width: "calc(100vw - 32px)",
                    maxWidth: "360px",
                  },
                },
              },
            }}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
          >
            <div className="flex flex-col outline-none">
              {/* Profile Header */}
              <div className="flex items-center gap-3 w-full p-3 mb-2 rounded-[20px] bg-gradient-to-br from-gray-50 to-white border border-gray-100/50 shadow-xs">
                <div className="relative shrink-0">
                  <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-white shadow-xs">
                    <img
                      src={currentUser?.image || UserLogo}
                      className="h-full w-full object-cover"
                      alt="User Logo"
                    />
                  </div>
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="truncate text-[15px] text-gray-900 font-bold tracking-tight">
                    {currentUser?.firstName} {currentUser?.lastName}
                  </span>
                  <span className="truncate text-[13px] text-gray-500 font-medium">
                    {currentUser?.email}
                  </span>
                </div>
                <div className="shrink-0">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FFF2EA] text-[#E77731] border border-[#FFE2CF]">
                    {isViewingMinor ? "Dependent" : `Tier ${currentUser?.tier}`}
                  </span>
                </div>
              </div>

              {/* Menu Items */}
              <div className="flex flex-col gap-1">
                {/* Switch Account */}
                <div
                  className="group flex items-center gap-3 p-2.5 rounded-[16px] cursor-pointer hover:bg-cyan-50/60 transition-all duration-200 active:scale-[0.98]"
                  onClick={() => {
                    handleClose();
                    setOpenSwitchAccount(true);
                  }}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-gray-50 text-gray-400 group-hover:bg-white group-hover:shadow-sm group-hover:text-[#00868D] transition-all">
                    <i className="ri-group-2-line text-[20px]"></i>
                  </div>
                  <div className="text-[14px] text-gray-700 font-bold group-hover:text-gray-900 transition-colors">
                    Switch account
                  </div>
                </div>

                {/* Settings */}
                <Link to={"/app/settings"} className="block" onClick={handleClose}>
                  <div className="group flex items-center gap-3 p-2.5 rounded-[16px] cursor-pointer hover:bg-cyan-50/60 transition-all duration-200 active:scale-[0.98]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-gray-50 text-gray-400 group-hover:bg-white group-hover:shadow-sm group-hover:text-[#00868D] transition-all">
                      <i className="ri-settings-2-line text-[20px]"></i>
                    </div>
                    <div className="text-[14px] text-gray-700 font-bold group-hover:text-gray-900 transition-colors">
                      Settings
                    </div>
                  </div>
                </Link>

                {/* Help */}
                <Link to="/app/help" className="block" onClick={handleClose}>
                  <div className="group flex items-center gap-3 p-2.5 rounded-[16px] cursor-pointer hover:bg-cyan-50/60 transition-all duration-200 active:scale-[0.98]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-gray-50 text-gray-400 group-hover:bg-white group-hover:shadow-sm group-hover:text-[#00868D] transition-all">
                      <i className="ri-information-line text-[20px]"></i>
                    </div>
                    <div className="text-[14px] text-gray-700 font-bold group-hover:text-gray-900 transition-colors">
                      Help
                    </div>
                  </div>
                </Link>

                <div className="h-[1px] w-[calc(100%-20px)] mx-auto bg-gray-100 my-1 rounded-full"></div>

                {/* Log Out */}
                <div
                  className="group flex items-center gap-3 p-2.5 rounded-[16px] cursor-pointer hover:bg-red-50/80 transition-all duration-200 active:scale-[0.98]"
                  onClick={handleLogoutClick}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-gray-50 text-gray-400 group-hover:bg-white group-hover:shadow-sm group-hover:text-red-500 transition-all">
                    <i className="ri-logout-box-r-line text-[20px]"></i>
                  </div>
                  <div className="text-[14px] text-gray-700 font-bold group-hover:text-red-600 transition-colors">
                    Log out
                  </div>
                </div>
              </div>
            </div>
          </Menu>
        </div>
      </div>
    </div>
  );



  // Remove this const when copying and pasting into your project.
  const container = window ? () => window().document.body : undefined;

  return (
    <>
      <LogoutConfirmation
        openLogoutDialog={openLogoutDialog}
        setLogoutDialog={setLogoutDialog}
        onConfirmLogout={handleConfirmLogout}
        isLoading={isLoggingOut}
      />
      <SwitchAccount
        openDialog={openSwitchAccount}
        setDialog={setOpenSwitchAccount}
        currentUser={currentUser}
      />
      <AccountVerification
        openDialog={openAccountVerification}
        setDialog={setOpenAccountVerification}
      />
      <Box sx={{ flexGrow: 1, bgcolor: "var(--surface-default)", height: "100%" }}>
        <CssBaseline />
        <AppBar
          position="fixed"
          sx={{
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            ml: { sm: `${drawerWidth}px` },
          }}
        ></AppBar>
        <Box
          component="nav"
          sx={{
            width: { sm: drawerWidth },
            flexShrink: { sm: 0 },
            border: "none",
          }}
          aria-label="mailbox folders"
        >
          {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
          <Drawer
            container={container}
            variant="temporary"
            open={mobileOpen}
            onTransitionEnd={handleDrawerTransitionEnd}
            onClose={handleDrawerClose}
            sx={{
              display: { xs: "block", sm: "none" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
                borderRight: "none",
              },
            }}
            slotProps={{
              root: {
                keepMounted: true, // Better open performance on mobile.
              },
            }}
          >
            {drawer}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: "none", sm: "block" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
                borderRight: "none",
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>
        <Box
          component="main"
          sx={{
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            ml: { sm: `${drawerWidth}px` },
          }}
        >
          {/* <Toolbar /> */}
          <div className="p-[12px] sm:p-[16px] h-screen bg-[var(--surface-default)]">
            {/* Split from the scrolling div below on purpose: a `position:
                fixed` descendant whose containing block IS the scrolling
                element still scrolls away with it (fixed/absolute only
                escape scroll when their containing block is an ancestor
                that itself doesn't scroll) — so the transform that anchors
                fixed descendants (see Settings' pinned tab header) has to
                live on this non-scrolling outer box instead. */}
            <div className="h-full rounded-[32px] sm:rounded-[40px] bg-white relative [transform:translateZ(0)] overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.06)] border border-gray-100/80">
              
              <div className="overflow-y-scroll h-full relative z-10 px-[20px] sm:px-[20px] md:px-[50px] lg:px-[50px] xl:px-[50px] pb-[30px] sm:pt-[30px] pt-[30px] xl:pt-[56px] lg:pt-[56px] md:pt-[56px]">
                <div className="sm:block block md:hidden lg:hidden xl:hidden">
                  <div className="flex items-center mb-[20px]">
                    <div className="cursor-pointer" onClick={handleDrawerToggle}>
                      <i className="ri-menu-3-line text-[24px] "></i>
                    </div>
                    <div>
                      <img
                        src={AppSmallLogo}
                        height="40"
                        width="40"
                        alt="Hotel Logo"
                      />
                    </div>
                  </div>
                </div>
                <Outlet />
              </div>
              <Link 
                to="/app/help" 
                className="absolute bottom-[24px] right-[24px] flex h-[60px] w-[60px] items-center justify-center rounded-full bg-gradient-to-br from-[#00A0A8] to-[#00585E] shadow-[0_4px_14px_rgba(0,88,94,0.39)] text-white transition-all hover:scale-105 active:scale-95 z-50 group"
                aria-label="Need Help?"
              >
                <i className="ri-customer-service-2-line text-[28px] group-hover:animate-pulse"></i>
              </Link>
            </div>
          </div>
        </Box>
      </Box>
    </>
  );
};

export const ProtectedRoute = (props: Props) => {
  // provider for state for authentication and User Info
  const { state } = useAuth();

  // If authenticated, mount the dashboard shell (which fetches the user
  // profile via <User>); otherwise bounce to login.
  return state.isAuthenticated ? (
    <User>
      <DashboardShell {...props} />
    </User>
  ) : (
    <Navigate to="/auth/login" />
  );
};
