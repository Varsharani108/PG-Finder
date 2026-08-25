import { Pencil, Trash2, Plus } from "lucide-react";
import OwnerPropertyForm from "./OwnerPropertyForm.jsx";

export default function OwnerPropertiesPanel({ properties, formOpen, editingId, form, setForm, setFormOpen, saving, saveProperty, openAdd, openEdit, removeProperty, error }) {
  return <section className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h2 className="text-xl font-semibold text-primary">My Properties</h2><p className="mt-1 text-sm text-primary/60">Only properties owned by your account are shown.</p></div>
      <button onClick={openAdd} className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white"><Plus size={16} /> Add Property</button>
    </div>
    {formOpen && <OwnerPropertyForm editingId={editingId} form={form} setForm={setForm} setFormOpen={setFormOpen} saving={saving} saveProperty={saveProperty} error={error} />}
    {properties.length ? <div className="grid gap-3">{properties.map((property) => <article key={property._id} className="rounded-xl border border-primary/10 bg-white p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-semibold text-primary">{property.name}</h3><p className="mt-1 text-sm text-primary/60">{property.city || property.location} · {property.area || property.location}</p><p className="mt-1 text-xs text-primary/50">{property.displayStatus} · {property.availableRooms ?? "?"} available of {property.totalRooms || property.rooms || "?"}</p></div><div className="flex gap-2"><button onClick={() => openEdit(property)} className="inline-flex items-center gap-1 rounded-lg border border-primary/15 px-3 py-2 text-xs font-semibold"><Pencil size={14} /> Edit</button><button onClick={() => removeProperty(property)} className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600"><Trash2 size={14} /> Delete</button></div></div></article>)}</div> : <p className="rounded-xl border border-primary/10 bg-white p-8 text-center text-sm text-primary/60">No properties yet. Add your first property to begin.</p>}
  </section>;
}
