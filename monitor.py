import json
import os
import re
from datetime import datetime, timezone
from pathlib import Path

import requests
from bs4 import BeautifulSoup

SOURCE_URL = "https://www.oschadbank.ua/currency-rate"
HISTORY_FILE = Path("history.json")
MAX_RECORDS = 5000


def get_mobile_oschad_usd():
    """Read the USD row from the first exchange-rate table on Oschadbank's page."""
    response = requests.get(
        SOURCE_URL,
        headers={"User-Agent": "Mozilla/5.0 (compatible; OschadDollarMonitor/1.0)"},
        timeout=30,
    )
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")

    for table in soup.find_all("table"):
        headers = " ".join(table.stripped_strings).lower()
        if "купівля" not in headers or "продаж" not in headers:
            continue
        for row in table.find_all("tr"):
            cells = [cell.get_text(" ", strip=True) for cell in row.find_all(["td", "th"])]
            if any(cell.upper() == "USD" for cell in cells):
                numbers = []
                for cell in cells:
                    cleaned = cell.replace(",", ".").replace(" ", "")
                    if re.fullmatch(r"\d+(?:\.\d+)?", cleaned):
                        numbers.append(float(cleaned))
                # The row is currency, code, units, buy, sell, NBU rate.
                if len(numbers) >= 4:
                    return numbers[1], numbers[2]

    raise RuntimeError(
        "Не вдалося знайти рядок USD у таблиці Ощадбанку. "
        "Можливо, структура сторінки змінилася або дані завантажуються динамічно."
    )


def send_telegram(text):
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    chat_id = os.getenv("TELEGRAM_CHAT_ID")
    if not token or not chat_id:
        print("Telegram не налаштований — пропускаю сповіщення.")
        return
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    result = requests.post(url, json={"chat_id": chat_id, "text": text}, timeout=20)
    result.raise_for_status()


def main():
    buy, sell = get_mobile_oschad_usd()
    now = datetime.now(timezone.utc).isoformat(timespec="seconds")
    records = json.loads(HISTORY_FILE.read_text(encoding="utf-8")) if HISTORY_FILE.exists() else []

    previous = records[-1] if records else None
    if previous and float(previous["buy"]) == buy and float(previous["sell"]) == sell:
        print(f"Курс не змінився: купівля {buy:.4f}, продаж {sell:.4f}. Новий запис не додаю.")
        return

    record = {
        "timestamp": now,
        "buy": buy,
        "sell": sell,
        "source": "Для Мобільного Ощаду",
        "source_url": SOURCE_URL,
    }
    records.append(record)
    records = records[-MAX_RECORDS:]
    HISTORY_FILE.write_text(
        json.dumps(records, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Збережено: купівля {buy:.4f}, продаж {sell:.4f}")

    if previous:
        message = (
            "💵 Ощадбанк — зміна курсу USD\n"
            f"Купівля: {buy:.4f} грн (було {float(previous['buy']):.4f})\n"
            f"Продаж: {sell:.4f} грн (було {float(previous['sell']):.4f})"
        )
        send_telegram(message)


if __name__ == "__main__":
    main()