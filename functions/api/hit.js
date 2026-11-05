// POST /api/hit {t, id, b} — 匿名計數：瀏覽次數與按鈕點擊（不記錄 IP 或任何個人資料）
const TYPES = ["view", "buy", "map", "copy"];
export async function onRequestPost({ request, env }){
  if (!env.REPORTS) return new Response(null, { status: 204 });
  let j = {}; try { j = await request.json(); } catch {}
  const t = String(j.t || ""); if (!TYPES.includes(t)) return new Response(null, { status: 204 });
  const id = t === "view" ? "-" : String(j.id || "").slice(0, 80);
  if (t !== "view" && !/^[\w-]+$/.test(id)) return new Response(null, { status: 204 });
  const day = new Date(Date.now() + 8 * 3600e3).toISOString().slice(0, 10);
  const key = "n:" + day + ":" + t + ":" + id;
  const cur = await env.REPORTS.getWithMetadata(key);
  const n = Number(cur.value || 0) + 1;
  const b = String(j.b || "").slice(0, 20);
  await env.REPORTS.put(key, String(n), { expirationTtl: 400 * 86400, metadata: { n, b } });
  return new Response(null, { status: 204 });
}
export const onRequest = () => new Response(null, { status: 405 });
