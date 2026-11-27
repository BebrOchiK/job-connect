# JOB CONNECT

- `src/App.tsx`, `nginx.conf`, `.dockerignore`, `Dockerfile` — клієнтський застосунок на React + TypeScript + Vite, що збирається у багатоетапному `Dockerfile` та віддається через `nginx` (з проксуванням `/api/` на `http://job-backend:3000/api/`).
- `backend/server.js`, `backend/Dockerfile` — HTTP-сервер на Node.js (порт `3000`), який обробляє запити `GET /api/jobs` і `POST /api/jobs` та надсилає події в сервіс аналітики.
- `analytics/server.js`, `analytics/Dockerfile` — сервіс аналітики на Node.js (порт `4000`), який приймає події на `POST /events` і повертає статистику на `GET /stats`.

---

## Мережева архітектура

1. **`job-frontend-net` (`bridge`)** — з'єднує `job-frontend` та `job-backend`.
   - Фронтенд звертається до бекенду за DNS-іменем `job-backend` (порт `3000`)
   - Сервіс аналітики не підключений до цієї мережі, тому інтерфейс не має прямого мережевого шляху до аналітичного сервісу.
2. **`job-backend-net` (`bridge`)** — з'єднує `job-backend` та `job-analytics`.
   - Бекенд передає події перегляду та створення вакансій на `http://job-analytics:4000/events` у виділеній мережі.
   - `job-frontend` не входить до `job-backend-net`, тому не може звертатися до `job-analytics` напряму.

```text
[Браузер: localhost:8080]
           │ (-p 8080:80)
           ▼
    job-frontend  ──(job-frontend-net, DNS: job-backend:3000)──►  job-backend
                                                                        │
                                      (job-backend-net, DNS: job-analytics:4000)
                                                                        ▼
                                                                  job-analytics