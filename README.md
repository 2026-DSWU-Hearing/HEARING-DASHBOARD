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

발표 시연 중 청중용 모니터에 띄우는 페이지입니다. 네비게이션에 노출되지 않으며 URL로 직접 접근합니다.

- 로그인(refresh 토큰)이 남아 있으면 라이브, 아니면 리플레이 모드 + `full-day` 시나리오로 시작 (자동 재생 없음)
- 단축키: `space` 재생/정지(리플레이) · `1~4` 단일 시나리오 즉시 발화(두 모드 모두, 라이브에선 비상용) · `c` 컨트롤 패널

### 라이브 연결

1. 컨트롤 패널(`c`) → **라이브** → 구글 로그인. 넥밴드의 현재 사용자(앱에서 [기기 연결]을 누른 계정)와 같은 구글 계정이어야 감지가 온다
2. 연결: `/ws/users/me/detections?token=` WebSocket (`detection` · `detection_filtered`), 현재 모드 · 연결 · 배터리 · 이름은 `GET /modes` · `GET /devices` · `GET /users/me` 를 5초마다 폴링
3. access 토큰 만료(60분)는 `/auth/refresh` 로 자동 갱신, 재접속은 지수 백오프(1→30초). 로그아웃하면 리플레이로 돌아간다
4. 주소는 `VITE_API_BASE_URL`(기본: dev `http://localhost:8000`, 빌드 `https://hearing-api.duckdns.org`), 로그인은 `VITE_GOOGLE_CLIENT_ID`(기본값은 앱과 같은 클라이언트)
5. 배포 전 요청할 것: 백엔드 `.env` `CORS_ORIGINS` 에 대시보드 도메인 추가, 구글 OAuth 클라이언트 "승인된 JavaScript 원본"에 대시보드 도메인 추가
6. 필터링 장면(`detection_filtered`)은 백엔드 `handle_detection` 에 브로드캐스트가 들어가면 자동으로 표시된다 (프론트는 준비됨)

### 3D 흉상 대신 2D 도식이 보일 때

- three.js 는 **WebGL 2** 가 필요하다. 카드 좌하단 캡션이 원인을 알려준다 (`WebGL 2 없음` 등)
- Chrome/Edge: 설정 → 시스템 → "가능한 경우 그래픽 가속 사용" 켜고 재시작. `chrome://gpu` 에서 `WebGL2: Hardware accelerated` 확인
- 원격 데스크톱 · 가상 머신 · 구형 GPU 드라이버에선 WebGL 2 가 꺼져 있을 수 있다 → 시연은 실물 노트북의 최신 Chrome 으로
- `?view=3d` 는 사전 검사를 건너뛰고 3D 를 강제 시도, `?view=2d` 는 항상 도식 (리허설 비교용)

- 진동 방향 뷰는 three.js 3D 씬. 사람 흉상은 `public/models/mannequin.glb` (원본 8MB → gltf-transform 으로 간략화 + meshopt 압축 450KB). 모델을 바꾸면 `constants/neckbandScene.ts` 의 `NECKBAND_FIT` 으로 넥밴드 위치를 맞춘다

`@/` 경로 별칭은 `src/`를 가리킵니다. 자세한 구조와 규칙은 [CLAUDE.md](./CLAUDE.md), [docs/conventions.md](./docs/conventions.md)를 참고하세요.

## 브랜치 / 커밋 컨벤션

- 브랜치: `커밋타입/기능이름` (예: `setting/router-setting`, `feat/home-page`)
- 커밋: `타입: 내용` (예: `setting: Tailwind CSS 설정`)
- `main`에 직접 push 금지, 반드시 PR로 머지

## 배포

Vercel에 레포를 연결하면 `vercel.json` 설정에 따라 자동 배포됩니다. SPA 라우팅을 위해 모든 경로가 `index.html`로 rewrite 됩니다.
