// GET /api/stats — 每日瀏覽與點擊統計（匿名）
const json = o => new Response(JSON.stringify(o, null, 1), { headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } });
export async function onRequestGet({ env }){
  if (!env.REPORTS) return json({ ok: false });
  const days = {}, deals = {}, platforms = {}; let cursor;
  do {
    const r = await env.REPORTS.list({ prefix: "n:", cursor });
    for (const k of r.keys){
      const [, day, t, id] = k.name.split(":"); const n = (k.metadata && k.metadata.n) || 0; const b = (k.metadata && k.metadata.b) || "";
      days[day] = days[day] || { view: 0, buy: 0, map: 0, copy: 0 }; days[day][t] += n;
      if (t !== "view"){ deals[id] = deals[id] || { buy: 0, map: 0, copy: 0 }; deals[id][t] += n; }
      if (t === "buy"){ const p = b || "其他"; platforms[p] = (platforms[p] || 0) + n; }
    }
    cursor = r.list_complete ? null : r.cursor;
  } while (cursor);
  const total = Object.values(days).reduce((a, d) => ({ view: a.view + d.view, buy: a.buy + d.buy, map: a.map + d.map, copy: a.copy + d.copy }), { view: 0, buy: 0, map: 0, copy: 0 });
  const top = Object.entries(deals).sort((a, b) => (b[1].buy + b[1].map + b[1].copy) - (a[1].buy + a[1].map + a[1].copy)).slice(0, 20);
  return json({ ok: true, total, buyByPlatform: platforms, days, topDeals: Object.fromEntries(top) });
}
