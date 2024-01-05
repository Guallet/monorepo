import { Account } from 'src/accounts/entities/account.entity';
import { Institution } from 'src/institutions/entities/institution.entity';
import { DataSource } from 'typeorm';

seed();

async function seed() {
  const db = new DataSource({
    type: 'postgres',
    // url: process.env.DATABASE_URL,
    url: 'postgresql://postgres:Guallet2020!@db.tmqyfmfilopdrhovpnrr.supabase.co:5432/postgres',
    synchronize: true,
    logging: true,
    entities: [Institution, Account],
    ssl: { rejectUnauthorized: false },
  });

  db.initialize()
    .then(async (db: DataSource) => {
      await seedInstitutions(db);
      await seedAccounts();
      console.log('Database seeded!');
    })
    .catch((error) =>
      console.error('Error initializing the DB connection', error),
    );
}

async function seedInstitutions(db: DataSource) {
  console.log('Seeding Institutions');
  const institutions = [
    {
      id: '738be02a-09a6-4610-b96c-66639801645e',
      name: 'Monzo',
      image_src: '',
    },
    {
      id: '2e96698a-5e47-4bb9-9662-e0915bfe4752',
      name: 'Natwest',
      image_src: '',
    },
    {
      id: '2e31f27d-faf2-4e17-b11d-5157f0285191',
      name: 'Lloyds',
      image_src: '',
    },
    {
      id: '40599d1f-e3f9-4075-af10-e2c2d0399279',
      name: 'Chase',
      image_src: '',
    },
    {
      id: '35106684-4039-41c8-9219-77a1da715287',
      name: 'Chip',
      image_src: '',
    },
    {
      id: '4b133c02-0f3a-46f6-8cf4-ffb3a79c1707',
      name: 'Vanguard',
      image_src: '',
    },
  ];

  const repository = db.getRepository(Institution);
  await repository.save(institutions);
}

async function seedAccounts() {
  console.log('Seeding accounts');
}
