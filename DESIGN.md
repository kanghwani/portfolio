---
name: 김강환 포트폴리오 — 사용자 매뉴얼
description: 박스 소프트웨어 매뉴얼 — 원색 색판 디바이더 위 밀크 아세테이트 리프, 포어엣지 탭 레일
colors:
  ink: "#191714"
  ink-soft: "#3A362F"
  milk: "#F6F3EC"
  vermilion-errata: "#E4372E"
  board-1-oxide-orange: "#C7501A"
  board-2-chrome-yellow: "#EFC200"
  board-3-grass-green: "#3F9636"
  board-4-teal: "#0F8578"
  board-5-ultramarine: "#2743B0"
  board-6-violet: "#6C3FA6"
  board-7-sienna: "#8A5730"
typography:
  display:
    fontFamily: "Pretendard Variable, Pretendard, -apple-system, Apple SD Gothic Neo, sans-serif"
    fontSize: "clamp(38px, 5.4vw, 58px)"
    fontWeight: 800
    lineHeight: 1.08
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Pretendard Variable, Pretendard, -apple-system, Apple SD Gothic Neo, sans-serif"
    fontSize: "34px"
    fontWeight: 800
    lineHeight: 1.15
  title:
    fontFamily: "Pretendard Variable, Pretendard, -apple-system, Apple SD Gothic Neo, sans-serif"
    fontSize: "21px"
    fontWeight: 800
    lineHeight: 1.3
  subtitle:
    fontFamily: "Pretendard Variable, Pretendard, -apple-system, Apple SD Gothic Neo, sans-serif"
    fontSize: "16.5px"
    fontWeight: 700
  body:
    fontFamily: "Noto Serif KR, Apple SD Gothic Neo, serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: "26px"
  label:
    fontFamily: "ui-monospace, SF Mono, JetBrains Mono, D2Coding, Menlo, monospace"
    fontSize: "13px"
    fontWeight: 400
    letterSpacing: "0.14em"
rounded:
  none: "0"
  tab-outer: "3px 0 0 3px"
  punch: "50%"
spacing:
  board-y: "72px 0 96px"
  bed-gutter: "44px"
  bed-col-gap: "40px"
  leaf-pad: "40px 46px 44px 58px"
  leaf-gap: "34px"
  section-head-gap: "38px"
  list-gap: "13px"
components:
  button-playmore:
    backgroundColor: "{colors.milk}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "9px 18px"
  input-search:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "7px 12px"
  chip-spec:
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "3px 10px"
  chip-lineage:
    backgroundColor: "rgba(255,255,255,.55)"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "4px 12px"
  card-play:
    backgroundColor: "rgba(255,255,255,.94)"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
---

# Design System: 김강환 포트폴리오 — 사용자 매뉴얼

> **경계(boundary): 이 시스템은 세 볼륨 전체를 규정한다 (2026-08-21 확장).**
> `index.html`(제1권 개발) · `design/`(제2권 시스템 기획서) · `qa/`(제3권 QA 검수 보고서)는
> 한 권의 매뉴얼 시리즈이고 같은 색판 휠·아세테이트 리프·포어엣지 탭을 공유한다.
> 구현도 공유한다 — `assets/manual.css`(디자인 시스템)와 `assets/manual.js`(색판/리프/레일 런타임)를
> 세 페이지가 함께 읽는다. **스타일을 페이지에 복사하지 말고 이 두 파일을 고친다.**
> 페이지가 스스로 정하는 것은 마크업의 `data-c`(색판) · `data-no`(표시 번호) · `data-title` · `data-sum`,
> `body[data-book]`(각주 이름), 그리고 그 볼륨에만 있는 인터랙션 스크립트뿐이다.

## Overview

**Creative North Star: "박스 소프트웨어 사용자 매뉴얼"**

취업 포트폴리오를 90년대 잡지 번들 CD 시절의 인쇄 매뉴얼로 만든 세계다. 화면 전체가
장(章)마다 다른 원색 색지 디바이더(board)이고, 읽기 면은 그 위에 얹힌 반투명 밀크
아세테이트 리프다. 리프의 알파는 디자이너가 고르지 않는다 — 런타임 이분 탐색이 색판
명도에 맞춰 풀어서 `--leaf-a`로 발행한다. 다크 그라운드+카드 그리드라는 개발자 포폴
기본형을 거부하고, "시스템을 문서화하는 개발자"를 형식 자체로 증명한다.

물성은 전부 인쇄물의 것이다: 판 전체에 feTurbulence 인쇄 그레인 한 겹, 리프 제본변의
펀치홀 2개(구멍 사이로 색판이 비친다), 절단변의 단일 경질 그림자, 오른쪽 포어엣지의
7단 인덱스 탭 레일. 디지털 장치(블러, 그라데이션, ease 곡선, 유리 효과)는 존재하지
않는다. 모든 변화는 90ms `steps(2)` — 힌지가 두 단으로 꺾이는 소리다.

**Key Characteristics:**
- 장 = 풀 채도 원색 색판, 화면 전체가 그 장의 색
- 읽기 면 = 런타임에 알파를 푸는 밀크 아세테이트 리프 (펀치홀 2 + 경질 포어엣지 그림자)
- 버밀리언(#E4372E)은 정오표(errata) 전용
- 세리프 본문(17/26) · 산세리프 표제(800) · 모노 기계음의 3성부
- 모서리 반경 0 (예외: 펀치홀 원, 탭 바깥 모서리 3px)
- 모션은 90ms steps(2,end)뿐, ease 없음

## Colors

7색 원색 휠이 장을 나누고, 잉크·밀크 2색이 인쇄를 담당하며, 버밀리언 하나가 정정을 맡는다.

### Primary — 색판 휠 (board wheel)
장 순서대로 하나씩 배정되며 코드가 `data-c` 인덱스로 칠한다. 색판은 배경 전용이 아니라
그 장의 펀치홀 색(`--board-c`)과 포어엣지 탭 색(`--tab-c`)까지 겸한다.
- **산화주황** (#C7501A): 제1장 표지. 파비콘·OG의 브랜드 색이기도 하다.
- **크롬옐로** (#EFC200): 제2장. 명도가 높아 표제 잉크가 `data-head="dark"`로 뒤집힌다.
- **풀색** (#3F9636): 제3장.
- **틸** (#0F8578): 제4장.
- **울트라마린** (#2743B0): 부록 A.
- **바이올렛** (#6C3FA6): 부록 B.
- **시에나** (#8A5730): 판권. `html` 캔버스 배경도 이 색 — 오버스크롤 여분을 마지막 색판이 잇는다.

### Secondary
- **버밀리언** (#E4372E): 정오표 블록 전용. 텍스트는 #FFF7F2. 다른 어떤 용도로도 쓰지 않는다.

### Neutral
- **잉크** (#191714): 본문 텍스트, 1.5px 보더, 레일 배경, 스크롤바 트랙, 포커스 아웃라인, 선택 영역 배경.
- **소프트 잉크** (#3A362F): 메타·캡션·각주 등 모노 보조 텍스트.
- **밀크** (#F6F3EC): 어두운 색판 위 표제 잉크, 버튼 지면, 스크롤바 썸. 리프 자체는 밀크가 아니라 `rgba(255,255,255,--leaf-a)`다.

### Named Rules
**정오표 규칙 (The Errata Rule).** 버밀리언은 `.errata` 블록에서만 산다. 강조·링크·경고 등 다른 표면에 새면 정정의 신뢰가 죽는다.

**풀 채도 색판 규칙 (The Full-Strength Board Rule).** 색판은 절대 틴트하지 않는다. 가독성은 색판을 연하게 해서가 아니라 리프 알파를 풀어서 얻는다.

**풀린 알파 규칙 (The Solved-Alpha Rule).** 리프 알파는 손으로 고르지 않는다. 런타임이 흰 리프를 색판 위에 합성한 상대 명도가 목표 밴드(코드는 L≈0.83으로 수렴, clamp 0.55–0.97)에 들도록 이분 탐색하고 `--leaf-a`로 발행한다. 표제 잉크도 같은 명도 판정(L>0.45 → dark)으로 뒤집힌다. 새 색판을 추가하면 값을 적지 말고 휠에 넣기만 하면 된다.

## Typography

**Display Font:** Do Hyeon (표제 전용 — h1·장 표제·리프 h3, 90년대 인쇄 고딕 결. 2026-08-19 교체)
**UI/Heads Font:** Pretendard Variable (h4·버튼·카드명 등 소형 UI)
**Body Font:** Gowun Batang 17/27 (Apple SD Gothic Neo, serif 폴백. 2026-08-19 Noto Serif KR에서 교체)
**Label/Mono Font:** ui-monospace 스택 (SF Mono · JetBrains Mono · D2Coding · Menlo)

**Character:** 매뉴얼의 3성부. 세리프가 본문을 읽어 주고, 검은 산세리프(800)가 표제를
찍고, 모노가 페이지 번호·측정치·캡션 같은 기계음을 낸다. 표제는 `-0.01em`부터 조인다.

### Hierarchy
- **Display** (800, clamp(38px, 5.4vw, 58px)/1.08, -0.02em): 표지 제품명(h1) 전용.
- **Headline** (800, 34px/1.15): 리프 안 장 제목(h3).
- **Title** (800, 21px/1.3): 색판 여백 단의 장 표제(chap h2). 잉크는 `--head-ink`(명도 판정).
- **Subtitle** (700, 16.5px, 상단 1.5px 잉크 괘선 + padding-top 12px): 리프 안 절 표제(h4). 괘선이 절을 가른다.
- **Body** (400, 17px/26px): 세리프 본문. 산문 블록은 `.measure`로 최대 640px.
- **Label/Mono** (400, 11–13.5px, 자간 0.06–0.22em): 장 번호(MANUAL 02), 페이지 범위, 메타, 캡션, 사양표, 시수. 숫자 강조는 mono 700.

### Named Rules
**기계음 규칙 (The Machine-Voice Rule).** 측정치·날짜·페이지·플랫폼 등 "기록"은 전부 모노로 찍는다. 세리프 본문 안 강조는 `strong`(600)뿐이다.

**640 조판폭 규칙 (The Measure Rule).** 산문은 640px(리스트 660px)을 넘지 않는다. 리프가 넓어도 글줄은 매뉴얼 판형을 지킨다.

## Layout

세로로 쌓인 색판의 연속이 책 한 권이다. 각 색판(`.board`)은 상하 72/96px 패딩과
오른쪽 `--rail-w`(58px) 여백을 갖고, 안쪽 `.bed`는 max-width 1040px, 좌우 44px 패딩,
`200px + minmax(0,1fr)` 2열 그리드(열 간격 40px)다. 왼쪽 열은 색판 위에 직접 인쇄되는
장 표제(`.chap`, sticky top 26px), 오른쪽 열이 아세테이트 리프다. 리프 내부 패딩은
40/46/44/58px — 왼쪽이 넓은 것은 제본변(펀치홀 자리)이기 때문이다.

포어엣지 탭 레일은 `position:fixed`로 화면 오른쪽 전체 높이를 차지하며, 탭 높이는
장 분량에 비례(`flex: max(1, round(높이/600))`)한다. 현재 장의 탭은 `margin-left:0`으로
돌출하고 펀치 점이 찍힌다.

반응형은 900px 한 곳에서 꺾인다: 2열 → 1열, chap sticky 해제, 레일 34px, 리프 패딩
축소, 카드 그리드 minmax 196→150px. 카드 그리드는 `auto-fill minmax`로 스스로 단을
줄인다(4단→2단→1단). `scroll-behavior:auto` — 스크롤도 ease하지 않는다.

## Elevation & Depth

그림자는 실물 두께의 증거 하나뿐이다. **모든 그림자는 x축 단일 경질 오프셋
(`Npx 0 0`), 블러 0, 잉크 rgba(25,23,20,.28–.3)** — 리프 절단변이 색판에 드리우는
포어엣지 그림자다. 그 외 깊이는 전부 재질로 낸다: 리프의 반투명 알파(색판이 비침),
펀치홀의 `inset` 미세 그림자(종이에 뚫린 구멍), 판 전체의 feTurbulence 인쇄 그레인
(`.board::after`, 240px 타일, opacity .3, mix-blend-mode overlay, z-index 3 —
색판과 리프 위에 함께 한 겹).

### Shadow Vocabulary
- **리프 포어엣지** (`box-shadow: 6px 0 0 rgba(25,23,20,.28)`): 아세테이트 리프 절단변. 상시.
- **정오표** (`4px 0 0 rgba(25,23,20,.3)`): errata 쪽지. 상시.
- **카드 호버** (`5px 0 0 rgba(25,23,20,.3)` + `translate(-2px,-2px)`): 플레이 카드가 들리는 상태.
- **버튼** (`3px 0 0 rgba(25,23,20,.3)`, 호버 시 `4px` + `translate(-1px,-1px)`): playmore 버튼.

### Named Rules
**단일 절단변 규칙 (The One-Edge Rule).** 그림자는 항상 오른쪽 x축 하드 오프셋 하나. y 오프셋, 블러, 다중 그림자, 앰비언트 글로우는 이 세계에 없다.

**힌지 규칙 (The Hinge Rule).** 움직이는 것은 transform과 box-shadow뿐이고, 타이밍은 전부 `90ms steps(2,end)`(`--step`)다. ease·spring·fade 금지. `prefers-reduced-motion`이면 전부 끈다.

## Shapes

모서리 반경 0의 재단된 인쇄물. 리프·카드·버튼·입력·사양표·칩 전부 직각이며, 획은
1.5px 잉크 실선(사양 박스만 2px)이 표준이다. 원은 딱 두 곳 — 제본변 펀치홀
(15px, `border-radius:50%`, 배경이 색판 색)과 현재 탭의 펀치 점(8px)이다. 곡률은 딱
한 곳 — 인덱스 탭의 바깥 모서리 `3px 0 0 3px`. 정오표 쪽지만 `-0.5deg` 기울어
붙어 있다(끼워 넣은 정정지의 물성). 리스트 불릿은 인쇄 딩벳 `▸`.

## Components

### 아세테이트 리프 (signature)
- **재질:** `rgba(255,255,255,var(--leaf-a))` — 알파는 런타임 해법(Colors 참조).
- **제본변:** `::before/::after` 펀치홀 2개, left 16px, 15px 원, 배경 `--board-c`, `inset 1px 1px 1px rgba(25,23,20,.35)`.
- **절단변:** 포어엣지 그림자 `6px 0 0 rgba(25,23,20,.28)`.
- **패딩:** 40px 46px 44px 58px, 리프 사이 34px.

### 포어엣지 탭 레일 (Navigation)
- **구조:** fixed right, 폭 58px(모바일 34px), 잉크 지면 위 세로 flex. 탭은 색판 색 지면 + 세로쓰기 모노 라벨(11px, 자간 .18em), 탭 사이 2px 잉크 괘선, 바깥 모서리 3px.
- **평시/현재:** 평시 `margin-left:14px`(들어감), 현재 장은 `margin-left:0`으로 돌출 + 왼쪽 8px 잉크 펀치 점. 판정은 스크롤 y + 뷰포트 35% 지점.
- **탭 높이:** 장 분량 비례. 클릭은 즉시 점프(`scrollIntoView`, smooth 아님).

### 정오표 (signature)
- **스타일:** 버밀리언 지면, #FFF7F2 모노 12.5px/1.65, 패딩 10px 14px, `-0.5deg` 회전, 그림자 4px 하드, max-width 560px.
- **용도:** 데이터의 구멍·정정 사실을 숨기지 않고 적는 자리. 장식 아님.

### 플레이 카드 (Cards)
- **모양:** 직각, 1.5px 잉크 보더, 지면 `rgba(255,255,255,.94)`, 아트 16:9(잉크 지면, 없으면 모노 "NO RECORD ART").
- **내용:** 산세리프 제목 700 (2줄 클램프) + 모노 시수 19px 700 + 모노 플랫폼·기간 11px.
- **호버:** `translate(-2px,-2px)` + 그림자 5px, `--step` 타이밍, transform-origin left center.

### 버튼 (playmore)
- **모양:** 밀크 지면, 1.5px 잉크 보더, 직각, 패딩 9px 18px, 산세리프 15px 700, 그림자 3px 하드.
- **호버:** `translate(-1px,-1px)` + 그림자 4px, `--step`.

### 입력 (검색)
- **모양:** 투명 지면, 1.5px 잉크 보더, 직각, 패딩 7px 12px, 산세리프 15px. 플레이스홀더는 소프트 잉크.
- **포커스:** 전역 `:focus-visible` — 2.5px 잉크 아웃라인, offset 2px. 글로우 없음.

### 칩 (specrow / lineage)
- **사양 칩:** 모노 12.5px, 1.5px 잉크 보더, 투명 지면, 패딩 3px 10px, 간격 7px.
- **계보 칩:** 산세리프 13.5px 600, `rgba(255,255,255,.55)` 지면, 같은 보더.

### 사양표 (spec-box)
- 2px 잉크 외곽 보더, 내부 1px 괘선, 모노 13.5px, 좌열 44%/우열 700. 매뉴얼 뒤표지 사양표의 물성.

### 그림 (figure)
- 이미지 1.5px 잉크 보더, 캡션은 모노 12.5px 소프트 잉크, "그림 N-M ·" 번호 체계.

### 부록 컴포넌트 (제2·3권)
기획서·검수 보고서가 쓰는 부품. 전부 `assets/manual.css`의 「부록 컴포넌트」 절에 있다.
- **근거 칩** (`.src`): 관찰=잉크 채움(`.obs`), 가정=테두리만(`.asm`). 색이 아니라 **잉크량**으로 가른다.
- **판정 마크**: `.pass`→`○`, `.fail`→`✕`(700), `.blk`→`—`(소프트 잉크). 초록/빨강을 쓰지 않는다.
- **주(註)** (`.note`): 1.5px 잉크 보더 + 반투명 밀크 지면, `::before`로 "주(註)" 모노 라벨.
- **조사 기록** (`.case`) · **결정 로그** (`.dlog`) · **연혁** (`.glog`): 잉크 머리띠 + 1px 괘선 2열 기입란. `.del`은 취소선, `.add`는 600.
- **등급 칩** (`.grade span.down`): 심각도를 스스로 내린 기록은 **잉크 채움 도장**으로 찍는다.
- **표** (`table.t`): 2px 외곽 · 1px 괘선 · 잉크 지면 모노 헤더 — 사양표(`.spec-box`)와 같은 물성.
- **실습 부품** (`.ibtn`/`.fsm-r`/`.ctl` 슬라이더/`.gauge`): 버튼은 밀크+3px 하드 그림자, 선택은 잉크 반전. 슬라이더 썸은 **직각 잉크 막대**, 게이지 목표창은 **45° 해칭**(틴트 금지).

### Named Rules (부록)
**경고=정오표 규칙.** 제2권 시뮬레이터의 설계 규칙 위반 메시지는 별도 경고색을 만들지 않고 `.errata`(버밀리언)로 찍는다.
「지금 이 값은 규칙을 벗어났다」는 곧 정정 고지이므로 정오표의 용도 안이다. 그 밖의 강조는 여전히 버밀리언을 쓰지 않는다.

## Do's and Don'ts

### Do:
- **Do** 새 장을 추가할 때 색판 휠에 색만 등록하라 — 리프 알파와 표제 잉크는 런타임이 푼다(`--leaf-a`, `data-head`).
- **Do** 모든 그림자를 `Npx 0 0 rgba(25,23,20,.28–.3)` 하드 x오프셋으로 통일하라.
- **Do** 모든 전환에 `var(--step)`(90ms steps(2,end))만 쓰고, 움직이는 속성은 transform·box-shadow로 한정하라.
- **Do** 기록·측정치·메타는 모노로, 산문은 세리프 17/27·640px 조판폭으로, 대표제는 Do Hyeon(단일 웨이트), 소형 표제·UI는 Pretendard 700–800으로 찍어라.
- **Do** 보더는 1.5px 잉크 실선을 기본으로 하라 (외곽 강조만 2px).
- **Do** 데이터의 공백은 숨기지 말고 버밀리언 정오표로 적어라.

### Don't:
- **Don't** 버밀리언을 정오표 밖에서 쓰지 마라.
- **Don't** ease·spring·smooth scroll·fade를 넣지 마라 — 이 세계는 steps(2)로만 꺾인다.
- **Don't** 블러 그림자·y오프셋 그림자·다중 그림자·글로우를 만들지 마라.
- **Don't** 색판을 틴트하거나 리프 알파를 하드코딩하지 마라 — 알파는 풀리는 값이다.
- **Don't** 모서리를 둥글리지 마라 (허용 예외: 펀치홀·펀치 점의 원, 탭 바깥 모서리 3px).
- **Don't** 그라데이션·유리(backdrop-filter)·사진 배경을 쓰지 마라 — 재질은 색지·아세테이트·그레인뿐이다.
- **Don't** 하위 볼륨에 새 색을 들이지 마라 — Pass/Fail·등급·근거 구분은 전부 잉크의 채움/괘선으로 낸다.
- **Don't** 스타일을 페이지 안에 복사하지 마라 — 세 볼륨은 `assets/manual.css` 한 장을 읽는다.
