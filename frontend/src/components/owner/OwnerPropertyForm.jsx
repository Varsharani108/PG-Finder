const roomTypes = [
  ["single", "Single Sharing"],
  ["double", "Double Sharing"],
  ["triple", "Triple Sharing"],
  ["4+", "4+ Sharing"],
];

const facilityOptions = [
  "Wi-Fi", "AC", "Attached bathroom", "Furniture", "Washing machine", "Parking",
  "Power backup", "Study table", "Gym", "CCTV", "24/7 security", "Housekeeping",
  "Laundry service", "Lift", "Hot water", "RO water", "Common room", "Kitchen",
  "Garden", "Balcony",
];
const foodOptions = [
  ["breakfast", "Breakfast"],
  ["lunch", "Lunch"],
  ["dinner", "Dinner"],
];

const emptyFacilityEntry = (name) => ({ name, enabled: false, includedInRent: false, price: 0 });
const emptyFoodEntry = () => ({ enabled: false, includedInRent: false, price: 0 });
const emptyFoodConfig = () => ({ enabled: false, breakfast: emptyFoodEntry(), lunch: emptyFoodEntry(), dinner: emptyFoodEntry(), type: "Vegetarian" });

export const normalizeFacilitiesForForm = (value) => {
  const items = Array.isArray(value) ? value : [];
  const savedNames = items
    .map((item) => (typeof item === "string" ? item : item?.name))
    .filter((name) => typeof name === "string" && name.trim());
  const names = [...new Set([...facilityOptions, ...savedNames])];
  return names.map((name) => {
    const match = items.find((item) => (typeof item === "string" ? item === name : item?.name === name));
    if (match && typeof match === "object") {
      return {
        name,
        enabled: Boolean(match.enabled),
        includedInRent: Boolean(match.includedInRent),
        price: Number(match.price) || 0,
      };
    }
    if (typeof match === "string") {
      return { name, enabled: true, includedInRent: false, price: 0 };
    }
    return emptyFacilityEntry(name);
  });
};

export const normalizeFoodForForm = (value) => {
  const source = value && typeof value === "object" ? value : {};
  const normalized = emptyFoodConfig();
  normalized.enabled = Boolean(source.enabled);
  normalized.type = source.type === "Non-vegetarian" ? "Non-vegetarian" : "Vegetarian";
  ["breakfast", "lunch", "dinner"].forEach((meal) => {
    const entry = source[meal] && typeof source[meal] === "object" ? source[meal] : {};
    normalized[meal] = {
      enabled: Boolean(entry.enabled),
      includedInRent: Boolean(entry.includedInRent),
      price: Number(entry.price) || 0,
    };
  });
  return normalized;
};

export const getPricingSummary = (form) => {
  const selectedRoomTypes = Array.isArray(form.roomType) ? form.roomType : form.roomType ? [form.roomType] : [];
  const roomPrices = form.roomTypePricing || {};
  const lowestRoomRent = selectedRoomTypes.reduce((lowest, roomType) => {
    const price = Number(roomPrices[roomType]) || 0;
    return price > 0 && (lowest === 0 || price < lowest) ? price : lowest;
  }, 0);
  const facilities = Array.isArray(form.facilities) ? form.facilities : [];
  const food = form.food && typeof form.food === "object" ? form.food : emptyFoodConfig();
  const facilityTotal = facilities.reduce((sum, facility) => {
    if (!facility?.enabled || facility.includedInRent) return sum;
    return sum + Math.max(0, Number(facility.price) || 0);
  }, 0);
  const foodTotal = ["breakfast", "lunch", "dinner"].reduce((sum, meal) => {
    const entry = food[meal] || emptyFoodEntry();
    if (!entry.enabled || entry.includedInRent) return sum;
    return sum + Math.max(0, Number(entry.price) || 0);
  }, 0);

  const facilityBreakdown = facilities
    .filter((facility) => facility?.enabled)
    .map((facility) => ({ name: facility.name, price: facility.includedInRent ? 0 : Math.max(0, Number(facility.price) || 0), includedInRent: Boolean(facility.includedInRent) }));

  const foodBreakdown = ["breakfast", "lunch", "dinner"]
    .filter((meal) => food[meal]?.enabled)
    .map((meal) => ({ name: meal, price: food[meal].includedInRent ? 0 : Math.max(0, Number(food[meal].price) || 0), includedInRent: Boolean(food[meal].includedInRent) }));

  return {
    baseRent: lowestRoomRent,
    facilityBreakdown,
    foodBreakdown,
    total: lowestRoomRent + facilityTotal + foodTotal,
  };
};

function Field({ label, required, children }) {
  return <label className="block text-sm font-medium text-primary">{label}{required && <span className="text-red-600"> *</span>}{children}</label>;
}

function inputClass() {
  return "mt-1 w-full rounded-lg border border-primary/15 px-3 py-2.5";
}

function checkboxGroupClass() {
  return "mt-2 grid gap-2 sm:grid-cols-2";
}

export default function OwnerPropertyForm({ editingId, form, setForm, setFormOpen, saving, saveProperty, error }) {
  const set = (field, value) => setForm({ ...form, [field]: value });
  const toggleSelection = (field, value) => {
    const selected = Array.isArray(form[field]) ? form[field] : form[field] ? [form[field]] : [];
    const nextSelected = selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value];
    const nextPricing = { ...(form.roomTypePricing || {}) };
    setForm({ ...form, [field]: nextSelected, roomTypePricing: nextPricing });
  };
  const setRoomTypePrice = (value, rawPrice) => {
    const nextPricing = { ...(form.roomTypePricing || {}) };
    nextPricing[value] = rawPrice;
    setForm({ ...form, roomTypePricing: nextPricing });

  };
  const addImage = () => set("images", [...(form.images || []), ""]);
  const updateImage = (index, value) => set("images", (form.images || []).map((image, imageIndex) => imageIndex === index ? value : image));
  const removeImage = (index) => set("images", (form.images || []).filter((_, imageIndex) => imageIndex !== index));
  const updateFacility = (facilityName, updates) => {
    const facilities = (form.facilities || []).map((facility) => (
      facility.name === facilityName ? { ...facility, ...updates } : facility
    ));
    set("facilities", facilities);
  };
  const toggleFacility = (facilityName) => {
    const next = (form.facilities || []).map((facility) => {
      if (facility.name !== facilityName) return facility;
      return { ...facility, enabled: !facility.enabled, includedInRent: !facility.enabled ? false : facility.includedInRent, price: !facility.enabled ? Math.max(0, Number(facility.price) || 0) : 0 };
    });
    set("facilities", next);
  };
  const updateFoodItem = (meal, updates) => {
    const food = { ...(form.food || emptyFoodConfig()), [meal]: { ...((form.food && form.food[meal]) || emptyFoodEntry()), ...updates } };
    set("food", food);
  };
  const totalSummary = getPricingSummary(form);
  const selectedRoomTypeValues = new Set((form.roomType || []));
  const roomTypePrices = form.roomTypePricing || {};

  return (
    <form onSubmit={saveProperty} className="rounded-xl border border-accent/20 bg-white p-5">
    <h3 className="font-semibold text-primary">{editingId ? "Edit Property" : "Add Property"}</h3>
    <p className="mt-1 text-xs text-primary/60">Fields marked with * are required.</p>
    {error && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}

    <fieldset className="mt-5"><legend className="text-sm font-semibold text-primary">Basic Information</legend><div className="mt-3 grid gap-4 sm:grid-cols-2">
      <Field label="PG name" required><input required value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Sunrise PG" className={inputClass()} /></Field>
      <Field label="City" required><input required value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Amritsar" className={inputClass()} /></Field>
      <Field label="Area" required><input required value={form.area} onChange={(e) => set("area", e.target.value)} placeholder="Civil Lines" className={inputClass()} /></Field>
      <Field label="Location" required><input required value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="Full address or landmark" className={inputClass()} /></Field>
      <Field label="Description"><textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Describe the property" rows="3" className={inputClass()} /></Field>
    </div></fieldset>

    <fieldset className="mt-6"><legend className="text-sm font-semibold text-primary">Pricing</legend>
      <div className="mt-3 rounded-xl border border-primary/10 bg-primary/5 p-4">
        <p className="text-sm font-semibold text-primary">Room-wise pricing</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {roomTypes.map(([value, label]) => {
            const isSelected = selectedRoomTypeValues.has(value);
            return (
              <div key={value} className={`rounded-xl border p-3 ${isSelected ? "border-accent/40 bg-white" : "border-primary/10 bg-transparent opacity-60"}`}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary/60">{label}</p>
                {isSelected ? (
                  <label className="mt-2 block text-xs text-primary/60">
                    Monthly rent (₹)
                    <input
                      min="1"
                      step="1"
                      type="number"
                      value={roomTypePrices[value] ?? ""}
                      onChange={(event) => setRoomTypePrice(value, event.target.value)}
                      placeholder="3000"
                      className="mt-1 w-full rounded-lg border border-primary/15 px-3 py-2 text-sm"
                    />
                  </label>
                ) : (
                  <p className="mt-2 text-sm text-primary/50">Select this room type</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <p className="mt-2 text-xs text-primary/60">Choose the room types and enter the rent for each selected type individually. The selected values are kept in sync with the property pricing.</p>

      <div className="mt-4 rounded-xl border border-primary/10 bg-primary/5 p-4">
        <p className="text-sm font-semibold text-primary">Live price summary</p>
        <div className="mt-2 space-y-2 text-sm text-primary/70">
          <div className="flex justify-between gap-4"><span>Lowest selected room rent</span><span>₹{Number(totalSummary.baseRent || 0).toLocaleString("en-IN")}</span></div>
          {totalSummary.facilityBreakdown.length ? <div><p className="font-medium text-primary">Additional Facilities</p>{totalSummary.facilityBreakdown.map((item) => <div key={item.name} className="flex justify-between gap-4"><span>{item.name}</span><span>₹{Number(item.price || 0).toLocaleString("en-IN")}</span></div>)}</div> : null}
          {totalSummary.foodBreakdown.length ? <div><p className="font-medium text-primary">Food</p>{totalSummary.foodBreakdown.map((item) => <div key={item.name} className="flex justify-between gap-4"><span>{item.name}</span><span>₹{Number(item.price || 0).toLocaleString("en-IN")}</span></div>)}</div> : null}
          <div className="flex justify-between gap-4 border-t border-primary/10 pt-2 text-base font-semibold text-primary"><span>Estimated Monthly Total</span><span>₹{Number(totalSummary.total || 0).toLocaleString("en-IN")}</span></div>
        </div>
      </div>
    </fieldset>

    <fieldset className="mt-6"><legend className="text-sm font-semibold text-primary">Rooms</legend><div className="mt-3 grid gap-4 sm:grid-cols-3">
      <Field label="Total rooms" required><input required min="1" step="1" type="number" value={form.totalRooms} onChange={(e) => set("totalRooms", e.target.value)} className={inputClass()} /></Field>
      <Field label="Available rooms" required><input required min="0" step="1" type="number" value={form.availableRooms} onChange={(e) => set("availableRooms", e.target.value)} className={inputClass()} /></Field>
      <div className="text-sm font-medium text-primary"><span>Room type <span className="text-red-600">*</span></span><div className={checkboxGroupClass()}>{roomTypes.map(([value, label]) => <label key={value} className="inline-flex items-center gap-2 font-normal"><input type="checkbox" checked={(form.roomType || []).includes(value)} onChange={() => toggleSelection("roomType", value)} />{label}</label>)}</div>{!form.roomType?.length && <p className="mt-1 text-xs font-normal text-primary/60">Select at least one room type.</p>}</div>
    </div></fieldset>

    <fieldset className="mt-6"><legend className="text-sm font-semibold text-primary">Preferences</legend><div className="mt-3 text-sm font-medium text-primary"><span>Tenant preference <span className="text-red-600">*</span></span><div className={checkboxGroupClass()}>{[["male", "Male"], ["female", "Female"], ["co-living", "Co-living"]].map(([value, label]) => <label key={value} className="inline-flex items-center gap-2 font-normal"><input type="checkbox" checked={(form.genderPreference || []).includes(value)} onChange={() => toggleSelection("genderPreference", value)} />{label}</label>)}</div>{!form.genderPreference?.length && <p className="mt-1 text-xs font-normal text-primary/60">Select at least one preference.</p>}</div></fieldset>

    <fieldset className="mt-6"><legend className="text-sm font-semibold text-primary">Facilities</legend><div className="mt-3 space-y-3">{(form.facilities || []).map((facility) => <div key={facility.name} className="rounded-xl border border-primary/10 p-3"><div className="flex items-center justify-between gap-3"><label className="inline-flex items-center gap-2 text-sm font-medium text-primary"><input type="checkbox" checked={Boolean(facility.enabled)} onChange={() => toggleFacility(facility.name)} />{facility.name}</label></div>{facility.enabled && <div className="mt-3 space-y-2"><div className="flex flex-wrap gap-4 text-sm"><label className="inline-flex items-center gap-2"><input type="radio" name={`facility-${facility.name}`} checked={Boolean(facility.includedInRent)} onChange={() => updateFacility(facility.name, { includedInRent: true, price: 0 })} />Included in rent</label><label className="inline-flex items-center gap-2"><input type="radio" name={`facility-${facility.name}`} checked={!facility.includedInRent} onChange={() => updateFacility(facility.name, { includedInRent: false, price: Number(facility.price) || 0 })} />Additional charge</label></div>{!facility.includedInRent && <label className="block text-sm font-medium text-primary">Additional monthly price: ₹<input min="0" step="1" type="number" value={facility.price ?? 0} onChange={(e) => updateFacility(facility.name, { price: Math.max(0, Number(e.target.value) || 0) })} className="ml-2 mt-1 inline-block w-28 rounded-lg border border-primary/15 px-2 py-1.5" /></label>}</div>}</div>)}</div></fieldset>

    <fieldset className="mt-6">
      <legend className="text-sm font-semibold text-primary">Food</legend>
      <div className="mt-3 space-y-3">
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={Boolean(form.food?.enabled)}
            onChange={(event) => set("food", { ...(form.food || emptyFoodConfig()), enabled: event.target.checked })}
          />
          Food included
        </label>

        {foodOptions.map(([value, label]) => {
          const foodItem = form.food?.[value] || emptyFoodEntry();
          return (
            <div key={value} className="rounded-xl border border-primary/10 p-3">
              <div className="flex items-center justify-between gap-3">
                <label className="inline-flex items-center gap-2 text-sm font-medium text-primary">
                  <input
                    type="checkbox"
                    checked={Boolean(foodItem.enabled)}
                    onChange={(event) => updateFoodItem(value, {
                      enabled: event.target.checked,
                      includedInRent: event.target.checked ? false : true,
                      price: event.target.checked && !foodItem.includedInRent ? Number(foodItem.price) || 0 : 0,
                    })}
                  />
                  {label}
                </label>
              </div>

              {foodItem.enabled && (
                <div className="mt-3 space-y-2">
                  <div className="flex flex-wrap gap-4 text-sm">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name={`food-${value}`}
                        checked={Boolean(foodItem.includedInRent)}
                        onChange={() => updateFoodItem(value, { includedInRent: true, price: 0 })}
                      />
                      Included in rent
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name={`food-${value}`}
                        checked={!foodItem.includedInRent}
                        onChange={() => updateFoodItem(value, { includedInRent: false, price: Number(foodItem.price) || 0 })}
                      />
                      Additional charge
                    </label>
                  </div>

                  {!foodItem.includedInRent && (
                    <label className="block text-sm font-medium text-primary">
                      Price: ₹
                      <input
                        min="0"
                        step="1"
                        type="number"
                        value={foodItem.price ?? 0}
                        onChange={(event) => updateFoodItem(value, { price: Math.max(0, Number(event.target.value) || 0) })}
                        className="ml-2 mt-1 inline-block w-28 rounded-lg border border-primary/15 px-2 py-1.5"
                      />
                    </label>
                  )}
                </div>
              )}
            </div>
          );
        })}

        <div className="rounded-xl border border-primary/10 p-3">
          <p className="text-sm font-medium text-primary">Food preference</p>
          <div className="mt-2 flex flex-wrap gap-4 text-sm">
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="foodType"
                checked={form.food?.type !== "Non-vegetarian"}
                onChange={() => set("food", { ...(form.food || emptyFoodConfig()), type: "Vegetarian" })}
              />
              Vegetarian
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="foodType"
                checked={form.food?.type === "Non-vegetarian"}
                onChange={() => set("food", { ...(form.food || emptyFoodConfig()), type: "Non-vegetarian" })}
              />
              Non-vegetarian
            </label>
          </div>
        </div>
      </div>
    </fieldset>

    <fieldset className="mt-6"><legend className="text-sm font-semibold text-primary">Location</legend><div className="mt-3 grid gap-4 sm:grid-cols-2"><Field label="College name"><input value={form.college} onChange={(e) => set("college", e.target.value)} placeholder="Nearby college" className={inputClass()} /></Field><Field label="Distance from college (metres)"><input min="0" step="1" type="number" value={form.distanceFromCollege} onChange={(e) => set("distanceFromCollege", e.target.value)} placeholder="Optional" className={inputClass()} /></Field><Field label="Latitude"><input min="-90" max="90" step="any" type="number" value={form.latitude || ""} onChange={(e) => set("latitude", e.target.value)} placeholder="e.g. 31.6340" className={inputClass()} /></Field><Field label="Longitude"><input min="-180" max="180" step="any" type="number" value={form.longitude || ""} onChange={(e) => set("longitude", e.target.value)} placeholder="e.g. 74.8723" className={inputClass()} /></Field></div><p className="mt-2 text-xs text-primary/60">Add both coordinates to show this PG on the map. You can copy them from a map service.</p></fieldset>

    <fieldset className="mt-6"><legend className="text-sm font-semibold text-primary">Images</legend><p className="mt-1 text-xs text-primary/60">Add image URLs. They will be previewed below.</p><div className="mt-3 space-y-3">{(form.images || []).map((image, index) => <div key={`${index}-${image}`} className="flex flex-wrap items-start gap-2"><div className="min-w-0 flex-1"><input type="url" value={image} onChange={(e) => updateImage(index, e.target.value)} placeholder="https://example.com/pg.jpg" className={inputClass()} />{image && <img src={image} alt={`Property preview ${index + 1}`} className="mt-2 h-20 w-28 rounded object-cover border" onError={(e) => { e.currentTarget.style.display = "none"; }} />}</div><button type="button" onClick={() => removeImage(index)} aria-label={`Remove image ${index + 1}`} className="mt-1 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600">Remove</button></div>)}<button type="button" onClick={addImage} className="rounded-lg border border-primary/15 px-3 py-2 text-sm">Add image URL</button></div></fieldset>

    <div className="mt-6 flex flex-wrap gap-2"><button disabled={saving} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Saving..." : "Save property"}</button><button type="button" onClick={() => setFormOpen(false)} className="rounded-lg border border-primary/15 px-4 py-2 text-sm">Cancel</button></div>
    </form>
  );
}
