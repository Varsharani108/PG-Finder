import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { getPublicProperty } from "../api/propertyApi.js";
import { createReview, deleteReview, getPropertyReviews, updateReview } from "../api/reviewApi.js";
import { useAuth } from "../context/AuthContext.jsx";
import { requestBooking, sendInquiry } from "../api/userApi.js";
import "../styles/search.css";

const roomLabels = {
  single: "Single Sharing",
  double: "Double Sharing",
  triple: "Triple Sharing",
  "4+": "4+ Sharing",
};

function formatRent(property) {
  if (typeof property.monthlyRent === "number") {
    return `₹${new Intl.NumberFormat("en-IN").format(property.monthlyRent)} / month`;
  }
  return property.price || "Rent unavailable";
}

function formatRating(property) {
  if (typeof property.rating !== "number") return "No rating yet";
  const reviews = typeof property.reviewCount === "number"
    ? ` (${property.reviewCount} review${property.reviewCount === 1 ? "" : "s"})`
    : "";
  return `⭐ ${property.rating.toFixed(1)}${reviews}`;
}

function formatDistance(property) {
  return typeof property.distanceFromCollege === "number"
    ? `${property.distanceFromCollege} m`
    : "Distance information unavailable";
}

export default function PropertyDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [property, setProperty] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const [reviewData, setReviewData] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [reviewError, setReviewError] = useState("");
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: "" });
  const [reviewSaving, setReviewSaving] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [actionForm, setActionForm] = useState({ message: "", moveInDate: "", occupants: 1 });
  const [actionSaving, setActionSaving] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    getPublicProperty(id)
      .then((data) => {
        if (!cancelled) {
          setProperty(data);
          setSelectedImage(0);
        }
      })
      .catch((requestError) => {
        if (!cancelled) setError(requestError.message === "Property not found" ? "PG not found" : "Unable to load this PG. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, retryKey]);

  const loadReviews = async () => {
    setReviewLoading(true);
    setReviewError("");
    try {
      setReviewData(await getPropertyReviews(id));
    } catch {
      setReviewError("Unable to load reviews. Please try again.");
    } finally {
      setReviewLoading(false);
    }
  };

  useEffect(() => { loadReviews(); }, [id]);

  const submitReview = async (event) => {
    event.preventDefault();
    if (!isAuthenticated) return navigate("/login", { state: { from: `/property/${id}` } });
    if (!reviewForm.rating) return setReviewError("Please select a rating.");
    if (reviewForm.comment.trim().length < 10) return setReviewError("Review must contain at least 10 characters.");
    setReviewSaving(true);
    setReviewError("");
    try {
      if (editingReview) await updateReview(editingReview._id, reviewForm);
      else await createReview({ ...reviewForm, property: id });
      setReviewForm({ rating: 0, comment: "" });
      setEditingReview(null);
      await Promise.all([loadReviews(), getPublicProperty(id).then(setProperty)]);
    } catch (error) {
      setReviewError(error.message === "You have already reviewed this PG. Edit your existing review instead." ? error.message : "Unable to submit review. Please try again.");
    } finally {
      setReviewSaving(false);
    }
  };

  const ownReview = reviewData?.reviews?.find((review) => String(review.tenant?._id) === String(user?.id));
  const startEdit = (review) => { setEditingReview(review); setReviewForm({ rating: review.rating, comment: review.comment }); };
  const removeReview = async (review) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await deleteReview(review._id);
      setEditingReview(null);
      setReviewForm({ rating: 0, comment: "" });
      await Promise.all([loadReviews(), getPublicProperty(id).then(setProperty)]);
    } catch {
      setReviewError("Unable to delete review. Please try again.");
    }
  };

  const submitPropertyAction = async (event) => {
    event.preventDefault();
    if (!isAuthenticated) return navigate("/login", { state: { from: `/property/${id}` } });
    if (actionType === "inquiry" && actionForm.message.trim().length < 5) return setActionMessage("Please enter your message.");
    setActionSaving(true);
    setActionMessage("");
    try {
      if (actionType === "inquiry") await sendInquiry({ property: id, message: actionForm.message });
      else await requestBooking({ property: id, moveInDate: actionForm.moveInDate || undefined, occupants: Number(actionForm.occupants), rent: property.monthlyRent });
      setActionType(null);
      setActionForm({ message: "", moveInDate: "", occupants: 1 });
      setActionMessage(actionType === "inquiry" ? "Inquiry sent successfully." : "Booking request submitted successfully.");
    } catch (error) {
      setActionMessage(error.message === "No rooms are currently available." ? error.message : actionType === "inquiry" ? "Unable to send inquiry. Please try again." : "Your booking request could not be submitted.");
    } finally {
      setActionSaving(false);
    }
  };

  const images = property?.images?.filter((image) => typeof image === "string" && image.trim()) || [];
  const verified = property?.verificationStatus === "verified" && property?.status === "active";

  return (
    <div>
      <Navbar />
      <main className="search-page">
        <div className="search-wrap">
          <button type="button" onClick={() => navigate(-1)} className="text-sm text-slate mb-5">
            ← Back to Find PG
          </button>

          {loading && <p className="text-sm text-slate">Loading PG details...</p>}

          {!loading && error && (
            <section className="filter-panel text-center">
              <h1 className="text-2xl font-semibold">{error === "PG not found" ? "PG not found" : "Unable to load this PG"}</h1>
              <p className="text-sm text-slate mt-2">{error === "PG not found" ? "This listing is unavailable or is no longer public." : "Please try again."}</p>
              {error !== "PG not found" && <button type="button" onClick={() => setRetryKey((value) => value + 1)} className="btn-primary mt-4">Retry</button>}
              <div><Link to="/search" className="btn-clear-danger inline-block mt-4">Back to Find PG</Link></div>
            </section>
          )}

          {!loading && !error && property && (
            <article>
              <header className="mb-6">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-3xl font-semibold">{property.name}</h1>
                  {verified && <span className="badge">Verified</span>}
                </div>
                <p className="text-slate mt-2">{formatRating(property)} · {property.location || "Location unavailable"}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" onClick={() => { if (!isAuthenticated) return navigate("/login", { state: { from: `/property/${id}` } }); setActionType("inquiry"); setActionMessage(""); }} className="btn-primary">Send Inquiry</button>
                  <button type="button" disabled={!(property.totalRooms > 0 && property.availableRooms > 0)} onClick={() => { if (!isAuthenticated) return navigate("/login", { state: { from: `/property/${id}` } }); setActionType("booking"); setActionMessage(""); }} className="btn-clear-danger disabled:opacity-50">{property.totalRooms > 0 && property.availableRooms > 0 ? "Request Booking" : "Availability unavailable"}</button>
                </div>
                {actionMessage && !actionType && <p className="mt-3 text-sm text-teal-700" role="status">{actionMessage}</p>}
                {actionType && <form onSubmit={submitPropertyAction} className="mt-4 max-w-xl rounded-lg border border-primary/10 bg-white p-4">
                  <h2 className="font-semibold">{actionType === "inquiry" ? "Send an inquiry" : "Request a booking"}</h2>
                  {actionType === "booking" && <><label className="mt-3 block text-sm font-medium">Preferred move-in date<input type="date" min={new Date().toISOString().slice(0, 10)} value={actionForm.moveInDate} onChange={(event) => setActionForm({ ...actionForm, moveInDate: event.target.value })} className="mt-1 w-full rounded-lg border border-primary/15 px-3 py-2.5" /></label><label className="mt-3 block text-sm font-medium">Occupants<input required min="1" step="1" type="number" value={actionForm.occupants} onChange={(event) => setActionForm({ ...actionForm, occupants: event.target.value })} className="mt-1 w-full rounded-lg border border-primary/15 px-3 py-2.5" /></label></>}
                  {actionType === "inquiry" && <label className="mt-3 block text-sm font-medium">Message <span className="text-red-600">*</span><textarea required minLength={5} maxLength={1000} value={actionForm.message} onChange={(event) => setActionForm({ ...actionForm, message: event.target.value })} rows="4" className="mt-1 w-full rounded-lg border border-primary/15 px-3 py-2.5" placeholder="Ask the owner about this PG" /></label>}
                  {actionMessage && <p className="mt-2 text-sm text-red-600" role="alert">{actionMessage}</p>}
                  <div className="mt-3 flex gap-2"><button disabled={actionSaving} className="btn-primary">{actionSaving ? "Sending..." : actionType === "inquiry" ? "Send Inquiry" : "Submit Request"}</button><button type="button" onClick={() => { setActionType(null); setActionMessage(""); }} className="btn-clear-danger">Cancel</button></div>
                </form>}
              </header>

              <section className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3">
                  {images.length ? (
                    <div>
                      <img src={images[selectedImage]} alt={`${property.name} ${selectedImage + 1}`} className="w-full rounded-lg border object-cover" style={{ maxHeight: "440px" }} />
                      {images.length > 1 && (
                        <div className="flex gap-2 mt-3 overflow-x-auto" aria-label="Property images">
                          {images.map((image, index) => (
                            <button key={image} type="button" onClick={() => setSelectedImage(index)} aria-label={`View image ${index + 1}`} className={`shrink-0 border rounded ${selectedImage === index ? "ring-2 ring-amber-500" : ""}`}>
                              <img src={image} alt="" className="w-20 h-16 object-cover rounded" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full rounded-lg border bg-gray-100 flex items-center justify-center text-sm text-slate" style={{ minHeight: "280px" }} role="img" aria-label="Property image unavailable">Image unavailable</div>
                  )}
                </div>

                <div className="lg:col-span-2 filter-panel">
                  <p className="text-2xl font-bold">{formatRent(property)}</p>
                  <dl className="mt-5 space-y-3 text-sm">
                    <div><dt className="font-semibold">Room type</dt><dd className="text-slate">{roomLabels[property.roomType] || "Room type unavailable"}</dd></div>
                    <div><dt className="font-semibold">Rooms</dt><dd className="text-slate">{typeof property.totalRooms === "number" && property.totalRooms > 0 ? `${property.availableRooms ?? "Availability unavailable"} of ${property.totalRooms} available` : "Availability unavailable"}</dd></div>
                    <div><dt className="font-semibold">Gender preference</dt><dd className="text-slate">{property.genderPreference || "Not specified"}</dd></div>
                    <div><dt className="font-semibold">Distance from college</dt><dd className="text-slate">{formatDistance(property)}</dd></div>
                  </dl>
                </div>
              </section>

              <section className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-xl font-semibold">Location</h2>
                  <dl className="mt-3 space-y-2 text-sm text-slate">
                    <div><dt className="font-semibold text-[var(--ink)]">City</dt><dd>{property.city || "City unavailable"}</dd></div>
                    <div><dt className="font-semibold text-[var(--ink)]">Area</dt><dd>{property.area || "Area unavailable"}</dd></div>
                    <div><dt className="font-semibold text-[var(--ink)]">Address</dt><dd>{property.location || "Location unavailable"}</dd></div>
                    <div><dt className="font-semibold text-[var(--ink)]">Nearby college</dt><dd>{property.college || "College unavailable"}</dd></div>
                  </dl>
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Description</h2>
                  <p className="mt-3 text-sm text-slate">{property.description || "No description available."}</p>
                </div>
              </section>

              <section className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-xl font-semibold">Facilities</h2>
                  {property.facilities?.length ? <div className="flex flex-wrap gap-2 mt-3">{property.facilities.map((facility) => <span key={facility} className="badge">{facility}</span>)}</div> : <p className="mt-3 text-sm text-slate">Facilities information unavailable.</p>}
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Food</h2>
                  {property.foodIncluded || property.food?.length ? <div className="flex flex-wrap gap-2 mt-3">{property.foodIncluded && <span className="badge">Food included</span>}{property.food?.map((item) => <span key={item} className="badge">{item}</span>)}</div> : <p className="mt-3 text-sm text-slate">Food information unavailable.</p>}
                </div>
              </section>

              <section className="mt-8">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold">Reviews</h2>
                    <p className="mt-1 text-sm text-slate">
                      {reviewData?.summary?.average != null ? `⭐ ${reviewData.summary.average.toFixed(1)} average` : "No reviews yet"} · {reviewData?.summary?.total || 0} review{reviewData?.summary?.total === 1 ? "" : "s"}
                    </p>
                    {reviewData?.summary?.total > 0 && <div className="mt-3 space-y-1 text-xs text-slate">{[5, 4, 3, 2, 1].map((rating) => <div key={rating} className="flex items-center gap-2"><span className="w-8">{rating} stars</span><div className="h-2 w-32 rounded bg-primary/10"><div className="h-2 rounded bg-accent" style={{ width: `${((reviewData.summary.distribution?.[rating] || 0) / reviewData.summary.total) * 100}%` }} /></div><span>{reviewData.summary.distribution?.[rating] || 0}</span></div>)}</div>}
                  </div>
                  {!ownReview && <button type="button" onClick={() => { if (!isAuthenticated) navigate("/login", { state: { from: `/property/${id}` } }); else document.getElementById("review-form")?.scrollIntoView({ behavior: "smooth" }); }} className="btn-primary">Write a Review</button>}
                </div>

                {reviewLoading && <p className="mt-4 text-sm text-slate">Loading reviews...</p>}
                {reviewError && <div className="mt-4 text-sm text-red-600"><p>{reviewError}</p><button type="button" onClick={loadReviews} className="btn-clear-danger mt-2">Retry</button></div>}
                {!reviewLoading && !reviewError && !reviewData?.reviews?.length && <p className="mt-4 text-sm text-slate">No reviews yet. Be the first to review this PG.</p>}
                {!reviewLoading && !reviewError && reviewData?.reviews?.length > 0 && <div className="mt-4 space-y-3">{reviewData.reviews.map((review) => <article key={review._id} className="rounded-lg border border-primary/10 bg-white p-4"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-semibold">{review.tenant?.name || "User"}</p><span aria-label={`${review.rating} out of 5 stars`}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)} <span className="sr-only">{review.rating} out of 5 stars</span></span></div><p className="mt-2 text-sm text-slate">{review.comment}</p><p className="mt-2 text-xs text-slate">{new Date(review.createdAt).toLocaleDateString()}</p>{String(review.tenant?._id) === String(user?.id) && <div className="mt-3 flex gap-2"><button type="button" onClick={() => startEdit(review)} className="rounded-lg border border-primary/15 px-3 py-2 text-xs font-semibold">Edit</button><button type="button" onClick={() => removeReview(review)} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600">Delete</button></div>}</article>)}</div>}

                {isAuthenticated && (!ownReview || editingReview) && <form id="review-form" onSubmit={submitReview} className="mt-6 rounded-lg border border-primary/10 bg-white p-4"><h3 className="font-semibold">{editingReview ? "Edit your review" : "Write a review"}</h3><fieldset className="mt-3"><legend className="text-sm font-medium">Rating <span className="text-red-600">*</span></legend><div className="mt-2 flex gap-1">{[1, 2, 3, 4, 5].map((rating) => <button key={rating} type="button" onClick={() => setReviewForm({ ...reviewForm, rating })} aria-label={`${rating} out of 5 stars`} className="text-xl">{rating <= reviewForm.rating ? "★" : "☆"}</button>)}</div></fieldset><label className="mt-3 block text-sm font-medium">Review text <span className="text-red-600">*</span><textarea required minLength={10} maxLength={1000} value={reviewForm.comment} onChange={(event) => setReviewForm({ ...reviewForm, comment: event.target.value })} className="mt-1 w-full rounded-lg border border-primary/15 px-3 py-2.5" rows="4" placeholder="Share your experience" /></label>{reviewError && <p className="mt-2 text-sm text-red-600" role="alert">{reviewError}</p>}<div className="mt-3 flex gap-2"><button disabled={reviewSaving} className="btn-primary">{reviewSaving ? "Saving..." : editingReview ? "Update review" : "Submit review"}</button>{editingReview && <button type="button" onClick={() => { setEditingReview(null); setReviewForm({ rating: 0, comment: "" }); setReviewError(""); }} className="btn-clear-danger">Cancel</button>}</div></form>}
                {!isAuthenticated && <p className="mt-4 text-sm text-slate">Sign in to write a review.</p>}
              </section>
            </article>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}