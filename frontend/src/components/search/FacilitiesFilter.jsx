const OPTIONS = [
  "Wi-Fi", "AC", "Attached bathroom", "Furniture", "Washing machine", "Parking",
  "Power backup", "Study table", "Gym", "CCTV", "24/7 security", "Housekeeping",
  "Laundry service", "Lift", "Hot water", "RO water", "Common room", "Kitchen",
  "Garden", "Balcony",
];

export default function FacilitiesFilter({ value, onChange }) {
  const selectedFacilities = Array.isArray(value) ? value : [];
  const toggle = (opt) => {
    if (selectedFacilities.includes(opt)) onChange(selectedFacilities.filter((v) => v !== opt));
    else onChange([...selectedFacilities, opt]);
  };

  return (
    <fieldset>
      <legend className="text-sm font-medium text-primary">Facilities</legend>
      <div className="mt-2 grid max-h-64 grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
        {OPTIONS.map((o) => (
          <label key={o} className="flex cursor-pointer items-center gap-2 text-sm text-primary">
            <input type="checkbox" checked={selectedFacilities.includes(o)} onChange={() => toggle(o)} className="h-4 w-4 shrink-0" />
            <span>{o}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
