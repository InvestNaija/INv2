import { useState } from "react";
import giftIcon from "../../assets/icons/Gift.svg";
import giftBlurIcon from "../../assets/icons/gift-blur.svg";
import Menu from "@mui/material/Menu";
import Button from "../atoms/buttons";
import { useUser } from "../../contexts/userContext";
import { useNavigate } from "react-router-dom";



const dummyNotifications = [
  {
    id: 1,
    title: "Investment Successful",
    description: "Your investment of ₦50,000 in the Halal Fund has been confirmed.",
    time: "2 mins ago",
    type: "success",
    isRead: false,
  },
  {
    id: 2,
    title: "New Feature Alert",
    description: "You can now set up automated daily savings. Check it out!",
    time: "1 hour ago",
    type: "info",
    isRead: false,
  },
  {
    id: 3,
    title: "Security Update",
    description: "We noticed a new login from a Mac device in Lagos.",
    time: "Yesterday",
    type: "warning",
    isRead: true,
  },
  {
    id: 4,
    title: "Monthly Statement",
    description: "Your July investment statement is ready for download.",
    time: "3 days ago",
    type: "document",
    isRead: true,
  }
];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "success":
      return (
        <div className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full bg-[#E8F8F5] text-[#00A0A8]">
          <i className="ri-checkbox-circle-fill text-[20px]"></i>
        </div>
      );
    case "info":
      return (
        <div className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-500">
          <i className="ri-information-fill text-[20px]"></i>
        </div>
      );
    case "warning":
      return (
        <div className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-500">
          <i className="ri-error-warning-fill text-[20px]"></i>
        </div>
      );
    case "document":
      return (
        <div className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full bg-purple-50 text-purple-500">
          <i className="ri-file-list-3-fill text-[20px]"></i>
        </div>
      );
    default:
      return (
        <div className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full bg-gray-50 text-gray-500">
          <i className="ri-notification-fill text-[20px]"></i>
        </div>
      );
  }
};

const Header = () => {
  const {currentUser} = useUser();
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const getGreeting = () => {
    const hours = new Date().getHours();

    // Check for day/night/time
    if (hours < 12) {
      return "Good Morning ☀️";
    } else if (hours < 18) {
      return "Good Afternoon 🌤️";
    } else {
      return "Good Evening 🌙";
    }
  };

  const handleCopy = async () => {
    try {
      if (!currentUser?.refCode) return;
      await navigator.clipboard.writeText(currentUser.refCode);
      setCopied(true);
      // Reset the "Copied" status after 2 seconds
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const greeting = getGreeting();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);
  const notifOpen = Boolean(notifAnchorEl);
  const handleNotifClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotifAnchorEl(event.currentTarget);
  };
  const handleNotifClose = () => {
    setNotifAnchorEl(null);
  };


  return (
    <>
      <div className="flex justify-between items-center gap-[12px]">
        <div className="min-w-0 flex-1">
          <p className="text-(--text-content-default) text-[16px] sm:text-[20px] leading-[22px] sm:leading-[28px] font-semibold truncate">
            {greeting}, {currentUser?.firstName}
          </p>
        </div>
        <div className="flex items-center gap-[10px] sm:gap-[24px] md:gap-[40px] shrink-0">
          <div
            className="refer-wrapper cursor-pointer shrink-0 transition-transform active:scale-[0.97]"
            onClick={handleClick}
            id="demo-positioned-button"
            aria-controls={open ? "demo-positioned-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open}
            aria-label="Refer and earn"
          >
            {/* Icon-only circular chip on mobile so it never crowds out the
                greeting text; expands into the full labeled pill from sm
                (640px) up where there's room for both. */}
            <div className="flex h-[38px] w-[38px] items-center justify-center rounded-full border border-[#E5E5E5] bg-white transition-colors hover:border-[#DCDCDC] hover:bg-[#FAFAFA] sm:h-auto sm:w-auto sm:justify-start sm:rounded-[99px] sm:px-[10px] sm:py-[8px]">
              <div className="flex items-center gap-[6px] whitespace-nowrap">
                <span className="flex shrink-0 items-center">
                  <img src={giftIcon} height="20" width="20" alt="Gift Logo" className="h-[18px] w-[18px] sm:h-[20px] sm:w-[20px]" />
                </span>
                <span className="hidden sm:inline text-[12px] leading-[16px] tracking-[0.2px] font-semibold text-[#0f0f0f]">
                  Refer & Earn
                </span>
              </div>
            </div>
          </div>
          <Menu
            id="demo-positioned-menu"
            aria-labelledby="demo-positioned-button"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            slotProps={{
              paper: {
                sx: {
                  borderRadius: "24px",
                  border: "1px solid #F4F4F4",
                  width: "380px", // Set explicit width
                  mt: "10px", // Add top margin (offset from button)
                  maxWidth: "100%", // Optional: ensure it doesn't break
                  // Below sm, re-anchor the popover to the viewport center
                  // instead of the trigger button — anchored to a button
                  // near the top-right edge, the 380px paper otherwise runs
                  // off the right/top of the screen on mobile (MUI Popover
                  // positioning doesn't auto-flip like a Dialog would).
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
                    maxHeight: "calc(100dvh - 32px)",
                    overflowY: "auto",
                  },
                },
              },
            }}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <div className="refer-content-wrapper relative pt-[8px]">
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close"
                className="absolute right-[12px] top-[12px] flex h-[32px] w-[32px] items-center justify-center rounded-full bg-[#F5F5F5] text-[#5A5A5A] transition-colors hover:bg-[#EBEBEB] cursor-pointer"
              >
                <i className="ri-close-line text-[16px]"></i>
              </button>
              <div className="flex justify-center">
                <div>
                  <div>
                    <img
                      src={giftBlurIcon}
                      height="200"
                      width="200"
                      alt="Gift Logo"
                      className="h-[140px] w-[140px] sm:h-[200px] sm:w-[200px]"
                    />
                  </div>
                  <div className="text-center text-(--text-content-default) text-[16px] sm:text-[18px] leading-[22px] sm:leading-[26px] font-semibold">
                    <span>Refer & Win</span>
                  </div>
                  <div
                    style={
                      {
                        background:
                          "linear-gradient(180deg, #EFB52E 0%, #EE9E39 24.5%, #ED8744 50.5%, #EC704E 74.75%, #EB5959 100%)",
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      } as React.CSSProperties
                    }
                    className="text-center text-[40px] sm:text-[52px] leading-[48px] sm:leading-[64px] tracking-[-1px] font-bold"
                  >
                    <span>{currentUser?.refCode}</span>
                  </div>
                </div>
              </div>
              <div className="p-[16px] w-full">
                <Button
                  variant="primary"
                  disabled={false}
                  isLoading={false}
                  className="rounded-[10px] h-[56px] mt-[24px] sm:mt-[40px] transition-transform active:scale-[0.98]"
                  onClick={handleCopy}
                >
                  {copied ? "Copied!" : "Copy code"}
                </Button>
              </div>
            </div>
          </Menu>
          <button
            type="button"
            onClick={handleNotifClick}
            aria-label="Notifications"
            className="relative flex h-[38px] w-[38px] sm:h-[40px] sm:w-[40px] shrink-0 items-center justify-center rounded-full border border-[#E5E5E5] bg-white cursor-pointer transition-colors hover:border-[#DCDCDC] hover:bg-[#FAFAFA] active:scale-[0.97]"
          >
            <i className="ri-notification-line text-[20px] sm:text-[22px] text-(--text-content-default)"></i>
            {/* Unread indicator dot */}
            <span className="absolute top-[8px] right-[8px] sm:top-[9px] sm:right-[9px] w-[8px] h-[8px] rounded-full bg-[#E77731] border border-white"></span>
          </button>
          
          {/* Notifications Dropdown */}
          <Menu
            id="notif-positioned-menu"
            aria-labelledby="notif-positioned-button"
            anchorEl={notifAnchorEl}
            open={notifOpen}
            onClose={handleNotifClose}
            slotProps={{
              paper: {
                sx: {
                  borderRadius: "24px",
                  border: "1px solid #F4F4F4",
                  width: "420px", // Slightly wider for notifications
                  mt: "10px",
                  maxWidth: "100%",
                  "@media (max-width: 639px)": {
                    position: "fixed !important",
                    top: "50% !important",
                    left: "50% !important",
                    right: "auto !important",
                    bottom: "auto !important",
                    transform: "translate(-50%, -50%) !important",
                    margin: 0,
                    width: "calc(100vw - 32px)",
                    maxWidth: "420px",
                    maxHeight: "calc(100dvh - 32px)",
                    overflowY: "auto",
                  },
                },
              },
            }}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <div className="relative flex flex-col w-full">
              {/* Header */}
              <div className="flex items-center justify-between px-[24px] pt-[20px] pb-[16px] border-b border-[#F4F4F4]">
                <h3 className="text-[18px] font-bold text-(--text-content-default)">Notifications</h3>
                <button 
                  className="text-[14px] font-semibold text-[#00A0A8] hover:text-[#00868D] transition-colors cursor-pointer"
                  onClick={handleNotifClose}
                >
                  Mark all as read
                </button>
              </div>

              {/* List */}
              <div className="flex flex-col max-h-[400px] sm:max-h-[500px] overflow-y-auto">
                {dummyNotifications.map((notif) => (
                  <div 
                    key={notif.id}
                    className={`flex items-start gap-[16px] p-[20px] border-b border-[#F4F4F4] last:border-none cursor-pointer transition-colors hover:bg-gray-50 ${!notif.isRead ? 'bg-[#F2FBFC]' : 'bg-white'}`}
                  >
                    {getNotificationIcon(notif.type)}
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-[8px]">
                        <h4 className={`text-[15px] leading-[20px] truncate ${!notif.isRead ? 'font-bold text-(--text-content-default)' : 'font-semibold text-gray-700'}`}>
                          {notif.title}
                        </h4>
                        <span className="text-[12px] font-medium text-gray-400 whitespace-nowrap shrink-0 mt-[2px]">{notif.time}</span>
                      </div>
                      <p className="text-[14px] leading-[20px] text-gray-500 mt-[4px] line-clamp-2">
                        {notif.description}
                      </p>
                    </div>
                    {!notif.isRead && (
                      <div className="w-[8px] h-[8px] rounded-full bg-[#E77731] shrink-0 mt-[6px]"></div>
                    )}
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="p-[16px] border-t border-[#F4F4F4] flex justify-center">
                <button 
                  className="text-[14px] font-bold text-(--text-content-default) hover:text-[#00A0A8] transition-colors cursor-pointer"
                  onClick={() => {
                    handleNotifClose();
                    navigate("/app/notifications");
                  }}
                >
                  View all notifications
                </button>
              </div>
            </div>
          </Menu>
        </div>
      </div>
    </>
  );
};

export default Header;
