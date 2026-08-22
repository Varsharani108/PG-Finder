import { useEffect, useState } from "react";
import {
  BarChart3, Building2, CalendarCheck2, CircleDollarSign,
  Eye, LayoutDashboard, Mail, MessageSquare, Pencil, Plus, Save, Star,
  Trash2, UserRound, Users, X,
} from "lucide-react";
import DashboardShell from "./DashboardShell.jsx";
import { createProperty, deleteProperty, updateProperty } from "../../api/propertyApi.js";
import { getOwnerDashboard, updateBookingStatus, updateInquiryStatus } from "../../api/ownerApi.js";
import { useAuth } from "../../context/AuthContext.jsx";

const emptyForm = { name: "", location: "", rooms: "", price: "", description: "" };
const tabs = [
  ["overview", "Overview", LayoutDashboard],
  ["properties", "My Properties", Building2],
  ["inquiries", "Inquiries", MessageSquare],
  ["bookings", "Bookings / Tenants", CalendarCheck2],
  ["reviews", "Reviews", Star],
  ["profile", "Profile", UserRound],
];

function Notice({ notice, onClose }) {
  if (!notice) return null;
  return <div className={`fixed right-4 top-20 z-50 flex max-w-sm items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-xl ${notice.type === "error" ? "bg-red-600" : "bg-[#0e7c74]"}`} role="status"><span>{notice.message}</span><button onClick={onClose} aria-label="Close notification"><X size={16} /></button></div>;
}

function Metric({ icon: Icon, label, value, onClick, tone }) {
  return <button onClick={onClick} className="dashboard-card w-full rounded-xl border border-primary/10 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><span className={`inline-flex rounded-xl p-3 ${tone}`}><Icon size={19} /></span><p className="mt-4 text-sm text-primary/60">{label}</p><p className="mt-1 text-2xl font-bold text-primary">{value}</p></button>;
}

export default function OwnerDashboard() {
  const { user, updateProfile } = useAuth();
  const [tab, setTab] = useState("properties");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: user?.name || "", phone: user?.phone || "" });
  const [profileSaving, setProfileSaving] = useState(false);

  const loadDashboard = async () => {
    setLoading(true);
    setError("");
    try { setData(await getOwnerDashboard()); } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  useEffect(() => { loadDashboard(); }, []);
  useEffect(() => { setProfileForm({ name: user?.name || "", phone: user?.phone || "" }); }, [user]);

  const showNotice = (message, type = "success") => setNotice({ message, type });
  const properties = data?.properties || [];
  const inquiries = data?.inquiries || [];
  const bookings = data?.bookings || [];
  const reviews = data?.reviews || [];
  const stats = data?.stats || {};

  const openAdd = () => {
    const canManageProperties = user?.verificationStatus === "verified" || user?.ownerStatus === "Approved";
    if (!canManageProperties) {
      showNotice("Your owner account must be verified before adding a property.", "error");
      return;
    }
    setEditingId(null);
    setForm(emptyForm);
    setFormOpen(true);
    setTab("properties");
  };
  const openEdit = (property) => { setEditingId(property._id); setForm({ name: property.name, location: property.location, rooms: property.rooms, price: property.price, description: property.description || "" }); setFormOpen(true); setTab("properties"); };
  const saveProperty = async (event) => {
    event.preventDefault(); setSaving(true); setError("");
    try {
      const payload = { ...form, rooms: Number(form.rooms) };
      if (editingId) await updateProperty(editingId, payload); else await createProperty(payload);
      await loadDashboard(); setForm(emptyForm); setEditingId(null); setFormOpen(false); showNotice(editingId ? "Property updated successfully." : "Property added successfully.");
    } catch (err) { setError(err.message); showNotice(err.message, "error"); } finally { setSaving(false); }
  };
  const removeProperty = async (property) => {
    if (!window.confirm(`Delete ${property.name}? This cannot be undone.`)) return;
    try { await deleteProperty(property._id); await loadDashboard(); showNotice("Property deleted successfully."); } catch (err) { showNotice(err.message, "error"); }
  };
  const changeInquiryStatus = async (id, status) => {
    try { await updateInquiryStatus(id, status); await loadDashboard(); showNotice("Inquiry status updated."); } catch (err) { showNotice(err.message, "error"); }
  };
  const changeBookingStatus = async (id, status) => {
    try { await updateBookingStatus(id, status); await loadDashboard(); showNotice("Booking status updated."); } catch (err) { showNotice(err.message, "error"); }
  };
  const saveProfile = async (event) => {
    event.preventDefault(); setProfileSaving(true);
    try { await updateProfile(profileForm); showNotice("Profile updated successfully."); } catch (err) { showNotice(err.message, "error"); } finally { setProfileSaving(false); }
  };

  const content = () => {
    if (loading) return <div className="rounded-xl border border-primary/10 bg-white p-10 text-center text-sm text-primary/60">Loading your owner dashboard...</div>;
    if (error && !data) return <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700"><p>{error}</p><button onClick={loadDashboard} className="mt-3 rounded-lg bg-red-600 px-4 py-2 font-medium text-white">Try again</button></div>;
    if (tab === "overview") return <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={Building2} label="Total Properties" value={stats.totalProperties ?? 0} onClick={() => setTab("properties")} tone="bg-blue-50 text-blue-700" />
        <Metric icon={Users} label="Active Tenants" value={stats.activeTenants ?? 0} onClick={() => setTab("bookings")} tone="bg-green-50 text-green-700" />
        <Metric icon={MessageSquare} label="New Inquiries" value={stats.newInquiries ?? 0} onClick={() => setTab("inquiries")} tone="bg-purple-50 text-purple-700" />
        <Metric icon={CircleDollarSign} label="Revenue This Month" value={`₹${(stats.revenueThisMonth ?? 0).toLocaleString("en-IN")}`} onClick={() => setTab("bookings")} tone="bg-orange-50 text-orange-700" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <section className="rounded-xl border border-primary/10 bg-white p-5"><div className="flex items-center justify-between"><div><h2 className="font-semibold text-primary">Recent enquiries</h2><p className="mt-1 text-sm text-primary/60">Live activity from your properties.</p></div><button onClick={() => setTab("inquiries")} className="text-sm font-semibold text-accent">View all</button></div>{inquiries.length ? <div className="mt-5 space-y-3">{inquiries.slice(0, 5).map((item) => <div key={item._id} className="flex items-start gap-3 rounded-lg bg-primary/5 p-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-primary">{item.tenant?.name?.slice(0, 2).toUpperCase() || "?"}</span><div className="min-w-0 flex-1"><p className="text-sm font-medium text-primary">{item.tenant?.name || "Unknown tenant"}</p><p className="text-xs text-primary/60">{item.property?.name || "Property removed"}</p><p className="mt-1 truncate text-xs text-primary/50">{item.message}</p></div><span className="text-xs text-primary/50">{item.status}</span></div>)}</div> : <p className="mt-6 text-sm text-primary/60">No enquiries yet.</p>}</section>
        <section className="rounded-xl bg-primary p-5 text-white"><div className="flex items-center justify-between"><div><p className="text-sm text-white/60">Owner performance</p><p className="mt-2 text-3xl font-bold">{stats.averageRating || "—"}</p><p className="mt-1 text-sm text-white/70">Average review rating</p></div><BarChart3 /></div><div className="mt-8 grid grid-cols-2 gap-3 text-sm"><div className="rounded-lg bg-white/10 p-3"><p className="text-white/60">Active listings</p><p className="mt-1 font-bold">{stats.activeListings ?? 0}</p></div><div className="rounded-lg bg-white/10 p-3"><p className="text-white/60">Reviews</p><p className="mt-1 font-bold">{reviews.length}</p></div></div></section>
      </div>
    </>;
    if (tab === "properties") return <section className="space-y-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-semibold text-primary">My Properties</h2><p className="mt-1 text-sm text-primary/60">Only properties owned by your account are shown.</p></div><button onClick={openAdd} className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white"><Plus size={16} /> Add Property</button></div>{formOpen && <form onSubmit={saveProperty} className="rounded-xl border border-accent/20 bg-white p-5"><h3 className="font-semibold text-primary">{editingId ? "Edit Property" : "Add Property"}</h3>{error && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}<div className="mt-4 grid gap-4 sm:grid-cols-2"><input required name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Property name" className="rounded-lg border border-primary/15 px-3 py-2.5" /><input required name="location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Location" className="rounded-lg border border-primary/15 px-3 py-2.5" /><input required min="1" type="number" name="rooms" value={form.rooms} onChange={(e) => setForm({ ...form, rooms: e.target.value })} placeholder="Number of rooms" className="rounded-lg border border-primary/15 px-3 py-2.5" /><input required name="price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Price range" className="rounded-lg border border-primary/15 px-3 py-2.5" /><textarea name="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows="3" className="sm:col-span-2 rounded-lg border border-primary/15 px-3 py-2.5" /></div><div className="mt-4 flex gap-2"><button disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"><Save size={15} /> {saving ? "Saving..." : "Save"}</button><button type="button" onClick={() => setFormOpen(false)} className="rounded-lg border border-primary/15 px-4 py-2 text-sm">Cancel</button></div></form>}{properties.length ? properties.map((property) => <article key={property._id} className="rounded-xl border border-primary/10 bg-white p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div className="flex gap-3"><span className="rounded-lg bg-primary/5 p-3"><Building2 className="text-primary" /></span><div><h3 className="font-semibold text-primary">{property.name}</h3><p className="mt-1 text-sm text-primary/60">{property.location} · {property.rooms} rooms · {property.price}</p><span className="mt-3 inline-block rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">{property.status}</span></div></div><div className="flex gap-1"><button onClick={() => openEdit(property)} className="rounded-lg p-2 text-primary/60 hover:bg-primary/5" aria-label="Edit property"><Pencil size={16} /></button><button onClick={() => removeProperty(property)} className="rounded-lg p-2 text-red-500 hover:bg-red-50" aria-label="Delete property"><Trash2 size={16} /></button></div></div></article>) : <div className="rounded-xl border border-dashed border-primary/20 bg-white p-8 text-center text-sm text-primary/60">No properties found. Add your first property.</div>}</section>;
    if (tab === "inquiries") return <section className="rounded-xl border border-primary/10 bg-white p-5"><div className="mb-5"><h2 className="text-xl font-semibold text-primary">Inquiries</h2><p className="mt-1 text-sm text-primary/60">Review and update enquiries for your properties.</p></div>{inquiries.length ? <div className="space-y-3">{inquiries.map((item) => <div key={item._id} className="flex flex-col gap-3 rounded-lg border border-primary/10 p-4 lg:flex-row lg:items-center"><div className="min-w-0 flex-1"><p className="font-medium text-primary">{item.tenant?.name || "Unknown tenant"}</p><p className="text-sm text-primary/60">{item.tenant?.email || ""} · {item.property?.name || "Property removed"}</p><p className="mt-2 text-sm text-primary/70">{item.message}</p></div><select value={item.status} onChange={(e) => changeInquiryStatus(item._id, e.target.value)} className="rounded-lg border border-primary/15 px-3 py-2 text-sm"><option>New</option><option>Viewed</option><option>Replied</option><option>Closed</option></select><a href={`mailto:${item.tenant?.email || ""}`} className="inline-flex items-center gap-1 text-sm font-semibold text-accent"><Mail size={15} /> Reply</a></div>)}</div> : <p className="py-8 text-center text-sm text-primary/60">No enquiries found.</p>}</section>;
    if (tab === "bookings") return <section className="rounded-xl border border-primary/10 bg-white p-5"><h2 className="text-xl font-semibold text-primary">Bookings & Tenants</h2><p className="mt-1 text-sm text-primary/60">Live bookings belonging to your properties.</p>{bookings.length ? <div className="mt-5 space-y-3">{bookings.map((booking) => <div key={booking._id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/10 p-4"><div><p className="font-medium text-primary">{booking.user?.name || booking.tenant?.name || "Unknown tenant"}</p><p className="text-sm text-primary/60">{booking.property?.name || "Property removed"} · {booking.user?.phone || booking.tenant?.phone || ""}</p><p className="text-xs text-primary/50">Requested {new Date(booking.bookingDate || booking.createdAt).toLocaleDateString()}{booking.moveInDate ? ` · Move in ${new Date(booking.moveInDate).toLocaleDateString()}` : ""}</p></div><span className="rounded-full bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">{booking.status}</span><strong className="text-primary">₹{(booking.amount || booking.rent || 0).toLocaleString("en-IN")}</strong>{booking.status === "Pending" && <div className="flex gap-2"><button onClick={() => changeBookingStatus(booking._id, "Confirmed")} className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white">Accept</button><button onClick={() => changeBookingStatus(booking._id, "Rejected")} className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white">Reject</button></div>}{booking.status === "Confirmed" && <button onClick={() => changeBookingStatus(booking._id, "Cancelled")} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600">Cancel</button>}</div>)}</div> : <p className="py-8 text-center text-sm text-primary/60">No bookings or tenants found.</p>}</section>;
    if (tab === "reviews") return <section className="rounded-xl border border-primary/10 bg-white p-5"><h2 className="text-xl font-semibold text-primary">Reviews</h2><p className="mt-1 text-sm text-primary/60">Reviews for your properties.</p>{reviews.length ? <div className="mt-5 space-y-3">{reviews.map((review) => <article key={review._id} className="rounded-lg border border-primary/10 p-4"><div className="flex justify-between gap-3"><div><p className="font-medium text-primary">{review.tenant?.name || "Tenant"}</p><p className="text-sm text-primary/60">{review.property?.name || "Property removed"}</p></div><span className="font-semibold text-accent">{review.rating}/5 ★</span></div><p className="mt-3 text-sm text-primary/70">{review.comment || "No written comment."}</p></article>)}</div> : <p className="py-8 text-center text-sm text-primary/60">No reviews found.</p>}</section>;
    return <section className="max-w-2xl rounded-xl border border-primary/10 bg-white p-5"><h2 className="text-xl font-semibold text-primary">Profile</h2><p className="mt-1 text-sm text-primary/60">Update your owner account details.</p><form onSubmit={saveProfile} className="mt-5 space-y-4"><label className="block text-sm font-medium text-primary">Full name<input required value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} className="mt-2 w-full rounded-lg border border-primary/15 px-3 py-2.5" /></label><label className="block text-sm font-medium text-primary">Phone<input required pattern="[0-9]{10}" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} className="mt-2 w-full rounded-lg border border-primary/15 px-3 py-2.5" /></label><p className="text-sm text-primary/60">Email: {user?.email}</p><button disabled={profileSaving} className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{profileSaving ? "Updating..." : "Update profile"}</button></form></section>;
  };

  return <DashboardShell roleLabel="Owner"><Notice notice={notice} onClose={() => setNotice(null)} /><div className="space-y-6"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm text-primary/60">Owner workspace</p><h1 className="mt-1 text-2xl font-bold text-primary">Manage your PG business</h1></div><button onClick={openAdd} className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white"><Plus size={16} /> Add Property</button></div><nav className="flex gap-1 overflow-x-auto border-b border-primary/10" aria-label="Owner dashboard tabs">{tabs.map(([id, label, Icon]) => <button key={id} onClick={() => setTab(id)} className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium ${tab === id ? "border-accent text-accent" : "border-transparent text-primary/60 hover:text-primary"}`}><Icon size={16} />{label}</button>)}</nav>{content()}</div></DashboardShell>;
}
