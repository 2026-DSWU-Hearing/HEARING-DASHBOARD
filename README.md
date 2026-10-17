# HEARING-DASHBOARD

Hear:ing 프로젝트 발표용 대시보드

## 기술 스택

| 영역            | 라이브러리                            |
| --------------- | ------------------------------------- |
| 빌드            | Vite 8 + React 19 + TypeScript        |
| 스타일          | Tailwind CSS v4 (`@tailwindcss/vite`) |
| 서버 상태       | TanStack Query v5                     |
| 클라이언트 상태 | Zustand                               |
| HTTP            | Axios                                 |
| 린트 / 포맷     | oxlint, Prettier                      |
| 배포            | Vercel                                |

## 시작하기

```bash
pnpm install
cp .env.example .env   # VITE_API_BASE_URL 설정
pnpm dev
```

## 스크립트

| 명령어           | 설명                     |
| ---------------- | ------------------------ |
| `pnpm dev`       | 개발 서버 실행           |
| `pnpm build`     | 타입체크 + 프로덕션 빌드 |
| `pnpm preview`   | 빌드 결과 미리보기       |
| `pnpm lint`      | oxlint 실행              |
| `pnpm typecheck` | tsc 타입체크             |
| `pnpm test`      | vitest 단위 테스트       |
| `pnpm format`    | Prettier 포맷팅          |

## 폴더 구조

```
project-root
├── public
│   └── icons
└── src
    ├── layout    # 공통 레이아웃 컴포넌트
    ├── pages     # 라우팅 페이지 (communication / dashboard / home / livesound / setting)
    │   └── home
    │       ├── apis · components · constants · hooks · types · utils
    ├── routes    # 라우팅 설정
    └── shared    # 전역 공통 코드
        ├── apis · assets · components · constants · hooks
        ├── stores · styles · types · utils
```

## 시연용 대시보드 (`/dashboard`)

발표 시연 중 청중용 모니터에 띄우는 페이지입니다. 루트(`/`)로 들어가면 `/dashboard` 로 이동합니다 (배포: https://hearing-dashboard-fe.vercel.app).

- 로그인(refresh 토큰)이 남아 있으면 라이브, 아니면 리플레이 모드 + `full-day` 시나리오로 시작 (자동 재생 없음)
- 단축키: `space` 재생/정지(리플레이) · `1~5` 단일 시나리오 즉시 발화(두 모드 모두, 라이브에선 비상용) · `c` 컨트롤 패널
  - `1` 경적(긴급 · 뒤) · `2` 사이렌(긴급 · 왼쪽) · `3` 안내방송(서버 · 앞) · `4` 화재경보(긴급 · 오른쪽) · `5` 개 짖음(필터링 · 왼쪽, 리플레이 전용 — 이번 시연 제외라 `full-day` 순서에는 없음)

### 라이브 연결

1. 컨트롤 패널(`c`) → **라이브** → 구글 로그인. 넥밴드의 현재 사용자(앱에서 [기기 연결]을 누른 계정)와 같은 구글 계정이어야 감지가 온다
2. 연결: `/ws/users/me/detections?token=` WebSocket (`detection` · `detection_filtered` · `mode_changed`), 현재 모드 · 연결 · 배터리 · 이름 · 장애 유형(난청인/농인)은 `GET /modes` · `GET /devices` · `GET /users/me` 를 각 1.5초 폴링. 백엔드가 `mode_changed` 를 보내면 폴링을 기다리지 않고 즉시 반영
3. access 토큰 만료(60분)는 `/auth/refresh` 로 자동 갱신, 재접속은 지수 백오프(1→30초). 로그아웃하면 리플레이로 돌아간다
4. 주소는 `VITE_API_BASE_URL`(기본 `https://hearing-api.duckdns.org`, 로컬 백엔드는 `http://localhost:8000` 지정), 로그인은 `VITE_GOOGLE_CLIENT_ID`(기본값은 앱과 같은 클라이언트)
5. 배포 전 요청할 것: 백엔드 `.env` `CORS_ORIGINS` 에 대시보드 도메인 추가, 구글 OAuth 클라이언트 "승인된 JavaScript 원본"에 대시보드 도메인 추가
6. 필터링 장면(`detection_filtered`)과 모드 즉시 반영(`mode_changed`)은 백엔드가 그 메시지를 보내야 표시된다. **현재 배포 백엔드에는 미반영**(HEARING-BE PR #33, 시연 후 재검토) — 그래서 라이브에서는 모드에 없는 소리가 들려도 아무 표시가 없고, 모드 변경은 1.5초 폴링으로 반영된다. 프론트 코드는 준비돼 있어 백엔드가 보내기 시작하면 바로 동작한다

### 3D 흉상 대신 2D 도식이 보일 때

- three.js 는 **WebGL 2** 가 필요하다. 카드 좌하단 캡션이 원인을 알려준다 (`WebGL 2 없음` 등)
- Chrome/Edge: 설정 → 시스템 → "가능한 경우 그래픽 가속 사용" 켜고 재시작. `chrome://gpu` 에서 `WebGL2: Hardware accelerated` 확인
- 원격 데스크톱 · 가상 머신 · 구형 GPU 드라이버에선 WebGL 2 가 꺼져 있을 수 있다 → 시연은 실물 노트북의 최신 Chrome 으로
- `?view=3d` 는 사전 검사를 건너뛰고 3D 를 강제 시도, `?view=2d` 는 항상 도식 (리허설 비교용)

- 진동 방향 뷰는 three.js 3D 씬. 사람 흉상은 `public/models/mannequin.glb` (원본 8MB → gltf-transform 으로 간략화 + meshopt 압축 450KB). 모델을 바꾸면 `constants/neckbandScene.ts` 의 `NECKBAND_FIT` 으로 넥밴드 위치를 맞춘다
- 그 GLB 를 못 가져오거나 meshopt 디코더(WASM)가 막힌 환경에서는 번들에 내장된 같은 모델의 저폴리곤판(`src/pages/dashboard/assets/mannequinLowPoly.glb`, 160KB, 1.6만 삼각형)이 대신 뜬다. 재생성: `pnpm dlx @gltf-transform/cli optimize <원본.glb> mannequinLowPoly.glb --compress quantize --simplify-ratio 0.035 --simplify-error 0.002 --texture-compress false` (meshopt · draco 압축은 쓰지 않는다)

`@/` 경로 별칭은 `src/`를 가리킵니다. 자세한 구조와 규칙은 [CLAUDE.md](./CLAUDE.md), [docs/conventions.md](./docs/conventions.md)를 참고하세요.

## 브랜치 / 커밋 컨벤션

- 브랜치: `커밋타입/기능이름` (예: `setting/router-setting`, `feat/home-page`)
- 커밋: `타입: 내용` (예: `setting: Tailwind CSS 설정`)
- `main`에 직접 push 금지, 반드시 PR로 머지

## 배포

Vercel에 레포를 연결하면 `vercel.json` 설정에 따라 자동 배포됩니다. SPA 라우팅을 위해 모든 경로가 `index.html`로 rewrite 됩니다.
