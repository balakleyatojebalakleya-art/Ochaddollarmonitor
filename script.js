const DATA_URL = "history.json";
let chart = null;
const fmt = value => Number(value).toFixed(4);

async function load() {
  const status = document.getElementById("updated");
  try {
    const response = await fetch(DATA_URL + "?v=" + Date.now(), { cache: "no-store" });
    if (!response.ok) throw new Error("HTTP " + response.status + " під час завантаження history.json");
    const data = await response.json();
    const rows = Array.isArray(data) ? data : (data.records || []);
    if (!rows.length) { status.textContent = "Історія поки порожня. Запустіть Update Oschadbank exchange rate у GitHub Actions."; return; }
    const latest = rows[rows.length - 1];
    document.getElementById("buy").textContent = fmt(latest.buy);
    document.getElementById("sell").textContent = fmt(latest.sell);
    status.textContent = "Останнє оновлення: " + new Date(latest.timestamp).toLocaleString("uk-UA") + " · " + (latest.source || "Ощадбанк");
    renderTable(rows);
    if (typeof window.Chart === "undefined") {
      const canvas = document.getElementById("chart");
      if (canvas) canvas.style.display = "none";
      status.textContent += " · Графік тимчасово недоступний";
      return;
    }
    renderChart(rows);
  } catch (error) {
    status.textContent = "Помилка завантаження: " + error.message;
    document.getElementById("history").innerHTML = '<tr><td colspan="3">Не вдалося завантажити дані</td></tr>';
  }
}

function renderTable(rows) {
  document.getElementById("history").innerHTML = rows.slice(-20).reverse().map(row =>
    "<tr><td>" + new Date(row.timestamp).toLocaleString("uk-UA") + "</td><td>" + fmt(row.buy) + "</td><td>" + fmt(row.sell) + "</td></tr>"
  ).join("");
}

function renderChart(rows) {
  const period = document.getElementById("period").value;
  const selected = period === "all" ? rows : rows.slice(-Number(period) * 48);
  const labels = selected.map(row => new Date(row.timestamp).toLocaleString("uk-UA", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }));
  const config = { type: "line", data: { labels, datasets: [
    { label: "Купівля", data: selected.map(row => row.buy), borderColor: "#50d5a0", tension: 0.25, pointRadius: 0, borderWidth: 2 },
    { label: "Продаж", data: selected.map(row => row.sell), borderColor: "#62a9ff", tension: 0.25, pointRadius: 0, borderWidth: 2 }
  ] }, options: { responsive: true, maintainAspectRatio: false, interaction: { intersect: false, mode: "index" }, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: "#8199af", maxTicksLimit: 7 }, grid: { color: "#29445d" } }, y: { ticks: { color: "#8199af" }, grid: { color: "#29445d" } } } } };
  if (chart) chart.destroy();
  chart = new window.Chart(document.getElementById("chart"), config);
}

document.getElementById("period").addEventListener("change", load);
load();
if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));