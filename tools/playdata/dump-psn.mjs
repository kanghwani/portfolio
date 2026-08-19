// PSN 플레이 이력 1회 덤프 → out/psn-games.json
// 사용법: .env에 PSN_NPSSO=<64자 토큰> 넣고 `npm run psn`
// NPSSO 발급: playstation.com 로그인 → https://ca.account.sony.com/api/v1/ssocookie
import fs from "node:fs";
import {
  exchangeNpssoForAccessCode,
  exchangeAccessCodeForAuthTokens,
  getUserPlayedGames,
} from "psn-api";

for (const line of fs.existsSync(".env") ? fs.readFileSync(".env", "utf8").split("\n") : []) {
  const m = line.match(/^(\w+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
}

const npsso = process.env.PSN_NPSSO;
if (!npsso) throw new Error("PSN_NPSSO가 없다. .env에 넣을 것");

const accessCode = await exchangeNpssoForAccessCode(npsso);
const auth = await exchangeAccessCodeForAuthTokens(accessCode);

const titles = [];
for (let offset = 0; ; ) {
  const page = await getUserPlayedGames(auth, "me", { limit: 200, offset });
  titles.push(...page.titles);
  if (titles.length >= page.totalItemCount) break;
  offset = titles.length;
}

// playDuration은 ISO8601 (예: PT450H30M12S) → 시간 단위 숫자로
const hoursOf = (iso) => {
  const m = iso?.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/) ?? [];
  return +((+m[1] || 0) + (+m[2] || 0) / 60 + (+m[3] || 0) / 3600).toFixed(1);
};

const out = titles
  .filter((t) => t.category?.includes("game")) // media_app(Netflix 등) 제외
  .map((t) => ({
    name: t.name,
    platform: t.category,
    hours: hoursOf(t.playDuration),
    playCount: t.playCount,
    firstPlayed: t.firstPlayedDateTime?.slice(0, 10) ?? null,
    lastPlayed: t.lastPlayedDateTime?.slice(0, 10) ?? null,
    image: t.imageUrl ?? null,
  }))
  .sort((a, b) => b.hours - a.hours);

fs.mkdirSync("out", { recursive: true });
fs.writeFileSync("out/psn-games.json", JSON.stringify(out, null, 2));
console.log(`✅ ${out.length}개 타이틀 → out/psn-games.json (상위: ${out[0]?.name} ${out[0]?.hours}h)`);
