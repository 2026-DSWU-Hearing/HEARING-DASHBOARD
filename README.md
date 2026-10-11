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

- 진입 시 리플레이 모드 + `full-day` 시나리오가 선택된 상태 (자동 재생 없음)
- 단축키: `space` 재생/정지 · `1~4` 단일 시나리오 즉시 발화 · `c` 컨트롤 패널
- 실제 WebSocket 연결은 `src/pages/dashboard/apis/dashboardSocket.ts` 구현 후 활성화 예정 (v1 은 인터페이스만)
- 진동 방향 뷰는 three.js 3D 씬. 사람 흉상은 `public/models/mannequin.glb` (원본 8MB → gltf-transform 으로 간략화 + meshopt 압축 450KB). 모델을 바꾸면 `constants/neckbandScene.ts` 의 `NECKBAND_FIT` 으로 넥밴드 위치를 맞춘다

`@/` 경로 별칭은 `src/`를 가리킵니다. 자세한 구조와 규칙은 [CLAUDE.md](./CLAUDE.md), [docs/conventions.md](./docs/conventions.md)를 참고하세요.

## 브랜치 / 커밋 컨벤션

- 브랜치: `커밋타입/기능이름` (예: `setting/router-setting`, `feat/home-page`)
- 커밋: `타입: 내용` (예: `setting: Tailwind CSS 설정`)
- `main`에 직접 push 금지, 반드시 PR로 머지

## 배포

Vercel에 레포를 연결하면 `vercel.json` 설정에 따라 자동 배포됩니다. SPA 라우팅을 위해 모든 경로가 `index.html`로 rewrite 됩니다.
