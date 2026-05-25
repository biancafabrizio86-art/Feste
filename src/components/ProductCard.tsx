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
};

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.id}`}>
      <div className="bg-white rounded-xl shadow hover:shadow-md transition-shadow overflow-hidden border border-gray-100">
        <div className="h-48 bg-gray-100 relative overflow-hidden">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl">🎪</div>
          )}
          <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
            {product.category}
          </span>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 text-base leading-tight mb-1 line-clamp-2">
            {product.title}
          </h3>
          <p className="text-gray-500 text-xs mb-3">📍 {product.city}</p>
          <div className="flex flex-wrap gap-2">
            {product.availableForBuy && product.buyPrice && (
              <span className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-md font-medium">
                Acquisto: €{product.buyPrice.toLocaleString("it-IT")}
              </span>
            )}
            {product.availableForRent && product.rentPricePerDay && (
              <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-md font-medium">
                Noleggio: €{product.rentPricePerDay}/giorno
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
