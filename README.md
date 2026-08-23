# 김강환 · 포트폴리오

**https://kanghwani.github.io/portfolio/**

Unity 클라이언트 개발자 포트폴리오. 「박스 소프트웨어 매뉴얼」을 형식으로 삼은 정적 사이트입니다.
장(章)마다 원색 색판을 깔고 그 위에 반투명 리프를 얹는 구조로, 시스템을 문서화하는 방식 자체를 형식으로 보여주려 했습니다.

## 구성

| 경로 | 내용 |
|---|---|
| `/` | 개발 트랙 — IDLE CITY 교통 시뮬레이션 코어, Molten Arena |
| `/design/` | 기획 트랙 — 붉은사막 전투 시스템 기획서 (명세 복원 · 데이터 시뮬레이터 · 반증 조건) |
| `/qa/` | QA 트랙 — 붉은사막 결함 리포트와 테스트 설계 |
| `/111/` | 지원처별 제출본 (기술 포트폴리오 · PDF 출력용) |

## 만든 방식

- 빌드 도구·프레임워크 없음. HTML + CSS + 바닐라 JS
- `assets/manual.css` · `assets/manual.js`를 네 볼륨이 공유합니다.
  각 페이지가 정하는 것은 마크업의 `data-c`(색판 번호) · `data-title` · `data-sum`뿐입니다
- 리프의 투명도는 손으로 고르지 않습니다. 색판 명도에 맞춰 대비가 목표 밴드에 들도록
  런타임에 이분 탐색해 `--leaf-a`로 발행합니다
- 플레이 기록은 PSN·Steam API를 1회 덤프한 정적 데이터입니다 (`tools/playdata/`)

## PDF 출력

`/111/`은 인쇄를 전제로 만들었습니다. 한 장(章)이 한 페이지가 되고, 목차는 실제 앵커라 PDF 안에서도 눌러 이동합니다.

```bash
python3 -m http.server 8899          # 저장소 루트에서
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless \
  --no-pdf-header-footer --print-to-pdf=out.pdf \
  --virtual-time-budget=9000 http://localhost:8899/111/
```

## 연락처

zzangh91@naver.com · [블로그](https://blog.naver.com/zzangh91) · [GitHub](https://github.com/kanghwani)
