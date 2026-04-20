import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

const prismaClientSingleton = () => {
  // Prisma 7 richiede l'istanza di un pool per connettersi
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  
  // Passiamo l'adapter al client
  return new PrismaClient({ adapter });
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

export const db = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = db;