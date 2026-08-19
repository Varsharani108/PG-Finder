export default function LocationSelector({ value, onChange }) {
  return (
    <div>
      <label className="text-sm font-medium">Location / College / Area</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Select college or area"
        className="w-full px-3 py-2 rounded border bg-white mt-1"
      />
    </div>
  );
}
