# BookTracker - Aplikacja do Śledzenia Progresu Czytania

## Opis projektu

BookTracker to nowoczesna aplikacja webowa umożliwiająca użytkownikom śledzenie postępów w czytaniu książek. Użytkownicy mogą dodawać książki do swojej biblioteki, aktualizować postęp czytania, oceniać przeczytane książki oraz przeglądać statystyki swojego czytania.

### Główne funkcjonalności

- **Zarządzanie kontem użytkownika**: Rejestracja, logowanie, zarządzanie profilem
- **Biblioteka książek**: Dodawanie, edycja, usuwanie książek
- **Śledzenie progresu**: Aktualizacja aktualnej strony, procent ukończenia
- **Statusy czytania**: Do przeczytania, Czytam, Przeczytane, Porzucone
- **Oceny i recenzje**: Ocenianie książek w skali 1-5 gwiazdek, dodawanie recenzji
- **Kategorie**: Organizacja książek według gatunków
- **Statystyki**: Dashboard z wykresami postępów
- **Cele czytelnicze**: Ustawianie celów miesięcznych/rocznych
- **Wyszukiwanie**: Filtrowanie i sortowanie biblioteki

## Technologie

### Backend
- **Nuxt 4** - Full-stack framework Vue.js z obsługą API routes
- **PostgreSQL** - Relacyjna baza danych
- **Drizzle ORM** - Typesafe ORM dla TypeScript
- **JWT** - Autoryzacja i uwierzytelnianie
- **Bcrypt** - Hashowanie haseł
- **Zod** - Walidacja danych

### Frontend
- **Vue 3** (Composition API) - Reaktywny framework UI
- **Nuxt UI** - Biblioteka komponentów
- **TypeScript** - Typowanie statyczne
- **Tailwind CSS 4** - Utility-first CSS framework

### Uzasadnienie wyboru technologii

1. **Nuxt 4** - Najnowsza wersja frameworka oferująca SSR, API routes w jednym projekcie, co upraszcza deployment i development
2. **PostgreSQL** - Stabilna, wydajna baza relacyjna z doskonałym wsparciem dla złożonych zapytań
3. **Drizzle ORM** - Lekki, typesafe ORM idealny dla TypeScript, szybszy niż Prisma
4. **Nuxt UI** - Gotowe komponenty z doskonałym UX, responsywne out-of-the-box
5. **JWT** - Standardowe rozwiązanie dla stateless authentication w aplikacjach SPA

## Wymagania

- Node.js 20.x lub wyższy
- PostgreSQL 14.x lub wyższy
- pnpm 8.x lub wyższy

## Instalacja i uruchomienie

### 1. Sklonuj repozytorium

```bash
git clone https://github.com/twoj-username/booktracker.git
cd booktracker
```

### 2. Zainstaluj zależności

```bash
pnpm install
```

### 3. Konfiguracja bazy danych

Utwórz bazę danych PostgreSQL:

```bash
createdb booktracker
```

Skopiuj plik `.env.example` do `.env` i uzupełnij dane:

```bash
cp .env.example .env
```

Edytuj `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/booktracker"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"
```

### 4. Migracje bazy danych

```bash
pnpm db:push
```

### 5. Seed bazy danych (opcjonalne)

Wypełnienie bazy danymi testowymi (30+ rekordów):

```bash
pnpm db:seed
```

### 6. Uruchomienie aplikacji

#### Development mode:

```bash
pnpm dev
```

Aplikacja będzie dostępna pod adresem: `http://localhost:3000`

#### Production build:

```bash
pnpm build
pnpm preview
```

## Struktura projektu

```
booktracker/
├── server/
│   ├── api/                    # API endpoints
│   │   ├── auth/              # Autentykacja
│   │   ├── books/             # Zarządzanie książkami
│   │   ├── categories/        # Kategorie
│   │   ├── reading-goals/     # Cele czytelnicze
│   │   └── stats/             # Statystyki
│   ├── middleware/            # Middleware (auth)
│   ├── services/              # Logika biznesowa
│   ├── utils/                 # Funkcje pomocnicze
│   └── db/                    # Konfiguracja bazy danych
│       ├── schema.ts          # Schemat Drizzle
│       ├── migrations/        # Migracje
│       └── seed.ts            # Dane testowe
├── pages/                     # Strony aplikacji
│   ├── index.vue             # Strona główna
│   ├── login.vue             # Logowanie
│   ├── register.vue          # Rejestracja
│   ├── dashboard.vue         # Dashboard użytkownika
│   ├── books/                # Zarządzanie książkami
│   └── profile.vue           # Profil użytkownika
├── components/               # Komponenty Vue
├── composables/              # Composables Vue
├── types/                    # Typy TypeScript
├── app.vue                   # Root component
├── nuxt.config.ts           # Konfiguracja Nuxt
└── drizzle.config.ts        # Konfiguracja Drizzle
```

## API Endpoints

### Autentykacja
- `POST /api/auth/register` - Rejestracja użytkownika
- `POST /api/auth/login` - Logowanie
- `POST /api/auth/logout` - Wylogowanie
- `GET /api/auth/me` - Pobranie danych zalogowanego użytkownika

### Książki
- `GET /api/books` - Lista książek użytkownika
- `GET /api/books/:id` - Szczegóły książki
- `POST /api/books` - Dodanie książki
- `PUT /api/books/:id` - Aktualizacja książki
- `DELETE /api/books/:id` - Usunięcie książki
- `PATCH /api/books/:id/progress` - Aktualizacja progresu

### Kategorie
- `GET /api/categories` - Lista kategorii
- `POST /api/categories` - Dodanie kategorii (admin)

### Statystyki
- `GET /api/stats` - Statystyki użytkownika

### Cele czytelnicze
- `GET /api/reading-goals` - Lista celów
- `POST /api/reading-goals` - Utworzenie celu
- `PUT /api/reading-goals/:id` - Aktualizacja celu

## Dokumentacja API

Pełna dokumentacja API dostępna jest pod adresem `/api/docs` (Swagger UI) po uruchomieniu aplikacji w trybie development.

## Baza danych

### Model ERD

Aplikacja wykorzystuje 6 tabel:

1. **users** - Użytkownicy systemu
2. **books** - Książki w bibliotece
3. **categories** - Kategorie/gatunki książek
4. **book_categories** - Relacja wiele-do-wielu (książki-kategorie)
5. **reading_goals** - Cele czytelnicze użytkowników
6. **reviews** - Recenzje książek

Szczegółowy diagram ERD dostępny w pliku `docs/ERD.md`

### Normalizacja

Baza danych jest znormalizowana do 3NF:
- Każda tabela ma klucz główny
- Wszystkie kolumny zależą funkcyjnie od klucza głównego
- Brak przechodnich zależności funkcyjnych

## Konwencje commitów

Projekt używa Conventional Commits:

- `feat:` - Nowa funkcjonalność
- `fix:` - Poprawka błędu
- `docs:` - Dokumentacja
- `style:` - Formatowanie kodu
- `refactor:` - Refaktoryzacja
- `test:` - Testy
- `chore:` - Inne zmiany

Przykład: `feat: add book progress tracking`

## Role użytkowników

- **user** - Standardowy użytkownik (może zarządzać swoimi książkami)
- **admin** - Administrator (może zarządzać kategoriami, moderować treści)

## Testing

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e
```

## Deployment

Aplikacja może być wdrożona na:
- Vercel (recommended dla Nuxt)
- Netlify
- Railway
- Digital Ocean

## Licencja

MIT

## Autorzy

- Sebastian Ślęzak - Initial work
