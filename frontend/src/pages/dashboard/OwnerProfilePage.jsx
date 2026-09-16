import { useEffect, useState } from "react";
import {
  Mail, Phone, User, Building2, Star, Eye, MessageSquare,
  Calendar, Lock, Save, X, AlertCircle, CheckCircle, Clock,
} from "lucide-react";
import DashboardShell from "./DashboardShell.jsx";
import { getOwnerProfile, updateOwnerProfile, changeOwnerPassword } from "../../api/ownerApi.js";
import { useAuth } from "../../context/AuthContext.jsx";

function Notice({ notice, onClose }) {
  if (!notice) return null;
  return (
    <div
      className={`fixed right-4 top-20 z-50 flex max-w-sm items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-xl ${
        notice.type === "error" ? "bg-red-600" : "bg-[#0e7c74]"
      }`}
      role="status"
    >
      <span>{notice.message}</span>
      <button onClick={onClose} aria-label="Close notification">
        <X size={16} />
      </button>
    </div>
  );
}

function VerificationBadge({ status }) {
  const statusConfig = {
    verified: {
      icon: CheckCircle,
      color: "text-emerald-600 bg-emerald-50",
      label: "Verified",
      description: "Your account is verified",
    },
    pending: {
      icon: Clock,
      color: "text-amber-600 bg-amber-50",
      label: "Pending",
      description: "Awaiting verification",
    },
    rejected: {
      icon: AlertCircle,
      color: "text-red-600 bg-red-50",
      label: "Rejected",
      description: "Verification rejected",
    },
  };

  const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;
  const IconComponent = config.icon;

  return (
    <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 ${config.color}`}>
      <IconComponent size={16} />
      <div>
        <p className="text-xs font-semibold">{config.label}</p>
        <p className="text-xs opacity-75">{config.description}</p>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, subtext }) {
  return (
    <div className="rounded-lg border border-primary/10 bg-white p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-primary/60">{label}</p>
          <p className="mt-2 text-2xl font-bold text-primary">{value}</p>
          {subtext && <p className="mt-1 text-xs text-primary/50">{subtext}</p>}
        </div>
        <div className="rounded-lg bg-primary/10 p-3">
          <Icon size={20} className="text-primary" />
        </div>
      </div>
    </div>
  );
}

function PersonalInfo({ user, form, setForm, saving, onSave }) {
  return (
    <section className="rounded-xl border border-primary/10 bg-white p-6">
      <h2 className="text-xl font-semibold text-primary">Personal Information</h2>
      <p className="mt-1 text-sm text-primary/60">Update your basic profile details.</p>

      <form onSubmit={onSave} className="mt-6 space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-primary">Full Name</span>
            <input
              type="text"
              required
              value={form.name || ""}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-2 w-full rounded-lg border border-primary/15 px-3 py-2.5 transition focus:border-accent focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-primary">Phone Number</span>
            <input
              type="tel"
              required
              pattern="[0-9]{10}"
              value={form.phone || ""}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="mt-2 w-full rounded-lg border border-primary/15 px-3 py-2.5 transition focus:border-accent focus:outline-none"
            />
          </label>
        </div>

        <div>
          <label className="block">
            <span className="text-sm font-medium text-primary">Email Address</span>
            <input
              type="email"
              disabled
              value={user?.email || ""}
              className="mt-2 w-full cursor-not-allowed rounded-lg border border-primary/15 bg-primary/5 px-3 py-2.5 text-primary/60"
            />
            <p className="mt-1 text-xs text-primary/50">Email cannot be changed for security reasons</p>
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-accent/90 disabled:opacity-60"
        >
          <Save size={16} />
          {saving ? "Updating..." : "Update Information"}
        </button>
      </form>
    </section>
  );
}

function AccountStatus({ user }) {
  return (
    <section className="rounded-xl border border-primary/10 bg-white p-6">
      <h2 className="text-xl font-semibold text-primary">Account Status</h2>
      <p className="mt-1 text-sm text-primary/60">Your account details and verification status.</p>

      <div className="mt-6 space-y-4">
        <div>
          <p className="text-xs text-primary/60">Account Type</p>
          <p className="mt-2 text-lg font-semibold text-primary capitalize">{user?.role || "owner"}</p>
        </div>

        <div>
          <p className="text-xs text-primary/60 mb-3">Verification Status</p>
          <VerificationBadge status={user?.verificationStatus} />
        </div>

        <div>
          <p className="text-xs text-primary/60">Owner Status</p>
          <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
            {user?.ownerStatus || "Approved"}
          </p>
        </div>

        <div>
          <p className="text-xs text-primary/60">Member Since</p>
          <p className="mt-2 text-sm text-primary">
            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN") : "N/A"}
          </p>
        </div>

        {user?.verificationStatus === "rejected" && user?.rejectionReason && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-xs font-semibold text-red-700">Rejection Reason</p>
            <p className="mt-2 text-sm text-red-600">{user.rejectionReason}</p>
          </div>
        )}
      </div>
    </section>
  );
}

function ChangePassword({ saving, onSubmit }) {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(passwordForm);
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setShowPasswords(false);
  };

  return (
    <section className="rounded-xl border border-primary/10 bg-white p-6">
      <h2 className="text-xl font-semibold text-primary">Change Password</h2>
      <p className="mt-1 text-sm text-primary/60">Update your password to keep your account secure.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-primary">Current Password</span>
          <input
            type={showPasswords ? "text" : "password"}
            required
            value={passwordForm.currentPassword}
            onChange={(e) =>
              setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
            }
            className="mt-2 w-full rounded-lg border border-primary/15 px-3 py-2.5 transition focus:border-accent focus:outline-none"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-primary">New Password</span>
          <input
            type={showPasswords ? "text" : "password"}
            required
            minLength="8"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            className="mt-2 w-full rounded-lg border border-primary/15 px-3 py-2.5 transition focus:border-accent focus:outline-none"
          />
          <p className="mt-1 text-xs text-primary/50">Minimum 8 characters</p>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-primary">Confirm New Password</span>
          <input
            type={showPasswords ? "text" : "password"}
            required
            minLength="8"
            value={passwordForm.confirmPassword}
            onChange={(e) =>
              setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
            }
            className="mt-2 w-full rounded-lg border border-primary/15 px-3 py-2.5 transition focus:border-accent focus:outline-none"
          />
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showPasswords}
            onChange={(e) => setShowPasswords(e.target.checked)}
            className="rounded border-primary/15"
          />
          <span className="text-sm text-primary/70">Show passwords</span>
        </label>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-accent/90 disabled:opacity-60"
        >
          <Lock size={16} />
          {saving ? "Updating..." : "Change Password"}
        </button>
      </form>
    </section>
  );
}

export default function OwnerProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "" });
  const [profileStats, setProfileStats] = useState(null);

  const showNotice = (message, type = "success") => setNotice({ message, type });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const { stats } = await getOwnerProfile();
        setProfileStats(stats);
        setForm({ name: user?.name || "", phone: user?.phone || "" });
      } catch (err) {
        showNotice(err.message || "Could not load profile", "error");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      showNotice("Name is required", "error");
      return;
    }
    if (!/^[0-9]{10}$/.test(form.phone)) {
      showNotice("Phone must be 10 digits", "error");
      return;
    }

    setSaving(true);
    try {
      await updateOwnerProfile(form);
      showNotice("Profile updated successfully");
    } catch (err) {
      showNotice(err.message || "Could not update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (passwordData) => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showNotice("New passwords do not match", "error");
      return;
    }
    if (passwordData.newPassword.length < 8) {
      showNotice("New password must be at least 8 characters", "error");
      return;
    }

    setSaving(true);
    try {
      await changeOwnerPassword(passwordData);
      showNotice("Password changed successfully");
    } catch (err) {
      showNotice(err.message || "Could not change password", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardShell>
      <Notice notice={notice} onClose={() => setNotice(null)} />

      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-xl bg-gradient-to-r from-accent to-accent/80 p-8 text-white">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
              <User size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{user?.name || "Profile"}</h1>
              <p className="mt-1 text-white/80">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="rounded-xl border border-primary/10 bg-white p-10 text-center text-sm text-primary/60">
            Loading your profile...
          </div>
        )}

        {/* Stats Grid */}
        {!loading && profileStats && (
          <section>
            <h2 className="mb-4 text-xl font-semibold text-primary">Your Statistics</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                icon={Building2}
                label="Total Properties"
                value={profileStats.totalProperties}
                subtext={`${profileStats.activeListings} active`}
              />
              <StatCard
                icon={Calendar}
                label="Total Bookings"
                value={profileStats.totalBookings}
                subtext={`${profileStats.activeBookings} active`}
              />
              <StatCard
                icon={MessageSquare}
                label="Total Inquiries"
                value={profileStats.totalInquiries}
                subtext={`${profileStats.newInquiries} new`}
              />
              <StatCard
                icon={Star}
                label="Average Rating"
                value={profileStats.averageRating}
                subtext={`From ${profileStats.totalReviews} reviews`}
              />
            </div>
          </section>
        )}

        {/* Main Content */}
        {!loading && (
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left Column - Personal Info and Status */}
              <div className="space-y-6 lg:col-span-2">
                <PersonalInfo
                  user={user}
                  form={form}
                  setForm={setForm}
                  saving={saving}
                  onSave={handleSaveProfile}
                />

                <ChangePassword saving={saving} onSubmit={handleChangePassword} />
              </div>

              {/* Right Column - Account Status */}
              <div>
                <AccountStatus user={user} />
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
