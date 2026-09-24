import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { createCashBooking, createStripeSession, getCheckoutDetails } from "../api/bookingApi.js";

const roomLabels = { single: "Single Sharing", double: "Double Sharing", triple: "Triple Sharing", "4+": "4+ Sharing" };
const genderLabels = { male: "Male", female: "Female" };
const today = new Date().toISOString().slice(0, 10);

function money(value) { return `₹${Number(value || 0).toLocaleString("en-IN")}`; }
function roomRent(property, roomType, fallback) { return Number(property?.roomTypePricing?.[roomType] ?? fallback) || 0; }

export default function CheckoutPage() {
  const { propertyId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [form, setForm] = useState({ moveInDate: "", roomType: "", occupantGenderCounts: {}, paymentMethod: "cash" });
  const [selectedFacilities, setSelectedFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true, state: { from: { pathname: `/checkout/${propertyId}` } } });
      return;
    }
    getCheckoutDetails(propertyId).then((checkoutData) => {
      setData(checkoutData);
      setSelectedFacilities((checkoutData.pricing?.facilities || []).filter((facility) => !facility.includedInRent).map((facility) => facility.name));
    }).catch((requestError) => setError(requestError.message)).finally(() => setLoading(false));
  }, [isAuthenticated, navigate, propertyId]);

  const property = data?.property;
  const pricing = data?.pricing;
  const selectedRoomType = form.roomType || data?.room?.type;
  const ownerGenderPreferences = Array.isArray(property?.genderPreference) ? property.genderPreference : property?.genderPreference ? [property.genderPreference] : [];
  const allowedGenders = ownerGenderPreferences.includes("co-living") ? ["male", "female"] : ownerGenderPreferences.filter((gender) => genderLabels[gender]);
  const occupantGenderCounts = allowedGenders.reduce((counts, gender) => ({ ...counts, [gender]: Number(form.occupantGenderCounts?.[gender] || 0) }), {});
  const occupantTotal = Object.values(occupantGenderCounts).reduce((total, count) => total + count, 0);
  const maxOccupants = selectedRoomType === "single" ? 1 : selectedRoomType === "double" ? 2 : selectedRoomType === "triple" ? 3 : 4;
  const selectedRent = roomRent(property, selectedRoomType, pricing?.baseRent);
  const selectedTotal = selectedRent
    + (pricing?.facilities || []).reduce((sum, item) => item.includedInRent || selectedFacilities.includes(item.name) ? sum + (Number(item.price) || 0) : sum, 0)
    + (pricing?.food || []).reduce((sum, item) => sum + (item.includedInRent ? 0 : Number(item.price) || 0), 0);
  const submit = async (event) => {
    event.preventDefault();
    if (!form.moveInDate) return setError("Please select a move-in date.");
    setSaving(true);
    setError("");
    const roomType = form.roomType || data.room.type;
    if (!occupantTotal || occupantTotal > maxOccupants) return setError(`Select between 1 and ${maxOccupants} occupant${maxOccupants === 1 ? "" : "s"}.`);
    const payload = { property: propertyId, roomType, moveInDate: form.moveInDate, occupants: occupantTotal, occupantGenderCounts, selectedFacilities };
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
        <section className="filter-panel"><h2 className="text-xl font-semibold">Property owner</h2><div className="mt-4 grid gap-3 text-sm sm:grid-cols-2"><p><strong>Name</strong><br />{data.owner?.name || "Owner unavailable"}</p><p><strong>Phone</strong><br />{data.owner?.phone || "Phone unavailable"}</p><p><strong>Email</strong><br />{data.owner?.email || "Email unavailable"}</p><p><strong>City</strong><br />{property.city || "City unavailable"}</p></div></section>
        <section className="filter-panel"><h2 className="text-xl font-semibold">Selected room</h2><div className="mt-4 grid gap-3 text-sm sm:grid-cols-2"><p><strong>Room type</strong><br />{roomLabels[form.roomType || data.room.type] || data.room.label}</p><p><strong>Availability</strong><br />{data.room.available} room(s) available</p><p><strong>Monthly rent</strong><br />{money(selectedRent)}</p><p><strong>Total occupants</strong><br />{occupantTotal} of {maxOccupants}</p></div>{data.room.types?.length > 1 && <label className="mt-4 block text-sm font-medium">Room type<select required value={form.roomType || data.room.type} onChange={(event) => setForm({ ...form, roomType: event.target.value, occupantGenderCounts: {} })} className="mt-1 w-full rounded-lg border border-primary/15 px-3 py-2.5">{data.room.types.map((type) => <option key={type} value={type}>{roomLabels[type]}</option>)}</select></label>}<div className="mt-4"><p className="text-sm font-medium">Occupants by gender</p><p className="mt-1 text-xs text-slate">Available according to the owner: {allowedGenders.map((gender) => genderLabels[gender]).join(", ") || "Not configured"}.</p><div className="mt-2 grid gap-3 sm:grid-cols-2">{allowedGenders.map((gender) => <label key={gender} className="text-sm font-medium">{genderLabels[gender]} occupants<input required min="0" max={maxOccupants} type="number" value={occupantGenderCounts[gender]} onChange={(event) => setForm({ ...form, occupantGenderCounts: { ...form.occupantGenderCounts, [gender]: event.target.value } })} className="mt-1 w-full rounded-lg border border-primary/15 px-3 py-2.5" /></label>)}</div></div></section>
        <section className="filter-panel"><h2 className="text-xl font-semibold">Booking information</h2><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium">Name<input readOnly value={user?.name || ""} className="mt-1 w-full rounded-lg border border-primary/15 bg-primary/5 px-3 py-2.5" /></label><label className="text-sm font-medium">Email<input readOnly value={user?.email || ""} className="mt-1 w-full rounded-lg border border-primary/15 bg-primary/5 px-3 py-2.5" /></label><label className="text-sm font-medium">Phone<input readOnly value={user?.phone || ""} className="mt-1 w-full rounded-lg border border-primary/15 bg-primary/5 px-3 py-2.5" /></label><label className="text-sm font-medium">Move-in date<input required min={today} type="date" value={form.moveInDate} onChange={(event) => setForm({ ...form, moveInDate: event.target.value })} className="mt-1 w-full rounded-lg border border-primary/15 px-3 py-2.5" /></label></div></section>
        <section className="filter-panel"><h2 className="text-xl font-semibold">Facilities and food</h2><div className="mt-4 grid gap-5 sm:grid-cols-2"><div><h3 className="font-medium">Select facilities</h3>{pricing.facilities.length ? <div className="mt-2 space-y-2">{pricing.facilities.map((item) => { const selected = item.includedInRent || selectedFacilities.includes(item.name); return <label key={item.name} className="flex items-center justify-between gap-3 rounded-lg border border-primary/10 px-3 py-2 text-sm"><span className="flex items-center gap-2"><input type="checkbox" checked={selected} disabled={item.includedInRent} onChange={() => setSelectedFacilities((current) => current.includes(item.name) ? current.filter((name) => name !== item.name) : [...current, item.name])} />{item.name}</span><span className="text-slate">{item.includedInRent ? "Included" : `+${money(item.price)}/month`}</span></label>; })}</div> : <p className="mt-2 text-sm text-slate">No facilities provided.</p>}</div><div><h3 className="font-medium">Food</h3>{pricing.food.length ? <ul className="mt-2 space-y-1 text-sm text-slate">{pricing.food.map((item) => <li key={item.name}>{item.name} · {item.includedInRent ? "Included" : `+${money(item.price)}/month`}</li>)}</ul> : <p className="mt-2 text-sm text-slate">No food service selected.</p>}</div></div></section>
      </div>
      <aside className="filter-panel h-fit lg:sticky lg:top-24"><h2 className="text-xl font-semibold">Price summary</h2><div className="mt-4 space-y-2 text-sm text-slate"><div className="flex justify-between"><span>Room rent</span><span>{money(selectedRent)}</span></div>{pricing.facilities.filter((item) => item.includedInRent || selectedFacilities.includes(item.name)).map((item) => <div key={item.name} className="flex justify-between"><span>{item.name}</span><span>{item.includedInRent ? "Included" : money(item.price)}</span></div>)}{pricing.food.filter((item) => !item.includedInRent).map((item) => <div key={item.name} className="flex justify-between"><span>{item.name}</span><span>{money(item.price)}</span></div>)}<div className="flex justify-between border-t border-primary/10 pt-3 text-lg font-bold text-primary"><span>Total monthly amount</span><span>{money(selectedTotal)}</span></div></div><fieldset className="mt-6"><legend className="font-semibold">Payment method</legend><label className="mt-3 flex cursor-pointer gap-2 text-sm"><input type="radio" checked={form.paymentMethod === "cash"} onChange={() => setForm({ ...form, paymentMethod: "cash" })} />Cash / Pay at Property</label><label className="mt-3 flex cursor-pointer gap-2 text-sm"><input type="radio" checked={form.paymentMethod === "stripe"} onChange={() => setForm({ ...form, paymentMethod: "stripe" })} />Pay online with Stripe</label></fieldset>{error && <p className="mt-4 text-sm text-red-600" role="alert">{error}</p>}<button disabled={saving || !data.room.available} className="btn-primary mt-6 w-full disabled:opacity-60">{saving ? "Processing..." : form.paymentMethod === "stripe" ? "Continue to secure payment" : "Book and pay at property"}</button></aside>
    </form></div></main><Footer /></div>;
}