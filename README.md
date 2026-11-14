# 한번만 프론트엔드

가까운 이웃의 전자제품을 빌리거나 미개봉 생활용품을 거래하는 웹 프로토타입이다. 예산 안에서 제품을 고르고 문고리로 수령·반납하는 흐름을 확인할 수 있다.

**기술 스택** · TypeScript 5.9.3, Vite 7.2.2, HTML, CSS

## 로컬 실행

Node.js와 npm이 필요하다. Front 저장소 루트에서 실행한다.

```sh
npm ci
npm run dev
```

Vite가 출력한 주소를 열면 서비스 소개에서 시작한다. 기본 포트는 `5173`이다. 서버를 종료하려면 터미널에서 `Ctrl+C`를 누른다.

## 첫 화면에서 거래까지

1. 서비스 소개에서 시작해 로그인, 약관 동의, 동네 인증, 결제수단과 권한 안내를 진행한다.
2. 예산을 선택하고 제품 목록을 연다. 전자제품을 고르면 사용 기간을 바꾸고 요청을 보낼 수 있다.
3. 문고리 수령과 반납 화면에서 각각 사진을 선택한다. 반납 확인 후 **후기 남기기**로 후기를 작성할 수 있다.

## 구현된 기능

| 기능 | 주요 화면 | 동작 |
| --- | --- | --- |
| 온보딩 | O1–O10 | 서비스 소개, 시연 로그인, 약관, 동네 설정·인증, 결제수단·권한 안내 |
| 예산과 제품 | 01–03 | 예산 선택, 제품 목록·상세, 트랙별 필터와 사용 기간 선택 |
| 수령과 반납 | 04–06 | 수령·반납 사진 미리보기, 완료 안내와 후기 입력 |
| 거래와 등록 | T1–T9 | 거래 요청·수락, 문고리 사진, 반납 확인, 물건 등록과 품목 기준 |
| 마이와 채팅 | M1–M3, C1–C2 | 내 거래 필터, 경험 항목 선택, 알림 팝오버, 채팅과 읽음 표시 |
| 공통 상태 | 제품 목록과 거래 화면 | 화면별 스켈레톤, 요청 로딩 모달, 오류 토스트 |

## 코드 구조

```text
src/
├── api/             HTTP 클라이언트, 제품 목록·상세, Mock
├── constants/       예산과 한국어 표시 설정
├── prototype/
│   ├── main.ts       화면 라우팅과 요청 연결
│   ├── onboarding.ts 온보딩과 약관 흐름
│   ├── budget.ts     예산 선택
│   ├── core.ts       제품 목록·상세, 수령과 반납
│   ├── trades.ts     거래와 물건 등록
│   ├── community.ts  마이와 채팅
│   ├── loading.ts    화면 스켈레톤
│   └── request-feedback.ts  요청 로딩과 토스트
├── styles/          Figma 색상 토큰
├── types/           공통 API, 제품·거래 타입
└── utils/           원화와 한국 시간 포맷
public/
├── figma/           화면 이미지와 아이콘
└── fonts/           한글 글꼴
```

## 환경 설정과 연동 범위

기본 실행은 Mock 제품 데이터를 사용한다. 실제 제품 목록·상세를 확인하려면 Back `main`을 [로컬 프로필로 실행](https://github.com/MEDILUXx-xUMC/Back#로컬-실행)한 뒤 Front의 `.env.example`을 `.env.local`로 복사하고 Vite를 재시작한다.

| 환경 변수 | 로컬 설정 예시 | 사용 범위 |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `http://127.0.0.1:8080/api/v1` | 제품 목록 `GET /products`, 상세 `GET /products/{productId}` |

Back 로컬 서버는 `localhost:5173`과 `127.0.0.1:5173`을 허용한다. 실제 API 오류는 화면과 토스트에서 확인할 수 있다. 로그인, 결제, 거래 상태 변경, 사진 업로드, 채팅은 프론트의 Mock으로 동작한다. 입력한 사진은 탭을 새로고침하면 초기화된다. [FE·BE API 계약](https://github.com/MEDILUXx-xUMC/Back/blob/main/docs/API_CONTRACT.md)

## 빌드와 협업

```sh
npm run typecheck
npm run build
npm run preview
```

`npm run build`는 타입 검사와 배포용 파일 생성을 실행한다. `npm run preview`는 생성된 파일을 로컬에서 확인할 때 사용한다.

- [FE 협업 규칙](docs/CONTRIBUTING.md)
- [프로젝트 구조와 작업 순서](docs/PROJECT_SETUP.md)
- [온보딩 구현 기록](docs/ONBOARDING_IMPLEMENTATION.md)
- [Figma 와이어프레임](https://www.figma.com/design/VlY2DYbl9vd53axgyePbqR/한번만?node-id=0-1)
