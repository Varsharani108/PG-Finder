import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { createCashBooking, createStripeSession, getCheckoutDetails } from "../api/bookingApi.js";

const roomLabels = { single: "Single Sharing", double: "Double Sharing", triple: "Triple Sharing", "4+": "4+ Sharing" };
const today = new Date().toISOString().slice(0, 10);

function money(value) { return `₹${Number(value || 0).toLocaleString("en-IN")}`; }

export default function CheckoutPage() {
  const { propertyId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [form, setForm] = useState({ moveInDate: "", occupants: 1, paymentMethod: "cash" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true, state: { from: { pathname: `/checkout/${propertyId}` } } });
      return;
    }
    getCheckoutDetails(propertyId).then(setData).catch((requestError) => setError(requestError.message)).finally(() => setLoading(false));
  }, [isAuthenticated, navigate, propertyId]);

  const property = data?.property;
  const pricing = data?.pricing;
  const submit = async (event) => {
    event.preventDefault();
    if (!form.moveInDate) return setError("Please select a move-in date.");
    setSaving(true);
    setError("");
    const payload = { property: propertyId, roomType: data.room.type, moveInDate: form.moveInDate, occupants: Number(form.occupants) };
    try {
      if (form.paymentMethod === "stripe") {
        const result = await createStripeSession(payload);
        window.location.assign(result.checkoutUrl);
      } else {
        const result = await createCashBooking(payload);
        navigate(`/booking-confirmation/${result.booking._id}`);
      }
    } catch (requestError) {
      setError(requestError.message);
      setSaving(false);
    }
  };

  if (loading) return <><Navbar /><main className="search-page"><div className="search-wrap"><p className="text-sm text-slate">Loading checkout...</p></div></main><Footer /></>;
  if (error && !property) return <><Navbar /><main className="search-page"><div className="search-wrap"><section className="filter-panel"><h1 className="text-2xl font-semibold">Checkout unavailable</h1><p className="mt-2 text-sm text-red-600">{error}</p><Link to="/search" className="btn-primary mt-4 inline-block">Back to Find PG</Link></section></div></main><Footer /></>;

  return <div><Navbar /><main className="search-page"><div className="search-wrap"><Link to={`/property/${propertyId}`} className="text-sm text-slate">← Back to property</Link><h1 className="mt-5 text-3xl font-semibold">Complete your booking</h1><p className="mt-1 text-sm text-slate">Review the room and confirm how you would like to pay.</p>
    <form onSubmit={submit} className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-5">
        <section className="filter-panel"><h2 className="text-xl font-semibold">PG details</h2><div className="mt-4 flex gap-4">{property.images?.[0] ? <img src={property.images[0]} alt={property.name} className="h-24 w-32 rounded-lg object-cover" /> : <div className="h-24 w-32 rounded-lg bg-primary/5" />}<div><h3 className="font-semibold">{property.name}</h3><p className="mt-1 text-sm text-slate">{property.location}, {property.area || property.city}</p>{property.distanceFromCollege != null && <p className="mt-1 text-sm text-slate">{property.distanceFromCollege} m from college</p>}</div></div></section>
        <section className="filter-panel"><h2 className="text-xl font-semibold">Selected room</h2><div className="mt-4 grid gap-3 text-sm sm:grid-cols-2"><p><strong>Room type</strong><br />{roomLabels[data.room.type] || data.room.label}</p><p><strong>Availability</strong><br />{data.room.available} room(s) available</p><p><strong>Monthly rent</strong><br />{money(pricing.baseRent)}</p><p><strong>Occupants</strong><br />{form.occupants} occupant(s)</p></div><label className="mt-4 block text-sm font-medium">Number of occupants<input required min="1" max={data.room.type === "single" ? 1 : data.room.type === "double" ? 2 : data.room.type === "triple" ? 3 : 4} type="number" value={form.occupants} onChange={(event) => setForm({ ...form, occupants: event.target.value })} className="mt-1 w-full rounded-lg border border-primary/15 px-3 py-2.5" /></label></section>
        <section className="filter-panel"><h2 className="text-xl font-semibold">Booking information</h2><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium">Name<input readOnly value={user?.name || ""} className="mt-1 w-full rounded-lg border border-primary/15 bg-primary/5 px-3 py-2.5" /></label><label className="text-sm font-medium">Email<input readOnly value={user?.email || ""} className="mt-1 w-full rounded-lg border border-primary/15 bg-primary/5 px-3 py-2.5" /></label><label className="text-sm font-medium">Phone<input readOnly value={user?.phone || ""} className="mt-1 w-full rounded-lg border border-primary/15 bg-primary/5 px-3 py-2.5" /></label><label className="text-sm font-medium">Move-in date<input required min={today} type="date" value={form.moveInDate} onChange={(event) => setForm({ ...form, moveInDate: event.target.value })} className="mt-1 w-full rounded-lg border border-primary/15 px-3 py-2.5" /></label></div></section>
        <section className="filter-panel"><h2 className="text-xl font-semibold">Facilities and food</h2><div className="mt-4 grid gap-5 sm:grid-cols-2"><div><h3 className="font-medium">Facilities</h3>{pricing.facilities.length ? <ul className="mt-2 space-y-1 text-sm text-slate">{pricing.facilities.map((item) => <li key={item.name}>{item.name} · {item.includedInRent ? "Included" : `+${money(item.price)}/month`}</li>)}</ul> : <p className="mt-2 text-sm text-slate">No facilities selected.</p>}</div><div><h3 className="font-medium">Food</h3>{pricing.food.length ? <ul className="mt-2 space-y-1 text-sm text-slate">{pricing.food.map((item) => <li key={item.name}>{item.name} · {item.includedInRent ? "Included" : `+${money(item.price)}/month`}</li>)}</ul> : <p className="mt-2 text-sm text-slate">No food service selected.</p>}</div></div></section>
      </div>
      <aside className="filter-panel h-fit lg:sticky lg:top-24"><h2 className="text-xl font-semibold">Price summary</h2><div className="mt-4 space-y-2 text-sm text-slate"><div className="flex justify-between"><span>Room rent</span><span>{money(pricing.baseRent)}</span></div>{pricing.facilities.filter((item) => !item.includedInRent).map((item) => <div key={item.name} className="flex justify-between"><span>{item.name}</span><span>{money(item.price)}</span></div>)}{pricing.food.filter((item) => !item.includedInRent).map((item) => <div key={item.name} className="flex justify-between"><span>{item.name}</span><span>{money(item.price)}</span></div>)}<div className="flex justify-between border-t border-primary/10 pt-3 text-lg font-bold text-primary"><span>Total monthly amount</span><span>{money(pricing.total)}</span></div></div><fieldset className="mt-6"><legend className="font-semibold">Payment method</legend><label className="mt-3 flex cursor-pointer gap-2 text-sm"><input type="radio" checked={form.paymentMethod === "cash"} onChange={() => setForm({ ...form, paymentMethod: "cash" })} />Cash / Pay at Property</label><label className="mt-3 flex cursor-pointer gap-2 text-sm"><input type="radio" checked={form.paymentMethod === "stripe"} onChange={() => setForm({ ...form, paymentMethod: "stripe" })} />Pay online with Stripe</label></fieldset>{error && <p className="mt-4 text-sm text-red-600" role="alert">{error}</p>}<button disabled={saving || !data.room.available} className="btn-primary mt-6 w-full disabled:opacity-60">{saving ? "Processing..." : form.paymentMethod === "stripe" ? "Continue to secure payment" : "Book and pay at property"}</button></aside>
    </form></div></main><Footer /></div>;
}