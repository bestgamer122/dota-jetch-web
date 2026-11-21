# DOTA JETCH

Трекер и аналитика матчей Dota 2: разбор матчей через OpenDota, профиль игрока через STRATZ,
дневник, прогресс, мини-игры, достижения и лидерборд.

Сайт статический: `index.html` + `css/` + `js/`, без сборки. Синхронизация — Firebase
(Auth + Realtime Database).

## Структура

```
index.html          разметка каркаса (сайдбар, топбар, палитра, модалки)
css/style.css       дизайн-система и все компоненты
css/lite.css        облегчённый режим
js/config.js        Store, темы, apiGet
js/sync.js          синхронизация с Firebase: очередь, UID-изоляция, статус
js/auth.js          Firebase Auth, вход, ники, аватары (ES-модуль)
js/app.js           роутер, навигация, палитра ⌘K, главная
js/*.js             страницы и игровая логика
functions/          Cloud Functions: проверка результатов, прокси API
tests/              автотесты (node:test + headless Chrome)
types/              декларации глобалов для редактора и tsc
tools/serve.mjs     локальный статический сервер
```

## Команды

```bash
npm run serve             # локальный сервер на http://127.0.0.1:8080
npm test                  # юнит-тесты и тесты серверной логики
npm run test:e2e          # проверка страниц в headless Chrome
npm run typecheck         # проверка деклараций (проходит)
npm run typecheck:strict  # строгая проверка JS — текущий остаток в docs/TYPESCRIPT.md
```

`npm test` и `npm run test:e2e` работают **без установки зависимостей** — только Node 20+.
Для `test:e2e` нужен установленный Chrome или Edge (путь можно задать через `CHROME_PATH`).

`npm run typecheck` требует `npm install` (TypeScript). В репозитории `node_modules`
не хранится — он в `.gitignore`.

## Развёртывание

Сайт публикуется как статические файлы. При изменении JS/CSS поднимайте `?v=` в `index.html`,
иначе браузеры останутся на кэше.

Серверная часть описана в [docs/FUNCTIONS.md](docs/FUNCTIONS.md),
план перехода на TypeScript — в [docs/TYPESCRIPT.md](docs/TYPESCRIPT.md).
