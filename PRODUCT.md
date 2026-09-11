# Product

<!-- impeccable:product-schema 1 -->

## Platform

web — 기본 공개 경로는 `/v2/3d/`

## Stack

정적 HTML/CSS/JS (GitHub Pages 배포 전제, 빌드 도구 없음). 루트는 `v2/3d/` 개발 포트폴리오로 연결된다. 구 매뉴얼형 개발판과 기획·QA 트랙은 보존되어 있다.

## Users

1순위는 Unity 클라이언트 개발자 채용담당자와 기술면접관입니다. 서류를 검토하며 30초에서 3분 정도 링크를 봅니다. 기획·QA 페이지는 해당 직무의 채용담당자가 봅니다.

## Product Purpose

김강환의 취업용 포트폴리오입니다. 부트캠프는 2026년 8월에 수료했습니다. 채용담당자가 직접 규칙을 설계하고 검증하는 개발자라는 점을 확인하고 면접을 제안하면 목적을 달성합니다.

## Positioning

첫 화면에서 IDLE CITY의 RoutePlanner 통행 배정, 팀 기여 424/752, 테스트와 벤치마크를 보여줍니다. 프로젝트 설명에는 가능한 한 코드, 측정 수치, 플레이 링크를 함께 둡니다. 플레이 기록은 PSN·Steam API 덤프를 바탕으로 작성합니다.

## Operating Context

- 원본 진실: LLM_WIKI `output/portfolio/2026-portfolio-page.md`(마스터 문서)·`wiki/career/*`와 동기화. 수치는 `personal-profile.md` 확정값만 사용
- 플레이 데이터: `tools/playdata/` 덤프 → `assets/play-data.js` (재실행 가능)
- 현재: 2026-09-11 개발·QA·기획 3트랙 범용 제출 베이스 정리. 스마일게이트 QA는 본인 결정으로 미지원 종료(카제나 플레이 의향 없음·1개월 단기 근무). 지원 현황의 단일 기준은 Notion 포트폴리오 마스터. 펄어비스 기획은 08-23 지원 포기, 111%는 08-31 서류 탈락.
- 2026-09-09: 개발 디자인 먼저 푸시, QA 검증 작업실 전면 개편, 기획은 모델 보존·테마 동기화. 세 트랙 공통 토큰은 workspace-tokens.css.
- QA: BUG-001 08-05·1.16.03 5/5 기록과 08-01·1.14.00 초기 영상(Mv_pikEhHic, 00:30)을 구분. BUG-004 1회 관측, ISSUE-003 명세 질의, BUG-002 미승격 관찰. 카제나 미실행 초안은 준비 중단으로 현재 공개판에서 제외. 원인 추정과 실제 확인을 분리.
- 제출용 9종 원고: LLM_WIKI `output/portfolio/2026-09-11/`. PDF는 동일 날짜 `output/pdf/`에서 생성. 로컬 생성과 업로드·공유 확인을 구분하며 휴대전화 포함 이력서는 임의 공개하지 않는다.

## Capabilities and Constraints

- 프로젝트 3개: IDLE CITY(간판, 5인 팀·기획 선정·교통 시뮬레이션 코어) / PARRYWAY(개인, 13일·회귀 테스트 160개·플레이 가능) / Molten Arena(2인 팀)
- 이미지 자산: `assets/idle-city.jpg`, `assets/molten-arena.jpg`. GIF 슬롯(hilt-before-after, freeflow-streak, hitstop, takoyaki)은 **미제작** — onerror로 숨김 처리 중. 게임 카드 이미지: Steam은 CDN header.jpg 사용 가능, PSN은 덤프에 imageUrl 있음
- 수치 규칙: 측정 조건 없는 수치 금지, 자기신고 항목 부풀리기 금지 (위키 마스터 규칙)

## Brand Commitments

- **말투: 전면 ~합니다체 (2026-08-18 확정, 08-17 문어체 전환을 뒤집음)**
- 서사 금지 규칙: 시간순 일대기·감성 서사·네거티브 도입 금지 (08-18 강의 + 펄어비스 탈락 회고). 계보는 "취향 일관성의 증거"로만
- 이름·연락처: 김강환 · zzangh91@naver.com · github.com/kanghwani · blog.naver.com/zzangh91

## Evidence on Hand

- 플레이 데이터: `assets/play-data.js` (PSN 106 + Steam 6 + Xbox/Switch 수기 8, 1,972h, 2026-08-18 덤프+08-19 수기)
- 플레이 영상: IDLE CITY https://youtu.be/6rCe-v5Aewk · PARRYWAY https://youtu.be/FNGmbfAQ0nI · Molten Arena https://youtu.be/rlZltzKGEIY
- 블로그 69편 발행 실적
- 없음(조작 금지): 상용 출시작, 다운로드 수치, 수상(게임 분야)

## Product Principles

1. 주장을 쓰면 바로 옆에 수치, 링크, 데이터를 둡니다.
2. 첫 화면에서 개발 직무와 대표 프로젝트를 확인할 수 있어야 합니다.
3. 위키의 원본 수치와 웹에 적힌 수치를 함께 갱신합니다.
4. 플레이, 소스, 영상은 한 번의 클릭으로 열 수 있어야 합니다.
