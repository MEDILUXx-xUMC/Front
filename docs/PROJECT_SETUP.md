# FE 프로젝트 초기 구조

TypeScript 공통 모듈은 웹 표준인 `fetch`, `URLSearchParams`, `Intl`을 사용한다. 팀이 프레임워크, 라우터와 대상 플랫폼을 결정한 뒤 앱 진입점과 화면을 추가한다. 현재 검사는 Node.js와 npm을 사용한다.

```powershell
npm ci
npm run typecheck
```

```text
Front/
  package.json
  tsconfig.json
  src/
    api/
      client.ts       공통 HTTP 요청과 오류
      products.ts     제품 목록·상세 함수와 호출 인터페이스
      mocks/          같은 인터페이스를 구현하는 Mock
    constants/        한국어 표시 설정과 Figma 예산 표시값
    styles/           Figma 색상 토큰
    types/            API 공통 형식, 제품과 거래 타입
    utils/            원화와 한국 시간 표시
  docs/
    PROJECT_SETUP.md
```

| 나중에 추가할 경로 | 배치 기준 |
| --- | --- |
| `src/components/ui/` | 여러 흐름에서 쓰는 Button, Chip, Tag와 공통 UI |
| `src/features/<feature>/` | 제품 탐색, 거래, 온보딩, 프로필, 채팅 등 기능별 상태와 전용 컴포넌트 |
| 앱 진입점과 화면 파일 | 프레임워크와 라우터의 규칙을 따르고, 작업 목록에는 Figma 번호와 화면명을 유지 |

## 같이 쓰는 값과 API 사용법

- 색상은 Figma `Design System`의 `Colors/Primary`와 `Colors/Gray`에 표시된 값을 `tokens.css`에 옮겼다. 웹 앱 진입점에서 한 번 불러온다. Button, Chip, Tag의 상태와 속성은 공통 UI 담당자가 사용처를 확인하고 정한다.
- `budgetDisplay`의 1만 원, 5만 원, 100만 원은 Figma 01에 보이는 값이다. 선택 단계와 초기값은 합의 후 정한다. 100만 원 이상 선택이 필터 해제를 뜻하는지는 API 계약 확인 사항이다.
- 원화는 `formatWon`, 시간대가 있는 시각은 `formatDateTime`을 사용한다. 달력 날짜는 API의 `YYYY-MM-DD` 값을 그대로 다루고 표시 단계에서 연·월·일을 변환한다.
- 앱 초기화 시 `createApiClient(baseUrl)`에 환경별 API 주소를 주입한다. 계약 초안의 주소 예시는 `http://localhost:8080/api/v1`이다. `createProductsApi(request)`와 `mockProductsApi`는 같은 `ProductsApi` 인터페이스를 구현한다. 앱이 사용할 구현을 진입점에서 정한다.
- 제품 API의 정상 목록, 예산 밖 빈 배열, 존재하지 않는 제품 오류를 Mock으로 확인할 수 있다. 상품·거래 타입은 API 초안과 함께 변경한다. TypeScript 타입은 서버 응답의 런타임 검증을 대신하지 않는다.
- 인증 방식이 정해지면 앱 초기화와 공통 요청 계층에 연결한다. 환경값에 API 공개 주소만 두고 결제 비밀값이나 서버 자격 증명은 BE 환경에서 관리한다.

## 시작할 작업의 순서

1. 공통 코드와 API 문서를 FE·BE 담당자가 함께 리뷰한다. FE 두 명이 플랫폼, 프레임워크, 라우터와 공통 UI 담당자를 정한다.
2. 예산·제품 쪽과 거래 쪽에서 공통으로 필요한 API 타입과 디자인 토큰을 먼저 병합한다. 온보딩·프로필·채팅은 Figma 화면별로 담당과 선행 계약을 작업 목록에 연결한다.
3. 기능마다 Back의 API 문서를 갱신한 뒤 Mock으로 화면을 연결한다. 실서버로 전환할 때 빈 결과, 만료 또는 권한 오류, 정상 응답을 같은 호출부에서 확인한다.

[Figma 와이어프레임](https://www.figma.com/design/VlY2DYbl9vd53axgyePbqR/%ED%95%9C%EB%B2%88%EB%A7%8C?node-id=87-44) · [Figma 색상](https://www.figma.com/design/VlY2DYbl9vd53axgyePbqR/%ED%95%9C%EB%B2%88%EB%A7%8C?node-id=84-2)
