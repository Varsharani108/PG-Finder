import { useEffect, useRef, useState } from "react";
import {
  Bell,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  UserRound,
  X,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getNotifications, markAllNotificationsRead, markNotificationRead } from "../api/notificationApi.js";

const ROLE_HOME = {
  user: "/user/dashboard",
  owner: "/owner/dashboard",
  admin: "/admin/dashboard",
};

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const profileRef = useRef(null);
  const notificationsRef = useRef(null);

  useEffect(() => {
    const closeMenus = (event) => {
      if (!profileRef.current?.contains(event.target)) setProfileOpen(false);
      if (!notificationsRef.current?.contains(event.target)) setNotificationsOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setProfileOpen(false);
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", closeMenus);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeMenus);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const loadNotifications = async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    try {
      const data = await getNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    loadNotifications();
    // Refresh when the authenticated account changes, not on every navbar render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id]);

  const toggleNotifications = async () => {
    const nextOpen = !notificationsOpen;
    setNotificationsOpen(nextOpen);
    setProfileOpen(false);
    if (nextOpen) await loadNotifications();
  };

  const readNotification = async (notification) => {
    if (notification.readAt) return;
    try {
      await markNotificationRead(notification._id);
      setNotifications((items) => items.map((item) => item._id === notification._id ? { ...item, readAt: new Date().toISOString() } : item));
      setUnreadCount((count) => Math.max(0, count - 1));
    } catch {
      // Keep the item unread when the server could not persist the action.
    }
  };

  const readAllNotifications = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((items) => items.map((item) => ({ ...item, readAt: item.readAt || new Date().toISOString() })));
      setUnreadCount(0);
    } catch {
      // Keep the server count when the action fails.
    }
  };

  // Scrolls to a section on the home/About page. If we're not already on
  // "/", it navigates there first and then scrolls once the page mounts.
  const goToSection = (sectionId) => {
    if (location.pathname !== "/") {
      navigate(`/#${sectionId}`);
      return;
    }
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  const handleNavClick = (callback) => {
    callback();
    setMenuOpen(false);
  };

  const goToSearch = () => {
    if (isAuthenticated) navigate("/search");
    else navigate("/login");
  };

  const displayName = user?.name || user?.email?.split("@")[0] || "Account";
  const roleLabel = user?.role ? `${user.role.charAt(0).toUpperCase()}${user.role.slice(1)}` : "Member";
  const initials = displayName.slice(0, 2).toUpperCase();
  const isSearchActive = location.pathname === "/search";
  const isSectionActive = location.pathname === "/" && location.hash === "#offerings";
  const navItems = [
    { label: "Home", action: () => navigate("/"), active: location.pathname === "/" && !isSectionActive },
    { label: "Find a PG", action: goToSearch, active: isSearchActive },
    { label: "Services", action: () => goToSection("offerings"), active: isSectionActive },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-[68px] items-center justify-between gap-3 sm:gap-5">
          <Link to="/" className="group flex shrink-0 items-center gap-2.5 no-underline " aria-label="PG Finder home" onClick={() => setMenuOpen(false)}>
            <span className="flex h-9 w-9  items-center justify-center rounded-lg bg-[#16233f] text-white">
              <MapPin size={18} strokeWidth={2.2} />
            </span>
            <span className="text-[17px] font-bold tracking-[-0.035em] text-[#16233f] sm:text-[18px]">PG Finder</span>
          </Link>

          <nav className="hidden h-full items-center gap-8 lg:flex" aria-label="Primary navigation">
            {navItems.map(({ label, action, active }) => (
              <button
                key={label}
                type="button"
                onClick={() => handleNavClick(action)}
                aria-current={active ? "page" : undefined}
                className={`relative flex h-full items-center border-0 border-b-2 px-0 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#f2a93b] ${
                  active
                    ? "border-[#f2a93b] bg-transparent text-[#16233f]"
                    : "border-transparent bg-transparent text-slate-600 hover:text-[#16233f]"
                }`}
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <div className="relative" ref={notificationsRef}>
              <button
                type="button"
                onClick={toggleNotifications}
                className={`relative flex h-10 w-10 items-center justify-center rounded-lg border border-transparent text-slate-600 transition-colors hover:bg-slate-50 hover:text-[#16233f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2a93b] ${notificationsOpen ? "bg-slate-50 text-[#16233f]" : "bg-transparent"}`}
                aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ""}`}
                aria-expanded={notificationsOpen}
                aria-haspopup="dialog"
              >
                <Bell size={19} strokeWidth={2.1} />
                {unreadCount > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#f2a93b] ring-2 ring-white" aria-label={`${unreadCount} unread notifications`} />}
              </button>
              {notificationsOpen && (
                <div role="dialog" aria-label="Notifications" className="absolute right-0 top-12 z-50 w-[min(22rem,calc(100vw-2rem))] rounded-xl border border-slate-200 bg-white p-3 shadow-[0_12px_32px_rgba(15,23,42,0.12)]">
                  <div className="flex items-center justify-between gap-3 px-2 py-1">
                    <div>
                      <p className="text-sm font-bold text-[#16233f]">Notifications</p>
                      <p className="mt-0.5 text-[11px] text-[#5c6478]">{unreadCount ? `${unreadCount} unread` : "You're all caught up"}</p>
                    </div>
                    {unreadCount > 0 && <button type="button" onClick={readAllNotifications} className="rounded-lg border-0 bg-transparent px-2 py-1.5 text-xs font-semibold text-[#0e7c74] transition hover:bg-[#eaf5f2]">Mark all read</button>}
                  </div>
                  {notifications.length ? (
                    <div className="mt-2 max-h-80 space-y-1 overflow-y-auto">
                      {notifications.map((notification) => (
                        <button
                          type="button"
                          key={notification._id}
                          onClick={() => readNotification(notification)}
                          className={`w-full rounded-lg border-0 px-3 py-2.5 text-left transition hover:bg-slate-50 ${notification.readAt ? "bg-white opacity-60" : "bg-slate-50"}`}
                        >
                          <p className="text-xs font-bold text-[#16233f]">{notification.title}</p>
                          <p className="mt-1 text-xs leading-4 text-[#5c6478]">{notification.message}</p>
                          <p className="mt-1.5 text-[10px] text-slate-400">{new Date(notification.createdAt).toLocaleDateString()}</p>
                        </button>
                      ))}
                    </div>
                  ) : <p className="px-2 py-6 text-center text-sm text-[#5c6478]">No notifications yet.</p>}
                </div>
              )}
            </div>
            {isAuthenticated ? (
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => { setProfileOpen(!profileOpen); setNotificationsOpen(false); }}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-1.5 pr-2.5 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2a93b]"
                  aria-label="Open profile menu"
                  aria-expanded={profileOpen}
                  aria-haspopup="menu"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-[#16233f]">{initials}</span>
                  <span className="hidden text-left xl:block"><span className="block max-w-24 truncate text-xs font-bold text-[#16233f]">{displayName}</span><span className="block text-[11px] text-[#5c6478]">{roleLabel}</span></span>
                  <ChevronDown size={15} className={`text-slate-400 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`} />
                </button>
                {profileOpen && (
                  <div role="menu" className="absolute right-0 top-12 z-50 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-[0_12px_32px_rgba(15,23,42,0.12)]">
                    <div className="border-b border-slate-100 px-3 py-2.5">
                      <p className="truncate text-sm font-bold text-[#16233f]">{displayName}</p>
                      <p className="text-xs text-[#5c6478]">{roleLabel} account</p>
                    </div>
                    <button type="button" role="menuitem" onClick={() => { navigate(ROLE_HOME[user.role] || "/"); setProfileOpen(false); }} className={`mt-1 flex w-full items-center gap-2 rounded-lg border-0 px-3 py-2.5 text-sm font-medium transition hover:bg-slate-50 ${location.pathname === ROLE_HOME[user?.role] ? "bg-slate-50 text-[#16233f]" : "bg-transparent text-slate-600"}`}><LayoutDashboard size={16} /> Dashboard</button>
                    {user?.role === "owner" && <button type="button" role="menuitem" onClick={() => { navigate("/owner/profile"); setProfileOpen(false); }} className={`flex w-full items-center gap-2 rounded-lg border-0 px-3 py-2.5 text-sm font-medium transition hover:bg-slate-50 ${location.pathname === "/owner/profile" ? "bg-slate-50 text-[#16233f]" : "bg-transparent text-slate-600"}`}><UserRound size={16} /> My Profile</button>}
                    <button type="button" role="menuitem" onClick={() => { logout(); setProfileOpen(false); }} className="flex w-full items-center gap-2 rounded-xl border-0 bg-transparent px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"><LogOut size={16} /> Log out</button>
                  </div>
                )}
              </div>
            ) : (
              <button type="button" onClick={() => navigate("/login")} className="rounded-lg border-0 bg-[#16233f] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2a3a5c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2a93b] focus-visible:ring-offset-2">
                Sign in
              </button>
            )}
          </div>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-[#16233f] transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2a93b] lg:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {menuOpen && (
          <div id="mobile-navigation" className="border-t border-slate-200 pb-5 pt-4 lg:hidden">
            <nav className="grid gap-1" aria-label="Mobile navigation">
              {navItems.map(({ label, action, active }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => handleNavClick(action)}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center justify-between rounded-lg border-0 px-3 py-3 text-left text-sm font-medium transition-colors ${
                    active ? "bg-slate-50 text-[#16233f]" : "bg-transparent text-slate-600 hover:bg-slate-50 hover:text-[#16233f]"
                  }`}
                >
                  {label}
                  {active && <span className="h-1.5 w-1.5 rounded-full bg-[#f2a93b]" />}
                </button>
              ))}
            </nav>
            <div className="mt-4 border-t border-[#e3ddcb]/70 pt-4">
              {isAuthenticated ? (
                <>
                  <div className="mb-3 flex items-center gap-3 px-1">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-[#16233f]">{initials}</span>
                    <span className="min-w-0"><span className="block truncate text-sm font-bold text-[#16233f]">{displayName}</span><span className="block text-xs text-[#5c6478]">{roleLabel} account</span></span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => { navigate(ROLE_HOME[user.role] || "/"); setMenuOpen(false); }} className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-[#16233f] transition hover:bg-slate-50"><LayoutDashboard size={16} /> Dashboard</button>
                    {user?.role === "owner" && <button type="button" onClick={() => { navigate("/owner/profile"); setMenuOpen(false); }} className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-[#16233f] transition hover:bg-slate-50"><UserRound size={16} /> My Profile</button>}
                    <button type="button" onClick={() => { logout(); setMenuOpen(false); }} className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"><LogOut size={16} /> Log out</button>
                  </div>
                </>
              ) : (
                <button type="button" onClick={() => { navigate("/login"); setMenuOpen(false); }} className="flex w-full items-center justify-center rounded-lg border-0 bg-[#16233f] px-3 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2a3a5c]">
                  Sign in to get started
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
