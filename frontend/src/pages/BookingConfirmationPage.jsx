import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { getBooking, getPaymentStatus } from "../api/bookingApi.js";

const roomLabels = { single: "Single Sharing", double: "Double Sharing", triple: "Triple Sharing", "4+": "4+ Sharing" };
const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

export default function BookingConfirmationPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const sessionId = params.get("session_id");
    const request = sessionId ? getPaymentStatus(id, sessionId) : getBooking(id);
    request.then((data) => setBooking(data.booking || data)).catch((requestError) => setError(requestError.message));
  }, [id, params]);
  return <div><Navbar /><main className="search-page"><div className="search-wrap max-w-3xl"><section className="filter-panel text-center">{error ? <><h1 className="text-2xl font-semibold">We could not confirm this booking</h1><p className="mt-2 text-sm text-red-600">{error}</p></> : !booking ? <p className="text-sm text-slate">Confirming your booking...</p> : <><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-700">✓</div><h1 className="mt-4 text-3xl font-semibold">Booking received</h1><p className="mt-2 text-sm text-slate">Your request has been sent to the property owner.</p><div className="mt-6 grid gap-3 text-left sm:grid-cols-2"><p><strong>Booking ID</strong><br />{booking._id}</p><p><strong>PG</strong><br />{booking.property?.name || "Property"}</p><p><strong>Room</strong><br />{booking.roomLabel || roomLabels[booking.roomType] || "Selected room"}</p><p><strong>Move-in date</strong><br />{booking.moveInDate ? new Date(booking.moveInDate).toLocaleDateString() : "Not specified"}</p><p><strong>Payment</strong><br />{booking.paymentMethod === "stripe" ? "Online payment" : "Cash / Pay at Property"} · {booking.paymentStatus}</p><p><strong>Total</strong><br />{money(booking.amount)}</p></div><div className="mt-6 flex flex-wrap justify-center gap-3"><Link to="/user/dashboard" className="btn-primary">View My Bookings</Link><Link to="/search" className="btn-clear-danger">Back to Find PG</Link></div></>}</section></div></main><Footer /></div>;
}