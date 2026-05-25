import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get("key") !== "festaffitto-setup-2024") {
    return NextResponse.json({ error: "Chiave non valida" }, { status: 401 });
  }

  const sql = neon(process.env.DATABASE_URL!);

  await sql`DROP TABLE IF EXISTS "Order" CASCADE`;
  await sql`DROP TABLE IF EXISTS "Product" CASCADE`;
  await sql`DROP TABLE IF EXISTS "User" CASCADE`;

  await sql`
    CREATE TABLE "User" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "email" TEXT NOT NULL UNIQUE,
      "password" TEXT NOT NULL,
      "role" TEXT NOT NULL DEFAULT 'buyer',
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE "Product" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "title" TEXT NOT NULL,
      "description" TEXT NOT NULL,
      "category" TEXT NOT NULL,
      "buyPrice" DOUBLE PRECISION,
      "rentPricePerDay" DOUBLE PRECISION,
      "availableForBuy" BOOLEAN NOT NULL DEFAULT false,
      "availableForRent" BOOLEAN NOT NULL DEFAULT false,
      "city" TEXT NOT NULL,
      "imageUrl" TEXT,
      "ownerId" TEXT NOT NULL,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      CONSTRAINT "Product_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id")
    )
  `;

  await sql`
    CREATE TABLE "Order" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "productId" TEXT NOT NULL,
      "buyerId" TEXT NOT NULL,
      "type" TEXT NOT NULL,
      "startDate" TIMESTAMP,
      "endDate" TIMESTAMP,
      "totalPrice" DOUBLE PRECISION NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'pending',
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      CONSTRAINT "Order_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id"),
      CONSTRAINT "Order_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id")
    )
  `;

  function cuid() {
    return "c" + Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
  }

  const ownerPwd = await bcrypt.hash("password123", 10);
  const buyerPwd = await bcrypt.hash("password123", 10);
  const o1 = cuid(), o2 = cuid(), b1 = cuid();

  await sql`INSERT INTO "User" VALUES (${o1},'Marco Rossi','owner@festaffitto.it',${ownerPwd},'owner',NOW())`;
  await sql`INSERT INTO "User" VALUES (${o2},'Giulia Bianchi','giulia@festaffitto.it',${ownerPwd},'owner',NOW())`;
  await sql`INSERT INTO "User" VALUES (${b1},'Luigi Verdi','buyer@festaffitto.it',${buyerPwd},'buyer',NOW())`;

  const products = [
    [cuid(),'Tendone per Feste 6x12m','Tendone bianco professionale con struttura in acciaio galvanizzato. Capacità fino a 80 persone. Incluso telo pavimento e tende laterali.','Tende',2500,150,true,true,'Milano','https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600',o1],
    [cuid(),'Set 10 Tavoli Pieghevoli','Tavoli pieghevoli rettangolari 180x75cm in alluminio leggero. Perfetti per banchetti e buffet.','Tavoli',600,40,true,true,'Roma','https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600',o1],
    [cuid(),'Set 50 Sedie Chiavarine','Eleganti sedie chiavarine in legno bianco laccato. Ideali per matrimoni ed eventi di lusso.','Sedie',1200,60,true,true,'Napoli','https://images.unsplash.com/photo-1581539250439-c96689b516dd?w=600',o1],
    [cuid(),'Impianto Audio Professionale 5000W','Sistema audio completo con 2 casse RCF da 2500W, mixer Yamaha 16 canali, microfoni wireless Shure.','Audio',null,300,false,true,'Milano','https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600',o2],
    [cuid(),'Kit Illuminazione LED RGB','Pacchetto completo: 8 fari PAR LED, 4 teste mobili, controller DMX. Crea atmosfere magiche.','Illuminazione',3500,180,true,true,'Torino','https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600',o2],
    [cuid(),'Palco Modulare 6x4m','Palco professionale in alluminio altezza 60cm. Facile montaggio. Portata 500kg/m².','Palchi',5000,250,true,true,'Bologna','https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600',o1],
    [cuid(),'Macchina Fumo e Bolle di Sapone','Set macchina fumo 1500W + macchina bolle con fluido incluso. Effetti spettacolari.','Effetti Speciali',450,50,true,true,'Firenze','https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600',o2],
    [cuid(),'Photobooth Professionale','Postazione foto con ring light, stampa istantanea, sfondi intercambiabili e tablet touch screen.','Intrattenimento',null,120,false,true,'Venezia','https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600',o2],
    [cuid(),'Set Decorazioni Matrimonio Premium','Archi floreali, runner da tavolo, centrotavola, ghirlande luminose. Kit completo per 100 ospiti.','Decorazioni',800,80,true,true,'Palermo','https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600',o1],
    [cuid(),'Generatore Silenzioso 10kW','Generatore diesel silenziato Honda 10kW. Rumorosità inferiore a 65dB. Autonomia 8 ore.','Energia',4500,200,true,true,'Bari','https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600',o2],
  ];

  for (const [id,title,description,category,buyPrice,rentPricePerDay,availableForBuy,availableForRent,city,imageUrl,ownerId] of products) {
    await sql`INSERT INTO "Product" VALUES (${id},${title},${description},${category},${buyPrice},${rentPricePerDay},${availableForBuy},${availableForRent},${city},${imageUrl},${ownerId},NOW())`;
  }

  return NextResponse.json({
    ok: true,
    message: "Database configurato con 3 utenti e 10 prodotti!",
    accounts: [
      "owner@festaffitto.it / password123",
      "buyer@festaffitto.it / password123",
    ],
  });
}
