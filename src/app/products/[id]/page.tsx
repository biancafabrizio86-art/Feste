"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

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
  owner: { id: string; name: string; email: string };
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"buy" | "rent" | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [ordering, setOrdering] = useState(false);
  const [orderDone, setOrderDone] = useState(false);
  const [orderError, setOrderError] = useState("");

  useEffect(() => {
    fetch(`/api/products/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setProduct(data.error ? null : data);
        setLoading(false);
      });
  }, [params.id]);

  const today = new Date().toISOString().split("T")[0];

  function getRentDays() {
    if (!startDate || !endDate) return 0;
    return Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000);
  }

  async function handleOrder() {
    if (!session) {
      router.push("/auth/login");
      return;
    }
    setOrdering(true);
    setOrderError("");

    const body: any = { productId: product!.id, type: mode };
    if (mode === "rent") {
      body.startDate = startDate;
      body.endDate = endDate;
    }

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setOrdering(false);
    if (res.ok) {
      setOrderDone(true);
    } else {
      const data = await res.json();
      setOrderError(data.error || "Errore durante l'ordine");
    }
  }

  if (loading) {
    return <div className="text-center py-20 text-gray-400">Caricamento...</div>;
  }
  if (!product) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 mb-4">Prodotto non trovato</p>
        <Link href="/" className="text-orange-500 hover:underline">Torna alla home</Link>
      </div>
    );
  }

  const rentDays = getRentDays();
  const rentTotal = rentDays > 0 && product.rentPricePerDay ? rentDays * product.rentPricePerDay : 0;

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/" className="text-orange-500 hover:underline text-sm mb-6 inline-block">
        ← Torna agli annunci
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Image */}
        <div className="h-72 sm:h-96 bg-gray-100 relative">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-8xl">🎪</div>
          )}
          <span className="absolute top-4 left-4 bg-orange-500 text-white text-sm px-3 py-1 rounded-full font-medium">
            {product.category}
          </span>
        </div>

        <div className="p-6 sm:p-8 grid sm:grid-cols-3 gap-8">
          {/* Left: details */}
          <div className="sm:col-span-2">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.title}</h1>
            <p className="text-gray-500 text-sm mb-4">📍 {product.city} · Fornitore: {product.owner.name}</p>
            <p className="text-gray-700 leading-relaxed">{product.description}</p>

            <div className="mt-6 flex flex-wrap gap-3">
              {product.availableForBuy && product.buyPrice && (
                <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                  <div className="text-xs text-green-600 font-medium">Prezzo acquisto</div>
                  <div className="text-xl font-bold text-green-700">€{product.buyPrice.toLocaleString("it-IT")}</div>
                </div>
              )}
              {product.availableForRent && product.rentPricePerDay && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                  <div className="text-xs text-blue-600 font-medium">Prezzo noleggio</div>
                  <div className="text-xl font-bold text-blue-700">€{product.rentPricePerDay}/giorno</div>
                </div>
              )}
            </div>
          </div>

          {/* Right: order panel */}
          <div className="sm:col-span-1">
            {orderDone ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
                <div className="text-4xl mb-2">🎉</div>
                <h3 className="font-bold text-green-800 mb-1">Ordine confermato!</h3>
                <p className="text-green-700 text-sm mb-4">
                  {mode === "buy"
                    ? `Acquisto per €${product.buyPrice?.toLocaleString("it-IT")}`
                    : `Noleggio ${rentDays} giorni per €${rentTotal.toLocaleString("it-IT")}`}
                </p>
                <Link
                  href="/dashboard/buyer"
                  className="text-orange-500 hover:underline text-sm font-medium"
                >
                  Vai ai tuoi ordini →
                </Link>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Cosa vuoi fare?</h3>

                {!mode && (
                  <div className="space-y-3">
                    {product.availableForBuy && product.buyPrice && (
                      <button
                        onClick={() => setMode("buy")}
                        className="w-full bg-green-500 text-white py-2.5 rounded-lg font-medium hover:bg-green-600 transition-colors"
                      >
                        Acquista — €{product.buyPrice.toLocaleString("it-IT")}
                      </button>
                    )}
                    {product.availableForRent && product.rentPricePerDay && (
                      <button
                        onClick={() => setMode("rent")}
                        className="w-full bg-blue-500 text-white py-2.5 rounded-lg font-medium hover:bg-blue-600 transition-colors"
                      >
                        Noleggia — €{product.rentPricePerDay}/giorno
                      </button>
                    )}
                    {!product.availableForBuy && !product.availableForRent && (
                      <p className="text-gray-400 text-sm text-center py-4">
                        Non disponibile al momento
                      </p>
                    )}
                  </div>
                )}

                {mode === "buy" && (
                  <div>
                    <div className="bg-green-50 rounded-lg p-3 mb-4 text-sm text-green-700">
                      Totale: <strong>€{product.buyPrice?.toLocaleString("it-IT")}</strong>
                    </div>
                    {orderError && (
                      <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg mb-3">{orderError}</div>
                    )}
                    <button
                      onClick={handleOrder}
                      disabled={ordering}
                      className="w-full bg-green-500 text-white py-2.5 rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-60 mb-2"
                    >
                      {ordering ? "Conferma..." : "✅ Conferma ordine"}
                    </button>
                    <button
                      onClick={() => setMode(null)}
                      className="w-full text-gray-500 text-sm hover:text-gray-700 py-1"
                    >
                      Annulla
                    </button>
                  </div>
                )}

                {mode === "rent" && (
                  <div>
                    <div className="space-y-3 mb-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Data inizio</label>
                        <input
                          type="date"
                          min={today}
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Data fine</label>
                        <input
                          type="date"
                          min={startDate || today}
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                      </div>
                    </div>
                    {rentDays > 0 && (
                      <div className="bg-blue-50 rounded-lg p-3 mb-4 text-sm text-blue-700">
                        {rentDays} giorni × €{product.rentPricePerDay} = <strong>€{rentTotal.toLocaleString("it-IT")}</strong>
                      </div>
                    )}
                    {orderError && (
                      <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg mb-3">{orderError}</div>
                    )}
                    <button
                      onClick={handleOrder}
                      disabled={ordering || rentDays < 1}
                      className="w-full bg-blue-500 text-white py-2.5 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-60 mb-2"
                    >
                      {ordering ? "Conferma..." : "✅ Conferma noleggio"}
                    </button>
                    <button
                      onClick={() => { setMode(null); setStartDate(""); setEndDate(""); }}
                      className="w-full text-gray-500 text-sm hover:text-gray-700 py-1"
                    >
                      Annulla
                    </button>
                  </div>
                )}

                {!session && mode && (
                  <p className="text-xs text-gray-400 text-center mt-2">
                    Verrai reindirizzato al login
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
