// Steam 플레이 이력 1회 덤프 → out/steam-games.json
// 사용법: .env에 STEAM_API_KEY, STEAM_ID64 넣고 `npm run steam`
// API 키: https://steamcommunity.com/dev/apikey · SteamID64: 프로필 URL 또는 steamid.io
// 프로필 프라이버시 > 게임 세부정보 = 공개여야 플레이타임이 나온다
import fs from "node:fs";

for (const line of fs.existsSync(".env") ? fs.readFileSync(".env", "utf8").split("\n") : []) {
  const m = line.match(/^(\w+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
}

const key = process.env.STEAM_API_KEY;
const id = process.env.STEAM_ID64;
if (!key || !id) throw new Error("STEAM_API_KEY / STEAM_ID64가 없다. .env에 넣을 것");

const url = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${key}&steamid=${id}&include_appinfo=1&include_played_free_games=1&format=json`;
const res = await fetch(url);
if (!res.ok) throw new Error(`Steam API ${res.status} — 키/ID/프로필 공개 설정 확인`);
const games = (await res.json()).response.games ?? [];

const out = games
  .filter((g) => g.playtime_forever > 0)
  .map((g) => ({
    name: g.name,
    appid: g.appid,
    hours: +(g.playtime_forever / 60).toFixed(1),
    lastPlayed: g.rtime_last_played
      ? new Date(g.rtime_last_played * 1000).toISOString().slice(0, 10)
      : null,
    image: `https://cdn.cloudflare.steamstatic.com/steam/apps/${g.appid}/header.jpg`,
  }))
  .sort((a, b) => b.hours - a.hours);

fs.mkdirSync("out", { recursive: true });
fs.writeFileSync("out/steam-games.json", JSON.stringify(out, null, 2));
console.log(`✅ ${out.length}개 (플레이 0h 제외) → out/steam-games.json (상위: ${out[0]?.name} ${out[0]?.hours}h)`);
