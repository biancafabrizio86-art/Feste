import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  if (role === "owner") {
    const orders = await prisma.order.findMany({
      where: { product: { ownerId: userId } },
      include: {
        product: { select: { id: true, title: true } },
        buyer: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(orders);
  } else {
    const orders = await prisma.order.findMany({
      where: { buyerId: userId },
      include: {
        product: { select: { id: true, title: true, imageUrl: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(orders);
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const { productId, type, startDate, endDate } = await req.json();
  const buyerId = (session.user as any).id;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return NextResponse.json({ error: "Prodotto non trovato" }, { status: 404 });

  let totalPrice = 0;
  if (type === "buy") {
    if (!product.availableForBuy || !product.buyPrice) {
      return NextResponse.json({ error: "Prodotto non disponibile per l'acquisto" }, { status: 400 });
    }
    totalPrice = product.buyPrice;
  } else if (type === "rent") {
    if (!product.availableForRent || !product.rentPricePerDay || !startDate || !endDate) {
      return NextResponse.json({ error: "Dati noleggio non validi" }, { status: 400 });
    }
    const days = Math.ceil(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (days < 1) return NextResponse.json({ error: "Date non valide" }, { status: 400 });
    totalPrice = days * product.rentPricePerDay;
  }

  const order = await prisma.order.create({
    data: {
      productId,
      buyerId,
      type,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      totalPrice,
      status: "confirmed",
    },
  });

  return NextResponse.json(order, { status: 201 });
}
