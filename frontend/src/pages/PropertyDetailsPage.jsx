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

function getRoomTypeRent(property, roomType) {
  const roomPrice = roomType && property?.roomTypePricing?.[roomType];
  return Number(roomPrice ?? property?.monthlyRent) || 0;
}

function formatRent(property, roomType) {
  const rent = getRoomTypeRent(property, roomType);
  if (rent > 0) {
    return `₹${new Intl.NumberFormat("en-IN").format(rent)} / month`;
  }
  return property.price || "Rent unavailable";
}

function formatRoomTypes(value) {
  const types = Array.isArray(value) ? value : value ? [value] : [];
  return types.map((type) => roomLabels[type]).filter(Boolean).join(", ") || "Room type unavailable";
}

function normalizeFacilityList(property) {
  const facilities = Array.isArray(property?.facilities) ? property.facilities : [];
  return facilities
    .filter((facility) => facility && (facility.enabled || facility.includedInRent || facility.price > 0 || typeof facility === "string"))
    .map((facility) => {
      if (typeof facility === "string") return { name: facility, enabled: true, includedInRent: false, price: 0 };
      return {
        name: facility.name,
        enabled: Boolean(facility.enabled),
        includedInRent: Boolean(facility.includedInRent),
        price: Number(facility.price) || 0,
      };
    })
    .filter((facility) => facility.enabled || facility.includedInRent);
}

function normalizeFoodDetails(property) {
  const source = property?.food && typeof property.food === "object" ? property.food : {};
  const meals = ["breakfast", "lunch", "dinner"];
  return meals
    .filter((meal) => source[meal]?.enabled || source[meal]?.includedInRent)
    .map((meal) => ({
      name: meal,
      enabled: Boolean(source[meal]?.enabled),
      includedInRent: Boolean(source[meal]?.includedInRent),
      price: Number(source[meal]?.price) || 0,
    }));
}

function calculatePropertyTotal(property, roomType) {
  const baseRent = getRoomTypeRent(property, roomType);
  const facilityTotal = normalizeFacilityList(property).reduce((sum, facility) => {
    if (!facility.enabled || facility.includedInRent) return sum;
    return sum + facility.price;
  }, 0);
  const foodTotal = normalizeFoodDetails(property).reduce((sum, item) => {
    if (!item.enabled || item.includedInRent) return sum;
    return sum + item.price;
  }, 0);
  return baseRent + facilityTotal + foodTotal;
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

function formatGenderPreference(value) {
  const values = Array.isArray(value) ? value : value ? [value] : [];
  return values
    .map((item) => {
      const normalized = String(item || "").trim().toLowerCase();
      if (normalized === "male") return "Boys";
      if (normalized === "female") return "Girls";
      if (normalized === "co-living" || normalized === "co living") return "Co-living";
      return item || "Not specified";
    })
    .filter(Boolean)
    .join(", ") || "Not specified";
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
  const [selectedRoomType, setSelectedRoomType] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    getPublicProperty(id)
      .then((data) => {
        if (!cancelled) {
          setProperty(data);
          setSelectedImage(0);
          const availableRoomTypes = Array.isArray(data.roomType) ? data.roomType : data.roomType ? [data.roomType] : [];
          setSelectedRoomType(availableRoomTypes[0] || "");
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
  const facilityList = normalizeFacilityList(property);
  const foodList = normalizeFoodDetails(property);
  const maxMonthlyCost = calculatePropertyTotal(property, selectedRoomType);
  const bookingAddOns = facilityList.filter((item) => item.enabled && !item.includedInRent);
  const bookingFood = foodList.filter((item) => item.enabled && !item.includedInRent);
  const additionalMonthly = bookingAddOns.reduce((sum, item) => sum + Number(item.price || 0), 0) + bookingFood.reduce((sum, item) => sum + Number(item.price || 0), 0);
  const roomOptions = (Array.isArray(property?.roomType) ? property.roomType : property?.roomType ? [property.roomType] : []).filter(Boolean);
  const roomDisplayLabel = selectedRoomType ? (roomLabels[selectedRoomType] || selectedRoomType) : "Room details unavailable";
  const availabilityText = typeof property?.totalRooms === "number" && property.totalRooms > 0
    ? `${property.availableRooms ?? 0} of ${property.totalRooms} rooms available`
    : "Limited availability";
  const propertyRules = Array.isArray(property?.rules) && property.rules.length
    ? property.rules
    : property?.rules && typeof property.rules === "string"
      ? [property.rules]
      : [
          "No smoking inside rooms and common areas.",
          "Visitors are allowed only during daytime.",
          "Quiet hours after 10:00 PM are mandatory.",
          "Keep shared spaces clean and tidy at all times.",
        ];

  return (
    <div>
      <Navbar />
      <main className="search-page property-details-page">
        <div className="search-wrap property-details-wrap">
          <div className="property-page-topbar">
            <button type="button" onClick={() => navigate(-1)} className="property-page-back">
              ← Back to PGs
            </button>
          </div>

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
            <article className="property-details-shell">
              <header className="property-hero">
                <div className="property-hero-top">
                  <div>
                    <div className="property-badges">
                      {verified && <span className="badge">Verified</span>}
                      <span className="filter-badge">{property.totalRooms > 0 && property.availableRooms > 0 ? "Available now" : "Limited availability"}</span>
                    </div>
                    <h1 className="property-title">{property.name}</h1>
                    <div className="property-meta-row">
                      <span>{formatRating(property)}</span>
                      <span>•</span>
                      <span>{property.location || "Location unavailable"}</span>
                    </div>
                  </div>

                  <div className="property-availability-pill">
                    <span className="availability-dot" />
                    {availabilityText}
                  </div>
                </div>

                <div className="property-hero-details">
                  <div className="detail-pill"><strong>Gender:</strong> {formatGenderPreference(property.genderPreference)}</div>
                  <div className="detail-pill"><strong>Near:</strong> {property.college || "Nearby landmark unavailable"}</div>
                  <div className="detail-pill"><strong>Distance:</strong> {formatDistance(property)}</div>
                </div>

                <div className="property-hero-actions">
                  <button type="button" onClick={() => { if (!isAuthenticated) return navigate("/login", { state: { from: `/property/${id}` } }); setActionType("inquiry"); setActionMessage(""); }} className="btn-primary">Send Inquiry</button>
                  <button type="button" disabled={!(property.totalRooms > 0 && property.availableRooms > 0)} onClick={() => { if (!isAuthenticated) return navigate("/login", { state: { from: { pathname: `/checkout/${id}` } } }); navigate(`/checkout/${id}`); }} className="btn-primary disabled:opacity-50">{property.totalRooms > 0 && property.availableRooms > 0 ? "Book Now" : "Availability unavailable"}</button>
                </div>

                {actionMessage && !actionType && <p className="mt-3 text-sm text-teal-700" role="status">{actionMessage}</p>}
                {actionType && (
                  <form onSubmit={submitPropertyAction} className="property-action-form">
                    <h2 className="font-semibold">{actionType === "inquiry" ? "Send an inquiry" : "Request a booking"}</h2>
                    {actionType === "booking" && (
                      <>
                        <label className="mt-3 block text-sm font-medium">Preferred move-in date
                          <input type="date" min={new Date().toISOString().slice(0, 10)} value={actionForm.moveInDate} onChange={(event) => setActionForm({ ...actionForm, moveInDate: event.target.value })} className="mt-1 w-full rounded-lg border border-primary/15 px-3 py-2.5" />
                        </label>
                        <label className="mt-3 block text-sm font-medium">Occupants
                          <input required min="1" step="1" type="number" value={actionForm.occupants} onChange={(event) => setActionForm({ ...actionForm, occupants: event.target.value })} className="mt-1 w-full rounded-lg border border-primary/15 px-3 py-2.5" />
                        </label>
                      </>
                    )}
                    {actionType === "inquiry" && (
                      <label className="mt-3 block text-sm font-medium">Message <span className="text-red-600">*</span>
                        <textarea required minLength={5} maxLength={1000} value={actionForm.message} onChange={(event) => setActionForm({ ...actionForm, message: event.target.value })} rows="4" className="mt-1 w-full rounded-lg border border-primary/15 px-3 py-2.5" placeholder="Ask the owner about this PG" /></label>
                    )}
                    {actionMessage && <p className="mt-2 text-sm text-red-600" role="alert">{actionMessage}</p>}
                    <div className="mt-3 flex gap-2">
                      <button disabled={actionSaving} className="btn-primary">{actionSaving ? "Sending..." : actionType === "inquiry" ? "Send Inquiry" : "Submit Request"}</button>
                      <button type="button" onClick={() => { setActionType(null); setActionMessage(""); }} className="btn-clear-danger">Cancel</button>
                    </div>
                  </form>
                )}
              </header>

              <div className="property-content-grid ">
                <div className="property-main-column">
                  <section className="detail-section property-gallery-section">
                    {images.length ? (
                      <div className="property-gallery-card">
                        <div className="property-main-image-wrap">
                          <img src={images[selectedImage]} alt={`${property.name} ${selectedImage + 1}`} className="property-main-image" />
                        </div>

                        {images.length > 1 && (
                          <div className="property-thumbnails" aria-label="Property images">
                            {images.map((image, index) => (
                              <button key={image} type="button" onClick={() => setSelectedImage(index)} aria-label={`View image ${index + 1}`} className={selectedImage === index ? "active" : ""}>
                                <img src={image} alt="" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="property-image-empty" role="img" aria-label="Property image unavailable">Image unavailable</div>
                    )}
                  </section>

                  <section className="detail-section">
                    <div className="section-heading-row">
                      <h2>About this PG</h2>
                    </div>
                    <div className="property-about-grid">
                      <div className="about-copy">
                        <p>{property.description || "No description available for this PG yet."}</p>
                      </div>
                      <div className="info-stat-grid">
                        <div className="info-stat-box">
                          <span className="label">City</span>
                          <strong>{property.city || "Unavailable"}</strong>
                        </div>
                        <div className="info-stat-box">
                          <span className="label">Area</span>
                          <strong>{property.area || "Unavailable"}</strong>
                        </div>
                        <div className="info-stat-box">
                          <span className="label">Nearby</span>
                          <strong>{property.college || "Unavailable"}</strong>
                        </div>
                        <div className="info-stat-box">
                          <span className="label">Gender</span>
                          <strong>{formatGenderPreference(property.genderPreference)}</strong>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="detail-section">
                    <div className="section-heading-row">
                      <h2>Room options</h2>
                    </div>
                    <div className="room-grid">
                      {roomOptions.length ? roomOptions.map((roomType) => (
                        <button key={roomType} type="button" onClick={() => setSelectedRoomType(roomType)} className={`room-option-card text-left ${selectedRoomType === roomType ? "selected" : ""}`}>
                          <div className="room-option-header">
                            <span className="room-type-tag">{roomLabels[roomType] || roomType}</span>
                            <span className="room-status">{property.availableRooms > 0 ? "Available" : "Limited"}</span>
                          </div>
                          <div className="room-option-body">
                            <p className="room-price">{formatRent(property, roomType)}</p>
                            <ul>
                              <li>{availabilityText}</li>
                              <li>{formatGenderPreference(property.genderPreference)}</li>
                              <li>{property.location || "Area location unavailable"}</li>
                            </ul>
                          </div>
                        </button>
                      )) : (
                        <div className="room-option-card empty-room-card">
                          <div className="room-option-header">
                            <span className="room-type-tag">Room details</span>
                          </div>
                          <p className="room-price">{formatRent(property)}</p>
                          <p className="text-sm text-slate">Room details are currently unavailable for this listing.</p>
                        </div>
                      )}
                    </div>
                  </section>

                  <section className="detail-section">
                    <div className="section-heading-row">
                      <h2>Amenities</h2>
                    </div>
                    {facilityList.length ? (
                      <div className="facility-grid">
                        {facilityList.map((facility) => (
                          <div key={facility.name} className="facility-item">
                            <span className="facility-dot">✓</span>
                            <div>
                              <strong>{facility.name}</strong>
                              <small>{facility.includedInRent ? "Included" : `₹${Number(facility.price || 0).toLocaleString("en-IN")}/mo`}</small>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="empty-state-text">Amenities information unavailable for this property.</p>
                    )}
                  </section>

                  <section className="detail-section">
                    <div className="section-heading-row">
                      <h2>Food details</h2>
                    </div>
                    <div className="food-grid">
                      {property.foodIncluded || property.food?.enabled ? (
                        <div className="food-card included">
                          <span className="food-label">Food included</span>
                          <strong>{property.food?.type || "Vegetarian"}</strong>
                          <small>Included in monthly rent</small>
                        </div>
                      ) : null}

                      {foodList.length ? foodList.map((item) => (
                        <div key={item.name} className="food-card">
                          <span className="food-label">{item.name}</span>
                          <strong>{item.includedInRent ? "Included" : `₹${Number(item.price || 0).toLocaleString("en-IN")}`}</strong>
                          <small>{item.includedInRent ? "No extra charge" : "per month"}</small>
                        </div>
                      )) : (
                        <div className="food-card empty-food-card">
                          <span className="food-label">Food</span>
                          <strong>Not specified</strong>
                          <small>Please contact the owner for details</small>
                        </div>
                      )}
                    </div>
                  </section>

                  <section className="detail-section">
                    <div className="section-heading-row">
                      <h2>Location</h2>
                    </div>
                    <div className="location-grid">
                      <div className="location-card">
                        <p><strong>Address:</strong> {property.location || "Location unavailable"}</p>
                        <p><strong>Area:</strong> {property.area || "Area unavailable"}</p>
                        <p><strong>Nearby college/landmark:</strong> {property.college || "College details unavailable"}</p>
                        <p><strong>Distance from college:</strong> {formatDistance(property)}</p>
                      </div>
                      <div className="location-card map-card">
                        <span className="map-badge">Map</span>
                        <p>{property.city || "City unavailable"}</p>
                        <small>{property.location || "Address unavailable"}</small>
                      </div>
                    </div>
                  </section>

                  <section className="detail-section">
                    <div className="section-heading-row">
                      <h2>PG rules</h2>
                    </div>
                    <ul className="rule-list">
                      {propertyRules.map((rule) => (
                        <li key={rule}>{rule}</li>
                      ))}
                    </ul>
                  </section>

                  <section className="detail-section reviews-section">
                    <div className="section-heading-row">
                      <h2>Reviews</h2>
                    </div>

                    <div className="review-summary-row">
                      <div className="review-score-box">
                        <strong>{reviewData?.summary?.average != null ? reviewData.summary.average.toFixed(1) : "—"}</strong>
                        <span>Overall rating</span>
                      </div>
                      <div className="review-score-meta">
                        <p>{reviewData?.summary?.total || 0} review{reviewData?.summary?.total === 1 ? "" : "s"}</p>
                        <p>{formatRating(property)}</p>
                      </div>
                    </div>

                    {reviewLoading && <p className="mt-4 text-sm text-slate">Loading reviews...</p>}
                    {reviewError && <div className="mt-4 text-sm text-red-600"><p>{reviewError}</p><button type="button" onClick={loadReviews} className="btn-clear-danger mt-2">Retry</button></div>}
                    {!reviewLoading && !reviewError && !reviewData?.reviews?.length && <p className="mt-4 text-sm text-slate">No reviews yet. Be the first to review this PG.</p>}
                    {!reviewLoading && !reviewError && reviewData?.reviews?.length > 0 && (
                      <div className="review-list">
                        {reviewData.reviews.map((review) => (
                          <article key={review._id} className="review-card">
                            <div className="review-card-header">
                              <div>
                                <strong>{review.tenant?.name || "User"}</strong>
                                <small>{new Date(review.createdAt).toLocaleDateString()}</small>
                              </div>
                              <span className="review-stars" aria-label={`${review.rating} out of 5 stars`}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
                            </div>
                            <p>{review.comment}</p>
                            {String(review.tenant?._id) === String(user?.id) && (
                              <div className="review-actions">
                                <button type="button" onClick={() => startEdit(review)} className="btn-clear-danger">Edit</button>
                                <button type="button" onClick={() => removeReview(review)} className="btn-clear-danger danger">Delete</button>
                              </div>
                            )}
                          </article>
                        ))}
                      </div>
                    )}

                    {isAuthenticated && (!ownReview || editingReview) && (
                      <form id="review-form" onSubmit={submitReview} className="property-review-form">
                        <h3>{editingReview ? "Edit your review" : "Write a review"}</h3>
                        <fieldset className="mt-3">
                          <legend className="text-sm font-medium">Rating <span className="text-red-600">*</span></legend>
                          <div className="mt-2 flex gap-1">{[1, 2, 3, 4, 5].map((rating) => (
                            <button key={rating} type="button" onClick={() => setReviewForm({ ...reviewForm, rating })} aria-label={`${rating} out of 5 stars`} className="text-xl">{rating <= reviewForm.rating ? "★" : "☆"}</button>
                          ))}</div>
                        </fieldset>
                        <label className="mt-3 block text-sm font-medium">Review text <span className="text-red-600">*</span>
                          <textarea required minLength={10} maxLength={1000} value={reviewForm.comment} onChange={(event) => setReviewForm({ ...reviewForm, comment: event.target.value })} className="mt-1 w-full rounded-lg border border-primary/15 px-3 py-2.5" rows="4" placeholder="Share your experience" /></label>
                        {reviewError && <p className="mt-2 text-sm text-red-600" role="alert">{reviewError}</p>}
                        <div className="mt-3 flex gap-2">
                          <button disabled={reviewSaving} className="btn-primary">{reviewSaving ? "Saving..." : editingReview ? "Update review" : "Submit review"}</button>
                          {editingReview && <button type="button" onClick={() => { setEditingReview(null); setReviewForm({ rating: 0, comment: "" }); setReviewError(""); }} className="btn-clear-danger">Cancel</button>}
                        </div>
                      </form>
                    )}
                    {!isAuthenticated && <p className="mt-4 text-sm text-slate">Sign in to write a review.</p>}
                  </section>
                </div>

               
              </div>
            </article>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}