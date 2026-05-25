"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Product = {
  id: string;
  title: string;
  category: string;
  city: string;
  buyPrice: number | null;
  rentPricePerDay: number | null;
  availableForBuy: boolean;
  availableForRent: boolean;
};

type Order = {
  id: string;
  type: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  startDate: string | null;
  endDate: string | null;
  product: { id: string; title: string };
  buyer: { name: string; email: string };
};

const emptyForm = {
  title: "",
  description: "",
  category: "Tende",
  buyPrice: "",
  rentPricePerDay: "",
  availableForBuy: false,
  availableForRent: false,
  city: "",
  imageUrl: "",
};

const CATEGORIES = ["Tende", "Tavoli", "Sedie", "Audio", "Illuminazione", "Palchi", "Effetti Speciali", "Intrattenimento", "Decorazioni", "Energia"];

export default function OwnerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState<"products" | "orders">("products");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
    if (status === "authenticated" && (session?.user as any)?.role !== "owner") router.push("/");
  }, [status, session, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/products?ownedByMe=1").then((r) => r.json()).then((data) => {
      if (Array.isArray(data)) setProducts(data);
    });
    fetch("/api/orders").then((r) => r.json()).then((data) => {
      if (Array.isArray(data)) setOrders(data);
    });
  }, [status]);

  function openAdd() {
    setForm(emptyForm);
    setEditId(null);
    setError("");
    setShowForm(true);
  }

  function openEdit(p: Product) {
    setForm({
      title: p.title,
      description: "",
      category: p.category,
      buyPrice: p.buyPrice?.toString() || "",
      rentPricePerDay: p.rentPricePerDay?.toString() || "",
      availableForBuy: p.availableForBuy,
      availableForRent: p.availableForRent,
      city: p.city,
      imageUrl: "",
    });
    fetch(`/api/products/${p.id}`).then(r => r.json()).then(data => {
      setForm(prev => ({ ...prev, description: data.description || "", imageUrl: data.imageUrl || "" }));
    });
    setEditId(p.id);
    setError("");
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      ...form,
      buyPrice: form.buyPrice ? parseFloat(form.buyPrice) : null,
      rentPricePerDay: form.rentPricePerDay ? parseFloat(form.rentPricePerDay) : null,
    };

    const url = editId ? `/api/products/${editId}` : "/api/products";
    const method = editId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);
    if (!res.ok) {
      setError("Errore durante il salvataggio");
      return;
    }

    const saved = await res.json();
    if (editId) {
      setProducts((prev) => prev.map((p) => (p.id === editId ? saved : p)));
    } else {
      setProducts((prev) => [saved, ...prev]);
    }
    setShowForm(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Eliminare questo annuncio?")) return;
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  if (status === "loading") return <div className="text-center py-20 text-gray-400">Caricamento...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Fornitore</h1>
        <span className="text-sm text-gray-500">Ciao, {session?.user?.name}</span>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-8 w-fit">
        {(["products", "orders"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t === "products" ? `Annunci (${products.length})` : `Ordini (${orders.length})`}
          </button>
        ))}
      </div>

      {tab === "products" && (
        <>
          <div className="flex justify-end mb-4">
            <button
              onClick={openAdd}
              className="bg-orange-500 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
            >
              + Nuovo annuncio
            </button>
          </div>

          {showForm && (
            <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-5">
                  {editId ? "Modifica annuncio" : "Nuovo annuncio"}
                </h2>
                <form onSubmit={handleSave} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Titolo *</label>
                    <input
                      required
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione *</label>
                    <textarea
                      required
                      rows={3}
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                      <select
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                      >
                        {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Città *</label>
                      <input
                        required
                        value={form.city}
                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Prezzo acquisto (€)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.buyPrice}
                        onChange={(e) => setForm({ ...form, buyPrice: e.target.value })}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                        placeholder="es. 500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Noleggio/giorno (€)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.rentPricePerDay}
                        onChange={(e) => setForm({ ...form, rentPricePerDay: e.target.value })}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                        placeholder="es. 50"
                      />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.availableForBuy}
                        onChange={(e) => setForm({ ...form, availableForBuy: e.target.checked })}
                        className="rounded"
                      />
                      Vendibile
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.availableForRent}
                        onChange={(e) => setForm({ ...form, availableForRent: e.target.checked })}
                        className="rounded"
                      />
                      Noleggiabile
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL immagine</label>
                    <input
                      type="url"
                      value={form.imageUrl}
                      onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                      placeholder="https://..."
                    />
                  </div>

                  {error && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">{error}</div>}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 bg-orange-500 text-white py-2.5 rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-60"
                    >
                      {saving ? "Salvataggio..." : "Salva"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50"
                    >
                      Annulla
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {products.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <div className="text-5xl mb-4">📦</div>
              <p>Nessun annuncio ancora. Crea il tuo primo!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((p) => (
                <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
                  <div>
                    <Link href={`/products/${p.id}`} className="font-medium text-gray-900 hover:text-orange-500">
                      {p.title}
                    </Link>
                    <div className="text-sm text-gray-500 mt-0.5">
                      {p.category} · {p.city}
                      {p.buyPrice && ` · Acquisto €${p.buyPrice}`}
                      {p.rentPricePerDay && ` · Noleggio €${p.rentPricePerDay}/g`}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => openEdit(p)}
                      className="text-sm text-blue-600 hover:underline px-2"
                    >
                      Modifica
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="text-sm text-red-500 hover:underline px-2"
                    >
                      Elimina
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === "orders" && (
        <>
          {orders.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <div className="text-5xl mb-4">📋</div>
              <p>Nessun ordine ricevuto</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((o) => (
                <div key={o.id} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link href={`/products/${o.product.id}`} className="font-medium text-gray-900 hover:text-orange-500">
                        {o.product.title}
                      </Link>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {o.buyer.name} ({o.buyer.email})
                      </p>
                      {o.type === "rent" && o.startDate && o.endDate && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(o.startDate).toLocaleDateString("it-IT")} →{" "}
                          {new Date(o.endDate).toLocaleDateString("it-IT")}
                        </p>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
                        o.type === "buy" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                      }`}>
                        {o.type === "buy" ? "Acquisto" : "Noleggio"}
                      </span>
                      <p className="text-base font-bold text-gray-900 mt-1">
                        €{o.totalPrice.toLocaleString("it-IT")}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(o.createdAt).toLocaleDateString("it-IT")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
