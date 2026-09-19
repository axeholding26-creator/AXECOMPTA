import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  ensureSyscohadaAccounts,
  createDemoDossiers,
  createDemoEntries,
  createDemoNotifications,
  createDefaultPlatformSettings,
} from '../server/seedData';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await ensureSyscohadaAccounts(prisma);
  console.log('✓ Plan comptable SYSCOHADA');

  if ((await prisma.clientDossier.count()) === 0) {
    await createDemoDossiers(prisma);
    console.log('✓ Dossiers clients de démonstration');
  } else {
    console.log('· Dossiers déjà présents, inchangés');
  }

  if ((await prisma.journalEntry.count()) === 0) {
    await createDemoEntries(prisma);
    console.log('✓ Écritures comptables de démonstration');
  } else {
    console.log('· Écritures déjà présentes, inchangées');
  }

  if ((await prisma.appNotification.count()) === 0) {
    await createDemoNotifications(prisma);
    console.log('✓ Notifications de démonstration');
  } else {
    console.log('· Notifications déjà présentes, inchangées');
  }

  if ((await prisma.platformSettings.count()) === 0) {
    await createDefaultPlatformSettings(prisma);
    console.log('✓ Paramètres de la plateforme (valeurs par défaut)');
  } else {
    console.log('· Paramètres déjà présents, inchangés');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
