import { LogOut } from "lucide-react";
import Navbar from "../../components/Navbar.jsx";
import Footer from "../../components/Footer.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

export default function DashboardShell({ roleLabel, children }) {
  const { user, logout } = useAuth();

  return (
    <div className="auth-shell min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 w-full mx-auto px-4 py-8 sm:px-6 lg:px-10">
        <div className="bg-white rounded-xl2 border border-primary/5 shadow-[0_10px_40px_-12px_rgba(27,35,67,0.12)] p-5 sm:p-8">
          <p className="text-xs font-semibold tracking-widest uppercase text-accent-dark mb-2">
            {roleLabel} Dashboard
          </p>
          <h1 className="text-2xl font-semibold text-primary mb-1">Welcome, {user?.name}</h1>
          <p className="text-sm text-primary/60 mb-6">
            Signed in as {user?.email} · Role: {user?.role}
          </p>
          <div className="dashboard-content text-sm text-primary/70">{children}</div>
          <button
            onClick={logout}
            className="dashboard-shell-action mt-8 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-primary"
          >
            <LogOut size={15} />
            Log out
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
