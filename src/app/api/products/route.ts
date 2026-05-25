import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const city = searchParams.get("city") || "";
  const ownedByMe = searchParams.get("ownedByMe");

  let ownerId: string | undefined;
  if (ownedByMe) {
    const session = await getServerSession(authOptions);
    if (session) ownerId = (session.user as any).id;
  }

  const products = await prisma.product.findMany({
    where: {
      ...(ownerId && { ownerId }),
      ...(q && {
        OR: [
          { title: { contains: q } },
          { description: { contains: q } },
        ],
      }),
      ...(category && { category }),
      ...(city && { city: { contains: city } }),
    },
    include: { owner: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "owner") {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const data = await req.json();
  const product = await prisma.product.create({
    data: {
      ...data,
      ownerId: (session.user as any).id,
    },
  });

  return NextResponse.json(product, { status: 201 });
}
