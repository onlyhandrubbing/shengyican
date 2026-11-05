// 點擊計數暫停：KV 免費額度每天只有 1,000 次寫入，留給「回報已結束」用。
export const onRequest = () => new Response(null, { status: 204 });
