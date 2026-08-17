import { useState } from "react";
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
    description: "You can now set up automated daily savings. Check it out and start saving effortlessly!",
    time: "1 hour ago",
    type: "info",
    isRead: false,
  },
  {
    id: 3,
    title: "Security Update",
    description: "We noticed a new login from a Mac device in Lagos. If this wasn't you, please secure your account immediately.",
    time: "Yesterday",
    type: "warning",
    isRead: true,
  },
  {
    id: 4,
    title: "Monthly Statement",
    description: "Your July investment statement is ready for download. View your performance summary.",
    time: "3 days ago",
    type: "document",
    isRead: true,
  },
  {
    id: 5,
    title: "Deposit Received",
    description: "Your wallet has been credited with ₦10,000 via Bank Transfer.",
    time: "Last week",
    type: "success",
    isRead: true,
  },
  {
    id: 6,
    title: "Risk Assessment Updated",
    description: "Your investor profile has been updated to 'Aggressive'. Your recommended portfolios have been adjusted.",
    time: "Last week",
    type: "info",
    isRead: true,
  }
];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "success":
      return (
        <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full bg-[#E8F8F5] text-[#00A0A8]">
          <i className="ri-checkbox-circle-fill text-[24px]"></i>
        </div>
      );
    case "info":
      return (
        <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-500">
          <i className="ri-information-fill text-[24px]"></i>
        </div>
      );
    case "warning":
      return (
        <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-500">
          <i className="ri-error-warning-fill text-[24px]"></i>
        </div>
      );
    case "document":
      return (
        <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full bg-purple-50 text-purple-500">
          <i className="ri-file-list-3-fill text-[24px]"></i>
        </div>
      );
    default:
      return (
        <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full bg-gray-50 text-gray-500">
          <i className="ri-notification-fill text-[24px]"></i>
        </div>
      );
  }
};

const NotificationCenter = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [notifications, setNotifications] = useState(dummyNotifications);

  const filteredNotifications = notifications.filter(notif => {
    if (filter === "unread") return !notif.isRead;
    return true;
  });

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  return (
    <div className="w-full max-w-[800px] mx-auto pb-[100px] mt-[16px]">
      {/* Header area */}
      <div className="flex items-center gap-[12px] mb-[32px]">
        <button 
          onClick={() => navigate(-1)}
          className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-[#F5F5F5] text-[#5A5A5A] transition-colors hover:bg-[#EBEBEB] cursor-pointer"
        >
          <i className="ri-arrow-left-s-line text-[24px]"></i>
        </button>
        <h1 className="text-[28px] font-bold text-(--text-content-default) tracking-tight">Notification Center</h1>
      </div>

      <div className="bg-white rounded-[24px] border border-[#F4F4F4] shadow-sm overflow-hidden">
        
        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-[24px] border-b border-[#F4F4F4] gap-[16px]">
          <div className="flex items-center gap-[12px] bg-[#F9F9F9] p-[4px] rounded-[12px] w-fit">
            <button 
              onClick={() => setFilter("all")}
              className={`px-[16px] py-[8px] rounded-[8px] text-[14px] font-semibold transition-all cursor-pointer ${filter === "all" ? "bg-white shadow-[0px_2px_4px_rgba(0,0,0,0.04)] text-(--text-content-default)" : "text-gray-500 hover:text-gray-700"}`}
            >
              All Notifications
            </button>
            <button 
              onClick={() => setFilter("unread")}
              className={`px-[16px] py-[8px] rounded-[8px] text-[14px] font-semibold transition-all flex items-center gap-[6px] cursor-pointer ${filter === "unread" ? "bg-white shadow-[0px_2px_4px_rgba(0,0,0,0.04)] text-(--text-content-default)" : "text-gray-500 hover:text-gray-700"}`}
            >
              Unread
              {notifications.filter(n => !n.isRead).length > 0 && (
                <span className="px-[6px] py-[2px] rounded-full bg-[#E77731] text-white text-[11px] font-bold leading-none flex items-center justify-center min-w-[20px]">
                  {notifications.filter(n => !n.isRead).length}
                </span>
              )}
            </button>
          </div>
          
          <button 
            onClick={markAllAsRead}
            disabled={notifications.every(n => n.isRead)}
            className="text-[14px] font-semibold text-[#00A0A8] hover:text-[#00868D] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Mark all as read
          </button>
        </div>

        {/* List */}
        <div className="flex flex-col">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-[80px] text-center px-[20px]">
              <div className="w-[80px] h-[80px] rounded-full bg-gray-50 flex items-center justify-center mb-[16px]">
                <i className="ri-notification-off-line text-[32px] text-gray-300"></i>
              </div>
              <h3 className="text-[18px] font-bold text-(--text-content-default) mb-[8px]">No notifications found</h3>
              <p className="text-[14px] text-gray-500 max-w-[300px]">
                {filter === "unread" 
                  ? "You're all caught up! You have no unread notifications."
                  : "You don't have any notifications yet. They will appear here when you do."}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div 
                key={notif.id}
                className={`flex items-start gap-[16px] sm:gap-[20px] p-[24px] border-b border-[#F4F4F4] last:border-none cursor-pointer transition-colors hover:bg-gray-50 ${!notif.isRead ? 'bg-[#F2FBFC]' : 'bg-white'}`}
              >
                {getNotificationIcon(notif.type)}
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-[16px]">
                    <h4 className={`text-[16px] leading-[22px] ${!notif.isRead ? 'font-bold text-(--text-content-default)' : 'font-semibold text-gray-700'}`}>
                      {notif.title}
                    </h4>
                    <span className="text-[13px] font-medium text-gray-400 whitespace-nowrap shrink-0 mt-[2px]">{notif.time}</span>
                  </div>
                  <p className={`text-[15px] leading-[22px] mt-[6px] ${!notif.isRead ? 'text-gray-600' : 'text-gray-500'}`}>
                    {notif.description}
                  </p>
                </div>
                {!notif.isRead && (
                  <div className="w-[10px] h-[10px] rounded-full bg-[#E77731] shrink-0 mt-[6px]"></div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
