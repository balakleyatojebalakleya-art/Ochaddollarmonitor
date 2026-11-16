const DATA_URL = "history.json";
let chart;
const fmt = n => Number(n).toFixed(4);
async function load() {
  const response = await fetch(DATA_URL + "?v=" + Date.now(), {cache:"no-store"});
  if (!response.ok) throw new Error("Не вдалося завантажити історію");
  const data = await response.json();
  const rows = Array.isArray(data) ? data : (data.records || []);
  if (!rows.length) { document.getElementById("updated").textContent = "Поки що даних немає. Дочекайтеся першого запуску монітора."; return; }
  const latest = rows[rows.length - 1];
  document.getElementById("buy").textContent = fmt(latest.buy);
  document.getElementById("sell").textContent = fmt(latest.sell);
  document.getElementById("updated").textContent = "Останнє оновлення: " + new Date(latest.timestamp).toLocaleString("uk-UA") + " · " + (latest.source || "Ощадбанк");
  renderTable(rows);
  renderChart(rows);
}
function renderTable(rows) {
  document.getElementById("history").innerHTML = rows.slice(-20).reverse().map(r =>
    `<tr><td>${new Date(r.timestamp).toLocaleString("uk-UA")}</td><td>${fmt(r.buy)}</td><td>${fmt(r.sell)}</td></tr>`
  ).join("");
}
function renderChart(rows) {
  const period = document.getElementById("period").value;
  const selected = period === "all" ? rows : rows.slice(-Number(period) * 48);
  const labels = selected.map(r => new Date(r.timestamp).toLocaleString("uk-UA",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}));
  const config = {type:"line",data:{labels,datasets:[
    {label:"Купівля",data:selected.map(r=>r.buy),borderColor:"#50d5a0",backgroundColor:"#50d5a0",tension:.25,pointRadius:0,borderWidth:2},
    {label:"Продаж",data:selected.map(r=>r.sell),borderColor:"#62a9ff",backgroundColor:"#62a9ff",tension:.25,pointRadius:0,borderWidth:2}
  ]},options:{responsive:true,maintainAspectRatio:false,interaction:{intersect:false,mode:"index"},plugins:{legend:{display:false}},scales:{x:{ticks:{color:"#8199af",maxTicksLimit:7},grid:{color:"#29445d"}},y:{ticks:{color:"#8199af"},grid:{color:"#29445d"}}}}};
  if(chart) chart.destroy();
  chart = new Chart(document.getElementById("chart"),config);
}
document.getElementById("period").addEventListener("change",()=>load().catch(showError));
function showError(e){document.getElementById("updated").textContent=e.message;document.getElementById("history").innerHTML='<tr><td colspan="3">Помилка завантаження даних</td></tr>';}
load().catch(showError);
if("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));