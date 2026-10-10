# HEARING-DASHBOARD

Hear:ing (청각장애인 대상 PWA 웹앱) 발표용 대시보드

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
| `pnpm format`    | Prettier 포맷팅          |

## 폴더 구조

```
project-root
├── public
│   └── icons
└── src
    ├── layout    # 공통 레이아웃 컴포넌트
    ├── pages     # 라우팅 페이지 (communication / home / livesound / setting)
    │   └── home
    │       ├── apis · components · constants · hooks · types · utils
    ├── routes    # 라우팅 설정
    └── shared    # 전역 공통 코드
        ├── apis · assets · components · constants · hooks
        ├── stores · styles · types · utils
```

`@/` 경로 별칭은 `src/`를 가리킵니다. 자세한 구조와 규칙은 [CLAUDE.md](./CLAUDE.md), [docs/conventions.md](./docs/conventions.md)를 참고하세요.

## 브랜치 / 커밋 컨벤션

- 브랜치: `커밋타입/기능이름` (예: `setting/router-setting`, `feat/home-page`)
- 커밋: `타입: 내용` (예: `setting: Tailwind CSS 설정`)
- `main`에 직접 push 금지, 반드시 PR로 머지

## 배포

Vercel에 레포를 연결하면 `vercel.json` 설정에 따라 자동 배포됩니다. SPA 라우팅을 위해 모든 경로가 `index.html`로 rewrite 됩니다.
