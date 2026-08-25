const roomTypes = [
  ["single", "Single Sharing"],
  ["double", "Double Sharing"],
  ["triple", "Triple Sharing"],
  ["4+", "4+ Sharing"],
];

const facilityOptions = ["Wi-Fi", "AC", "Attached bathroom", "Furniture", "Washing machine", "Parking", "Power backup", "Study table", "Gym"];
const foodOptions = [
  ["breakfast", "Breakfast"],
  ["lunch", "Lunch"],
  ["dinner", "Dinner"],
  ["vegetarian", "Vegetarian"],
  ["non-vegetarian", "Non-vegetarian"],
];

function Field({ label, required, children }) {
  return <label className="block text-sm font-medium text-primary">{label}{required && <span className="text-red-600"> *</span>}{children}</label>;
}

function inputClass() {
  return "mt-1 w-full rounded-lg border border-primary/15 px-3 py-2.5";
}

export default function OwnerPropertyForm({ editingId, form, setForm, setFormOpen, saving, saveProperty, error }) {
  const set = (field, value) => setForm({ ...form, [field]: value });
  const toggle = (field, value) => set(field, form[field].includes(value) ? form[field].filter((item) => item !== value) : [...form[field], value]);
  const addImage = () => set("images", [...form.images, ""]);
  const updateImage = (index, value) => set("images", form.images.map((image, imageIndex) => imageIndex === index ? value : image));
  const removeImage = (index) => set("images", form.images.filter((_, imageIndex) => imageIndex !== index));

  return <form onSubmit={saveProperty} className="rounded-xl border border-accent/20 bg-white p-5">
    <h3 className="font-semibold text-primary">{editingId ? "Edit Property" : "Add Property"}</h3>
    <p className="mt-1 text-xs text-primary/60">Fields marked with * are required.</p>
    {error && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}

    <fieldset className="mt-5"><legend className="text-sm font-semibold text-primary">Basic Information</legend><div className="mt-3 grid gap-4 sm:grid-cols-2">
      <Field label="PG name" required><input required value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Sunrise PG" className={inputClass()} /></Field>
      <Field label="City" required><input required value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Amritsar" className={inputClass()} /></Field>
      <Field label="Area" required><input required value={form.area} onChange={(e) => set("area", e.target.value)} placeholder="Civil Lines" className={inputClass()} /></Field>
      <Field label="Location" required><input required value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="Full address or landmark" className={inputClass()} /></Field>
      <Field label="Nearby college / landmark"><input value={form.college} onChange={(e) => set("college", e.target.value)} placeholder="Nearby college" className={inputClass()} /></Field>
      <Field label="Description"><textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Describe the property" rows="3" className={inputClass()} /></Field>
    </div></fieldset>

    <fieldset className="mt-6"><legend className="text-sm font-semibold text-primary">Pricing</legend><div className="mt-3 grid gap-4 sm:grid-cols-2">
      <Field label="Monthly rent (₹)" required><input required min="1" step="1" type="number" value={form.monthlyRent} onChange={(e) => set("monthlyRent", e.target.value)} placeholder="10000" className={inputClass()} /></Field>
      <Field label="Legacy price display"><input value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="Optional price range" className={inputClass()} /></Field>
    </div></fieldset>

    <fieldset className="mt-6"><legend className="text-sm font-semibold text-primary">Rooms</legend><div className="mt-3 grid gap-4 sm:grid-cols-3">
      <Field label="Total rooms" required><input required min="1" step="1" type="number" value={form.totalRooms} onChange={(e) => set("totalRooms", e.target.value)} className={inputClass()} /></Field>
      <Field label="Available rooms" required><input required min="0" step="1" type="number" value={form.availableRooms} onChange={(e) => set("availableRooms", e.target.value)} className={inputClass()} /></Field>
      <Field label="Room type" required><select required value={form.roomType} onChange={(e) => set("roomType", e.target.value)} className={inputClass()}><option value="">Select room type</option>{roomTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
    </div></fieldset>

    <fieldset className="mt-6"><legend className="text-sm font-semibold text-primary">Preferences</legend><div className="mt-3 flex flex-wrap gap-4">{[["male", "Male"], ["female", "Female"], ["co-living", "Co-living"]].map(([value, label]) => <label key={value} className="inline-flex items-center gap-2 text-sm"><input type="radio" name="genderPreference" checked={form.genderPreference === value} onChange={() => set("genderPreference", value)} />{label}</label>)}</div></fieldset>

    <fieldset className="mt-6"><legend className="text-sm font-semibold text-primary">Facilities</legend><div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">{facilityOptions.map((facility) => <label key={facility} className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={form.facilities.includes(facility)} onChange={() => toggle("facilities", facility)} />{facility}</label>)}</div></fieldset>

    <fieldset className="mt-6"><legend className="text-sm font-semibold text-primary">Food</legend><div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3"><label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={form.foodIncluded} onChange={(e) => set("foodIncluded", e.target.checked)} />Food included</label>{foodOptions.map(([value, label]) => <label key={value} className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={form.food.includes(value)} onChange={() => toggle("food", value)} />{label}</label>)}</div></fieldset>

    <fieldset className="mt-6"><legend className="text-sm font-semibold text-primary">Location</legend><div className="grid gap-4 sm:grid-cols-2"><Field label="Distance from college (metres)"><input min="0" step="1" type="number" value={form.distanceFromCollege} onChange={(e) => set("distanceFromCollege", e.target.value)} placeholder="Optional" className={inputClass()} /></Field><Field label="Latitude"><input min="-90" max="90" step="any" type="number" value={form.latitude || ""} onChange={(e) => set("latitude", e.target.value)} placeholder="e.g. 31.6340" className={inputClass()} /></Field><Field label="Longitude"><input min="-180" max="180" step="any" type="number" value={form.longitude || ""} onChange={(e) => set("longitude", e.target.value)} placeholder="e.g. 74.8723" className={inputClass()} /></Field></div><p className="mt-2 text-xs text-primary/60">Add both coordinates to show this PG on the map. You can copy them from a map service.</p></fieldset>

    <fieldset className="mt-6"><legend className="text-sm font-semibold text-primary">Images</legend><p className="mt-1 text-xs text-primary/60">Add image URLs. They will be previewed below.</p><div className="mt-3 space-y-3">{form.images.map((image, index) => <div key={`${index}-${image}`} className="flex flex-wrap items-start gap-2"><div className="min-w-0 flex-1"><input type="url" value={image} onChange={(e) => updateImage(index, e.target.value)} placeholder="https://example.com/pg.jpg" className={inputClass()} />{image && <img src={image} alt={`Property preview ${index + 1}`} className="mt-2 h-20 w-28 rounded object-cover border" onError={(e) => { e.currentTarget.style.display = "none"; }} />}</div><button type="button" onClick={() => removeImage(index)} aria-label={`Remove image ${index + 1}`} className="mt-1 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600">Remove</button></div>)}<button type="button" onClick={addImage} className="rounded-lg border border-primary/15 px-3 py-2 text-sm">Add image URL</button></div></fieldset>

    <div className="mt-6 flex flex-wrap gap-2"><button disabled={saving} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Saving..." : "Save property"}</button><button type="button" onClick={() => setFormOpen(false)} className="rounded-lg border border-primary/15 px-4 py-2 text-sm">Cancel</button></div>
  </form>;
}
