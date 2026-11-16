# Монітор курсу долара Ощадбанку

Безкоштовний вебзастосунок для збереження історії курсу USD/UAH, графіка та Telegram-сповіщень.

## Як працює
- GitHub Actions запускає `monitor.py` приблизно кожні 30 хвилин.
- Скрипт читає публічну сторінку [Ощадбанку](https://www.oschadbank.ua/currency-rate).
- Якщо курс змінився, новий запис додається до `history.json`.
- Якщо налаштований Telegram, надсилається повідомлення про зміну.
- GitHub Pages показує поточні значення, історію та графік.

**Поточне джерело:** таблиця «Для Мобільного Ощаду» на сторінці Ощадбанку. Це не індивідуальний готівковий курс конкретного відділення. Курс у відділеннях може відрізнятися.

## Налаштування Telegram
У репозиторії відкрий **Settings → Secrets and variables → Actions → New repository secret** і створи:
- `TELEGRAM_BOT_TOKEN` — токен бота від BotFather;
- `TELEGRAM_CHAT_ID` — твій Telegram chat ID.

Не публікуй токен у коді, README або повідомленнях.

## Увімкнення GitHub Pages
1. Відкрий **Settings → Pages**.
2. У розділі **Build and deployment** вибери **Deploy from a branch**.
3. Branch: **main**, folder: **/(root)**.
4. Натисни **Save**.

Адреса сайту: `https://balakleyatojebalakleya-art.github.io/Ochaddollarmonitor/`.

## Ручний запуск
**Actions → Update Oschadbank exchange rate → Run workflow**.

Планувальник GitHub може запускатися із затримкою; точний запуск хвилина в хвилину не гарантується.
