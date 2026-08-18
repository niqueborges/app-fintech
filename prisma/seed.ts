import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { Role } from '../src/generated/prisma/enums.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:dev@localhost:5432/fintech';
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash('SenhaForte123!', 10);

  // 1. Maria (Admin)
  await prisma.user.upsert({
    where: { email: 'maria@fintech.com' },
    update: {},
    create: {
      name: 'Maria Fintech',
      email: 'maria@fintech.com',
      cpf: '00011122233',
      password: passwordHash,
      role: Role.ADMIN,
    },
  });

  // 2. Lucas (Compliance)
  await prisma.user.upsert({
    where: { email: 'lucas@fintech.com' },
    update: {},
    create: {
      name: 'Lucas Compliance',
      email: 'lucas@fintech.com',
      cpf: '44455566677',
      password: passwordHash,
      role: Role.COMPLIANCE_OFFICER,
    },
  });

  // 3. Joao Silva (Cliente com R$ 5.000,00)
  await prisma.user.upsert({
    where: { email: 'joao@email.com' },
    update: {},
    create: {
      name: 'Joao Silva',
      email: 'joao@email.com',
      cpf: '12345678901',
      password: passwordHash,
      role: Role.CUSTOMER,
      accounts: {
        create: {
          accountNumber: '10001-9',
          balance: BigInt(500000), // R$ 5.000,00
          dailyPixLimit: BigInt(1000000), // R$ 10.000,00
          pixKeys: {
            create: {
              keyType: 'CPF',
              keyValue: '12345678901',
            },
          },
        },
      },
    },
  });

  // 4. Carla Souza (Cliente com R$ 2.500,00)
  await prisma.user.upsert({
    where: { email: 'carla@email.com' },
    update: {},
    create: {
      name: 'Carla Souza',
      email: 'carla@email.com',
      cpf: '98765432100',
      password: passwordHash,
      role: Role.CUSTOMER,
      accounts: {
        create: {
          accountNumber: '20002-8',
          balance: BigInt(250000), // R$ 2.500,00
          dailyPixLimit: BigInt(500000), // R$ 5.000,00
          pixKeys: {
            create: {
              keyType: 'EMAIL',
              keyValue: 'carla@email.com',
            },
          },
        },
      },
    },
  });

  console.log('Seed bancario executado com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
