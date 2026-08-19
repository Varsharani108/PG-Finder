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
    document.addEventListener("mousedown", closeMenus);
    return () => document.removeEventListener("mousedown", closeMenus);
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
  const navItemClass = (active = false) => `border-0 bg-transparent px-1 py-2 text-sm font-semibold transition-colors hover:bg-transparent hover:text-[#f2a93b] ${active ? "text-[#f2a93b]" : "text-[#16233f]"}`;
  const navItems = [
    { label: "Home", action: () => navigate("/"), active: location.pathname === "/" && !isSectionActive },
    { label: "Find PG", action: goToSearch, active: isSearchActive },
    { label: "Local Services", action: () => goToSection("offerings"), active: isSectionActive },
    { label: "Tiffin", action: () => goToSection("offerings"), active: isSectionActive },
    { label: "Explore Area", action: goToSearch, active: isSearchActive },
    { label: "About", action: () => navigate("/"), active: false },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-[#fffdf9]/95 shadow-[0_8px_24px_rgba(22,35,63,0.06)] backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-[72px] items-center justify-between gap-5">
          <Link to="/" className="group flex shrink-0 items-center gap-2.5" aria-label="PG Finder home">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#16233f] text-white shadow-lg shadow-[#16233f]/15 transition-transform group-hover:-rotate-6">
              <MapPin size={19} strokeWidth={2.6} />
            </span>
            <span className="text-[17px] font-bold tracking-[-0.03em] text-[#16233f]">PG Finder<span className="text-[#f2a93b]">.</span></span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
            {navItems.map(({ label, action, active }) => (
              <button key={label} onClick={() => handleNavClick(action)} className={navItemClass(active)}>
                {label}
              </button>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <div className="relative" ref={notificationsRef}>
              <button onClick={toggleNotifications} className="relative flex h-10 w-10 items-center justify-center rounded-xl border-0 bg-transparent text-[#16233f] outline-none ring-0 transition hover:bg-transparent hover:text-[#f2a93b] focus:outline-none focus:ring-0" aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ""}`} aria-expanded={notificationsOpen}>
                <Bell size={19} strokeWidth={2.1} />
                {unreadCount > 0 && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#f2a93b]" aria-label={`${unreadCount} unread notifications`} />}
              </button>
              {notificationsOpen && <div className="absolute right-0 top-12 w-80 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl"><div className="flex items-center justify-between gap-3 px-2 py-1"><p className="text-sm font-bold text-[#16233f]">Notifications</p>{unreadCount > 0 && <button onClick={readAllNotifications} className="border-0 bg-transparent text-xs font-semibold text-[#0e7c74]">Mark all read</button>}</div>{notifications.length ? <div className="mt-2 max-h-80 space-y-1 overflow-y-auto">{notifications.map((notification) => <button key={notification._id} onClick={() => readNotification(notification)} className={`w-full rounded-lg border-0 bg-transparent px-2 py-2 text-left transition hover:bg-[#f7f4ee] ${notification.readAt ? "opacity-60" : "bg-[#f7f4ee]"}`}><p className="text-xs font-bold text-[#16233f]">{notification.title}</p><p className="mt-0.5 text-xs leading-4 text-slate-500">{notification.message}</p><p className="mt-1 text-[10px] text-slate-400">{new Date(notification.createdAt).toLocaleDateString()}</p></button>)}</div> : <p className="px-2 py-5 text-center text-sm text-slate-500">No notifications yet.</p>}</div>}
            </div>
            {isAuthenticated ? (
              <div className="relative" ref={profileRef}>
                  <button onClick={() => { setProfileOpen(!profileOpen); setNotificationsOpen(false); }} className="dashboard-card flex items-center gap-2 border-0 p-1.5 pr-2.5 outline-none ring-0 transition focus:outline-none focus:ring-0" aria-label="Open profile menu" aria-expanded={profileOpen}>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f2a93b] text-xs font-bold text-[#16233f]">{initials}</span>
                    <span className="hidden text-left xl:block"><span className="block max-w-24 truncate text-xs font-bold text-[#16233f]">{displayName}</span><span className="block text-[11px] text-slate-500">{roleLabel}</span></span>
                    <ChevronDown size={15} className="text-slate-400" />
                  </button>
                  {profileOpen && <div className="absolute right-0 top-12 w-52 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl"><div className="border-b border-slate-100 px-3 py-2"><p className="truncate text-sm font-bold text-[#16233f]">{displayName}</p><p className="text-xs text-slate-500">{roleLabel} account</p></div><button onClick={() => { navigate(ROLE_HOME[user.role] || "/"); setProfileOpen(false); }} className={`mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 ${location.pathname === ROLE_HOME[user?.role] ? "dashboard-card text-[#f2a93b]" : "bg-transparent"}`}><LayoutDashboard size={16} /> Dashboard</button><button onClick={() => { logout(); setProfileOpen(false); }} className="flex w-full items-center gap-2 rounded-lg border-0 bg-transparent px-3 py-2.5 text-sm font-medium text-red-600"><LogOut size={16} /> Log out</button></div>}
                </div>
            ) : (
              <button onClick={() => navigate("/login")} className="rounded-xl border-0 bg-[linear-gradient(110deg,#16233f,#f2a93b)] px-4 py-2.5 text-sm font-bold text-white outline-none ring-0 shadow-none transition hover:brightness-105 focus:outline-none focus:ring-0">Sign In</button>
            )}
          </div>
          <button
            className="rounded-xl p-2.5 text-[#16233f] transition hover:bg-[#16233f]/[0.06] lg:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-slate-200/80 pb-5 pt-3 lg:hidden">
            <nav className="grid gap-1" aria-label="Mobile navigation">
              {navItems.map(({ label, action, active }) => (
                <button key={label} onClick={() => handleNavClick(action)} className={`border-0 bg-transparent px-1 py-3 text-left text-sm font-semibold transition-colors hover:bg-transparent hover:text-[#f2a93b] ${active ? "text-[#f2a93b]" : "text-[#16233f]"}`}>
                  {label}
                </button>
              ))}
            </nav>
            <div className="mt-3 flex gap-2 border-t border-slate-200 pt-4">
              {isAuthenticated ? <><button onClick={() => { navigate(ROLE_HOME[user.role] || "/"); setMenuOpen(false); }} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-3 text-sm font-semibold text-[#16233f]"><UserRound size={16} /> {roleLabel} dashboard</button><button onClick={() => { logout(); setMenuOpen(false); }} className="rounded-xl bg-[#16233f] px-4 py-3 text-sm font-semibold text-white">Log out</button></> : <button onClick={() => { navigate("/login"); setMenuOpen(false); }} className="flex-1 rounded-xl border-0 bg-[linear-gradient(110deg,#16233f,#f2a93b)] px-3 py-3 text-sm font-bold text-white outline-none ring-0 focus:outline-none focus:ring-0">Sign In</button>}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
