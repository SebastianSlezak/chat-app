import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as bcrypt from 'bcrypt'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/booktracker'
const connection = postgres(connectionString)
const db = drizzle(connection, { schema })

async function seed() {
  console.log('🌱 Seeding database...')

  const hashedPassword = await bcrypt.hash('password123', 10)
  
  const [user1, user2, admin] = await db.insert(schema.users).values([
    {
      email: 'jan.kowalski@example.com',
      password: hashedPassword,
      name: 'Jan Kowalski',
      role: 'user'
    },
    {
      email: 'anna.nowak@example.com',
      password: hashedPassword,
      name: 'Anna Nowak',
      role: 'user'
    },
    {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'admin'
    }
  ]).returning()

  console.log('✅ Created 3 users')

  const categoryData = [
    { name: 'Fantasy', description: 'Fantastyka i światy wyobraźni' },
    { name: 'Science Fiction', description: 'Fantastyka naukowa' },
    { name: 'Mystery', description: 'Kryminał i thriller' },
    { name: 'Romance', description: 'Romans' },
    { name: 'Biography', description: 'Biografie i autobiografie' },
    { name: 'History', description: 'Historia' },
    { name: 'Self-Help', description: 'Rozwój osobisty' },
    { name: 'Business', description: 'Biznes i zarządzanie' },
    { name: 'Fiction', description: 'Literatura piękna' },
    { name: 'Non-Fiction', description: 'Literatura faktu' }
  ]

  const createdCategories = await db.insert(schema.categories).values(categoryData).returning()
  console.log('✅ Created 10 categories')

  const booksUser1 = await db.insert(schema.books).values([
    {
      userId: user1.id,
      title: 'Władca Pierścieni: Drużyna Pierścienia',
      author: 'J.R.R. Tolkien',
      isbn: '9788370018467',
      totalPages: 576,
      currentPage: 576,
      status: 'completed',
      rating: 5,
      startDate: new Date('2024-01-15'),
      finishDate: new Date('2024-02-20')
    },
    {
      userId: user1.id,
      title: 'Hobbit, czyli tam i z powrotem',
      author: 'J.R.R. Tolkien',
      isbn: '9788370018450',
      totalPages: 304,
      currentPage: 150,
      status: 'reading',
      startDate: new Date('2024-11-01')
    },
    {
      userId: user1.id,
      title: 'Diuna',
      author: 'Frank Herbert',
      isbn: '9788382151381',
      totalPages: 704,
      currentPage: 0,
      status: 'to_read'
    },
    {
      userId: user1.id,
      title: 'Fundacja',
      author: 'Isaac Asimov',
      isbn: '9788381108638',
      totalPages: 296,
      currentPage: 296,
      status: 'completed',
      rating: 4,
      startDate: new Date('2024-09-01'),
      finishDate: new Date('2024-09-25')
    },
    {
      userId: user1.id,
      title: 'Neuromancer',
      author: 'William Gibson',
      isbn: '9788375780581',
      totalPages: 352,
      currentPage: 100,
      status: 'reading',
      startDate: new Date('2025-01-10')
    },
    {
      userId: user1.id,
      title: 'Rok 1984',
      author: 'George Orwell',
      isbn: '9788381162296',
      totalPages: 328,
      currentPage: 328,
      status: 'completed',
      rating: 5,
      startDate: new Date('2024-06-01'),
      finishDate: new Date('2024-06-15')
    },
    {
      userId: user1.id,
      title: 'Brave New World',
      author: 'Aldous Huxley',
      isbn: '9780060850524',
      totalPages: 288,
      currentPage: 50,
      status: 'abandoned'
    },
    {
      userId: user1.id,
      title: 'Solaris',
      author: 'Stanisław Lem',
      isbn: '9788381162302',
      totalPages: 224,
      currentPage: 0,
      status: 'to_read'
    }
  ]).returning()

  console.log('✅ Created 8 books for user1')

  const booksUser2 = await db.insert(schema.books).values([
    {
      userId: user2.id,
      title: 'Morderstwo w Orient Expressie',
      author: 'Agatha Christie',
      isbn: '9788380695146',
      totalPages: 256,
      currentPage: 256,
      status: 'completed',
      rating: 4,
      startDate: new Date('2024-10-01'),
      finishDate: new Date('2024-10-15')
    },
    {
      userId: user2.id,
      title: 'Kod Leonarda da Vinci',
      author: 'Dan Brown',
      isbn: '9788381162319',
      totalPages: 592,
      currentPage: 300,
      status: 'reading',
      startDate: new Date('2025-01-05')
    },
    {
      userId: user2.id,
      title: 'Dziewczyna z tatuażem',
      author: 'Stieg Larsson',
      isbn: '9788381162326',
      totalPages: 656,
      currentPage: 0,
      status: 'to_read'
    },
    {
      userId: user2.id,
      title: 'Duma i uprzedzenie',
      author: 'Jane Austen',
      isbn: '9788381162333',
      totalPages: 432,
      currentPage: 432,
      status: 'completed',
      rating: 5,
      startDate: new Date('2024-08-01'),
      finishDate: new Date('2024-08-20')
    },
    {
      userId: user2.id,
      title: 'Anna Karenina',
      author: 'Lew Tołstoj',
      isbn: '9788381162340',
      totalPages: 864,
      currentPage: 200,
      status: 'reading',
      startDate: new Date('2024-12-01')
    },
    {
      userId: user2.id,
      title: 'Steve Jobs',
      author: 'Walter Isaacson',
      isbn: '9788381162357',
      totalPages: 656,
      currentPage: 656,
      status: 'completed',
      rating: 5,
      startDate: new Date('2024-05-01'),
      finishDate: new Date('2024-05-30')
    },
    {
      userId: user2.id,
      title: 'Sapiens. Od zwierząt do bogów',
      author: 'Yuval Noah Harari',
      isbn: '9788381162364',
      totalPages: 512,
      currentPage: 0,
      status: 'to_read'
    },
    {
      userId: user2.id,
      title: 'Atomowe nawyki',
      author: 'James Clear',
      isbn: '9788381162371',
      totalPages: 320,
      currentPage: 160,
      status: 'reading',
      startDate: new Date('2025-01-15')
    },
    {
      userId: user2.id,
      title: 'Myślenie szybkie i wolne',
      author: 'Daniel Kahneman',
      isbn: '9788381162388',
      totalPages: 512,
      currentPage: 512,
      status: 'completed',
      rating: 4,
      startDate: new Date('2024-07-01'),
      finishDate: new Date('2024-08-01')
    },
    {
      userId: user2.id,
      title: 'Zero to One',
      author: 'Peter Thiel',
      isbn: '9788381162395',
      totalPages: 224,
      currentPage: 0,
      status: 'to_read'
    }
  ]).returning()

  console.log('✅ Created 10 books for user2')

  await db.insert(schema.bookCategories).values([
    { bookId: booksUser1[0].id, categoryId: createdCategories[0].id },
    { bookId: booksUser1[0].id, categoryId: createdCategories[8].id },
    { bookId: booksUser1[1].id, categoryId: createdCategories[0].id },
    { bookId: booksUser1[2].id, categoryId: createdCategories[1].id },
    { bookId: booksUser1[3].id, categoryId: createdCategories[1].id },
    { bookId: booksUser1[4].id, categoryId: createdCategories[1].id },
    { bookId: booksUser1[5].id, categoryId: createdCategories[1].id },
    { bookId: booksUser1[5].id, categoryId: createdCategories[8].id },
    { bookId: booksUser1[6].id, categoryId: createdCategories[1].id },
    { bookId: booksUser1[7].id, categoryId: createdCategories[1].id },
  ])

  await db.insert(schema.bookCategories).values([
    { bookId: booksUser2[0].id, categoryId: createdCategories[2].id },
    { bookId: booksUser2[1].id, categoryId: createdCategories[2].id },
    { bookId: booksUser2[2].id, categoryId: createdCategories[2].id },
    { bookId: booksUser2[3].id, categoryId: createdCategories[3].id },
    { bookId: booksUser2[3].id, categoryId: createdCategories[8].id },
    { bookId: booksUser2[4].id, categoryId: createdCategories[3].id },
    { bookId: booksUser2[4].id, categoryId: createdCategories[8].id },
    { bookId: booksUser2[5].id, categoryId: createdCategories[4].id },
    { bookId: booksUser2[6].id, categoryId: createdCategories[5].id },
    { bookId: booksUser2[6].id, categoryId: createdCategories[9].id },
    { bookId: booksUser2[7].id, categoryId: createdCategories[6].id },
    { bookId: booksUser2[8].id, categoryId: createdCategories[6].id },
    { bookId: booksUser2[9].id, categoryId: createdCategories[7].id },
  ])

  console.log('✅ Assigned categories to books')

  await db.insert(schema.reviews).values([
    {
      bookId: booksUser1[0].id,
      userId: user1.id,
      content: 'Niesamowita epopeja fantasy! Tolkien stworzył fascynujący świat pełen detali. Historia jest porywająca, a postacie niezapomniane.'
    },
    {
      bookId: booksUser1[3].id,
      userId: user1.id,
      content: 'Klasyka science fiction. Asimov mistrz w tworzeniu wizji przyszłości. Fascynująca koncepcja psychohistorii.'
    },
    {
      bookId: booksUser1[5].id,
      userId: user1.id,
      content: 'Przerażająca wizja totalitaryzmu, która niestety jest wciąż aktualna. Obowiązkowa lektura dla każdego.'
    },
    {
      bookId: booksUser2[0].id,
      userId: user2.id,
      content: 'Agatha Christie w najlepszym wydaniu. Świetna zagadka kryminalna z genialnym zakończeniem.'
    },
    {
      bookId: booksUser2[3].id,
      userId: user2.id,
      content: 'Piękna historia miłosna z czasów regencji. Jane Austen potrafi pisać o ludziach i ich uczuciach jak mało kto.'
    },
    {
      bookId: booksUser2[5].id,
      userId: user2.id,
      content: 'Fascynująca biografia wizjonera. Isaacson doskonale pokazuje zarówno geniusz jak i wady Jobsa.'
    },
    {
      bookId: booksUser2[8].id,
      userId: user2.id,
      content: 'Przełomowa książka o tym jak podejmujemy decyzje. Kahneman w przystępny sposób wyjaśnia skomplikowane mechanizmy naszego umysłu.'
    }
  ])

  console.log('✅ Created 7 reviews')

  await db.insert(schema.readingGoals).values([
    {
      userId: user1.id,
      year: 2024,
      targetBooks: 20,
      currentBooks: 3
    },
    {
      userId: user1.id,
      year: 2025,
      targetBooks: 25,
      currentBooks: 0
    },
    {
      userId: user2.id,
      year: 2024,
      targetBooks: 15,
      currentBooks: 4
    },
    {
      userId: user2.id,
      year: 2025,
      targetBooks: 20,
      currentBooks: 0
    }
  ])

  console.log('✅ Created 4 reading goals')

  console.log('🎉 Seeding completed successfully!')
  console.log('\n📊 Summary:')
  console.log('- Users: 3')
  console.log('- Categories: 10')
  console.log('- Books: 18')
  console.log('- Book-Category relations: 23')
  console.log('- Reviews: 7')
  console.log('- Reading Goals: 4')
  console.log('\n🔑 Test credentials:')
  console.log('Email: jan.kowalski@example.com | Password: password123')
  console.log('Email: anna.nowak@example.com | Password: password123')
  console.log('Email: admin@example.com | Password: password123')

  await connection.end()
}

seed().catch((error) => {
  console.error('❌ Seeding failed:', error)
  process.exit(1)
})