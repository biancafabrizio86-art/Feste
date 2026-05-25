"use client";

import { useState, useEffect } from "react";
import ProductCard from "@/components/ProductCard";

const CATEGORIES = [
  "Tutte",
  "Tende",
  "Tavoli",
  "Sedie",
  "Audio",
  "Illuminazione",
  "Palchi",
  "Effetti Speciali",
  "Intrattenimento",
  "Decorazioni",
  "Energia",
];

type Product = {
  id: string;
  title: string;
  description: string;
  category: string;
  buyPrice: number | null;
  rentPricePerDay: number | null;
  availableForBuy: boolean;
  availableForRent: boolean;
  city: string;
  imageUrl: string | null;
};

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Tutte");
  const [city, setCity] = useState("");
  const [search, setSearch] = useState({ q: "", category: "", city: "" });

  useEffect(() => {
    const params = new URLSearchParams();
    if (search.q) params.set("q", search.q);
    if (search.category && search.category !== "Tutte") params.set("category", search.category);
    if (search.city) params.set("city", search.city);

    setLoading(true);
    fetch(`/api/products?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [search]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch({ q: query, category, city });
  }

  return (
    <div>
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          🎉 Il tuo evento, senza stress
        </h1>
        <p className="text-gray-500 text-lg">
          Noleggia o acquista attrezzature professionali per feste, matrimoni e cerimonie.
        </p>
      </div>

      <form
        onSubmit={handleSearch}
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-8 flex flex-col sm:flex-row gap-3"
      >
        <input
          type="text"
          placeholder="Cerca attrezzatura (es. tendone, casse audio...)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <input
          type="text"
          placeholder="Città"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full sm:w-36 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <button
          type="submit"
          className="bg-orange-500 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
        >
          Cerca
        </button>
      </form>

      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setCategory(cat);
              setSearch({ q: query, category: cat, city });
            }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              category === cat
                ? "bg-orange-500 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-orange-400 hover:text-orange-500"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Caricamento...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">🔍</div>
          <p>Nessun prodotto trovato</p>
        </div>
      ) : (
        <>
          <p className="text-gray-400 text-sm mb-4">{products.length} annunci trovati</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
