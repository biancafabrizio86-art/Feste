"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Order = {
  id: string;
  type: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  startDate: string | null;
  endDate: string | null;
  product: { id: string; title: string; imageUrl: string | null };
};

export default function BuyerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
    if (status === "authenticated" && (session?.user as any)?.role !== "buyer") router.push("/");
  }, [status, session, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setOrders(data);
        setLoading(false);
      });
  }, [status]);

  if (status === "loading" || loading) {
    return <div className="text-center py-20 text-gray-400">Caricamento...</div>;
  }

  const buys = orders.filter((o) => o.type === "buy");
  const rents = orders.filter((o) => o.type === "rent");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">I miei ordini</h1>
        <span className="text-sm text-gray-500">Ciao, {session?.user?.name}</span>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">🛒</div>
          <p className="mb-4">Non hai ancora effettuato ordini</p>
          <Link href="/" className="bg-orange-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-600">
            Sfoglia annunci
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {buys.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-sm">Acquisti</span>
                <span className="text-sm text-gray-400 font-normal">{buys.length} ordini</span>
              </h2>
              <div className="space-y-3">
                {buys.map((o) => (
                  <OrderCard key={o.id} order={o} />
                ))}
              </div>
            </section>
          )}

          {rents.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-sm">Noleggi</span>
                <span className="text-sm text-gray-400 font-normal">{rents.length} ordini</span>
              </h2>
              <div className="space-y-3">
                {rents.map((o) => (
                  <OrderCard key={o.id} order={o} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4">
      <div className="w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
        {order.product.imageUrl ? (
          <img src={order.product.imageUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">🎪</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <Link
          href={`/products/${order.product.id}`}
          className="font-medium text-gray-900 hover:text-orange-500 block truncate"
        >
          {order.product.title}
        </Link>
        {order.type === "rent" && order.startDate && order.endDate && (
          <p className="text-xs text-gray-500 mt-0.5">
            📅 {new Date(order.startDate).toLocaleDateString("it-IT")} →{" "}
            {new Date(order.endDate).toLocaleDateString("it-IT")}
          </p>
        )}
        <p className="text-xs text-gray-400 mt-0.5">
          Ordinato il {new Date(order.createdAt).toLocaleDateString("it-IT")}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-base font-bold text-gray-900">
          €{order.totalPrice.toLocaleString("it-IT")}
        </p>
        <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium mt-1 ${
          order.status === "confirmed"
            ? "bg-green-100 text-green-700"
            : "bg-yellow-100 text-yellow-700"
        }`}>
          {order.status === "confirmed" ? "Confermato" : order.status}
        </span>
      </div>
    </div>
  );
}
