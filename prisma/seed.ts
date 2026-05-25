import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import path from "path";

const dbPath = path.join(process.cwd(), "dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  // Clean up
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  const ownerPassword = await bcrypt.hash("password123", 10);
  const buyerPassword = await bcrypt.hash("password123", 10);

  const owner = await prisma.user.create({
    data: {
      name: "Marco Rossi",
      email: "owner@festaffitto.it",
      password: ownerPassword,
      role: "owner",
    },
  });

  const owner2 = await prisma.user.create({
    data: {
      name: "Giulia Bianchi",
      email: "giulia@festaffitto.it",
      password: ownerPassword,
      role: "owner",
    },
  });

  await prisma.user.create({
    data: {
      name: "Luigi Verdi",
      email: "buyer@festaffitto.it",
      password: buyerPassword,
      role: "buyer",
    },
  });

  const products = [
    {
      title: "Tendone per Feste 6x12m",
      description:
        "Tendone bianco professionale con struttura in acciaio galvanizzato. Capacità fino a 80 persone. Incluso telo pavimento e tende laterali.",
      category: "Tende",
      buyPrice: 2500,
      rentPricePerDay: 150,
      availableForBuy: true,
      availableForRent: true,
      city: "Milano",
      imageUrl: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600",
      ownerId: owner.id,
    },
    {
      title: "Set 10 Tavoli Pieghevoli",
      description:
        "Tavoli pieghevoli rettangolari 180x75cm in alluminio leggero. Perfetti per banchetti e buffet. Facili da trasportare.",
      category: "Tavoli",
      buyPrice: 600,
      rentPricePerDay: 40,
      availableForBuy: true,
      availableForRent: true,
      city: "Roma",
      imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600",
      ownerId: owner.id,
    },
    {
      title: "Set 50 Sedie Chiavarine",
      description:
        "Eleganti sedie chiavarine in legno bianco laccato con seduta imbottita. Ideali per matrimoni ed eventi di lusso.",
      category: "Sedie",
      buyPrice: 1200,
      rentPricePerDay: 60,
      availableForBuy: true,
      availableForRent: true,
      city: "Napoli",
      imageUrl: "https://images.unsplash.com/photo-1581539250439-c96689b516dd?w=600",
      ownerId: owner.id,
    },
    {
      title: "Impianto Audio Professionale 5000W",
      description:
        "Sistema audio completo con 2 casse RCF da 2500W, mixer Yamaha 16 canali, microfoni wireless Shure. Ideale per eventi outdoor fino a 500 persone.",
      category: "Audio",
      buyPrice: 8000,
      rentPricePerDay: 300,
      availableForBuy: false,
      availableForRent: true,
      city: "Milano",
      imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600",
      ownerId: owner2.id,
    },
    {
      title: "Kit Illuminazione LED RGB",
      description:
        "Pacchetto completo: 8 fari PAR LED, 4 teste mobili, controller DMX, cavi inclusi. Crea atmosfere magiche per qualsiasi evento.",
      category: "Illuminazione",
      buyPrice: 3500,
      rentPricePerDay: 180,
      availableForBuy: true,
      availableForRent: true,
      city: "Torino",
      imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600",
      ownerId: owner2.id,
    },
    {
      title: "Palco Modulare 6x4m",
      description:
        "Palco professionale in alluminio altezza 60cm. Facile montaggio senza attrezzi. Portata 500kg/m². Griglia anti-scivolamento.",
      category: "Palchi",
      buyPrice: 5000,
      rentPricePerDay: 250,
      availableForBuy: true,
      availableForRent: true,
      city: "Bologna",
      imageUrl: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600",
      ownerId: owner.id,
    },
    {
      title: "Macchina Fumo e Bolle di Sapone",
      description:
        "Set macchina fumo 1500W + macchina bolle con fluido incluso. Effetti spettacolari per danze e cerimonie. Sicura e facile da usare.",
      category: "Effetti Speciali",
      buyPrice: 450,
      rentPricePerDay: 50,
      availableForBuy: true,
      availableForRent: true,
      city: "Firenze",
      imageUrl: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600",
      ownerId: owner2.id,
    },
    {
      title: "Photobooth Professionale",
      description:
        "Postazione foto completa con ring light, stampa istantanea, sfondi intercambiabili e tablet touch screen. Divertimento garantito!",
      category: "Intrattenimento",
      buyPrice: 2200,
      rentPricePerDay: 120,
      availableForBuy: false,
      availableForRent: true,
      city: "Venezia",
      imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600",
      ownerId: owner2.id,
    },
    {
      title: "Set Decorazioni Matrimonio Premium",
      description:
        "Archi floreali artificiali, runner da tavolo, centrotavola, ghirlande luminose. Kit completo per 100 ospiti. Stile romantico chic.",
      category: "Decorazioni",
      buyPrice: 800,
      rentPricePerDay: 80,
      availableForBuy: true,
      availableForRent: true,
      city: "Palermo",
      imageUrl: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600",
      ownerId: owner.id,
    },
    {
      title: "Generatore Silenzioso 10kW",
      description:
        "Generatore diesel silenziato Honda 10kW. Perfetto per eventi in location senza corrente. Rumorosità inferiore a 65dB. Autonomia 8 ore.",
      category: "Energia",
      buyPrice: 4500,
      rentPricePerDay: 200,
      availableForBuy: true,
      availableForRent: true,
      city: "Bari",
      imageUrl: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600",
      ownerId: owner2.id,
    },
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  console.log("Seed completato! Utenti:");
  console.log("Owner: owner@festaffitto.it / password123");
  console.log("Owner2: giulia@festaffitto.it / password123");
  console.log("Buyer: buyer@festaffitto.it / password123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
