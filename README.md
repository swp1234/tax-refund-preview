# 연말정산 미리보기 - Tax Refund Preview App

2026년 연말정산 환급액을 미리 계산해보는 PWA 앱입니다.

## 기능

### 주요 기능
- **소득 입력**: 근로소득 및 기타소득 입력
- **공제액 입력**: 의료비, 교육비, 기부금, 신용카드, 주택담보이자, 연금보험료 입력
- **즉시 계산**: 예상 환급액 또는 추가납부액 즉시 계산
- **상세 내역**: 공제액 및 과세표준 상세 내역 표시

### 2026 UI/UX 트렌드
✅ **Glassmorphism 2.0** - backdrop-filter 활용한 기능적인 유리 효과
✅ **Microinteractions** - 버튼 호버, 탭 애니메이션, 부드러운 전환
✅ **Dark Mode First** - 다크모드가 기본, 라이트모드 옵션
✅ **Minimalist Flow** - 한 화면에 한 가지 작업, 충분한 여백
✅ **Progress & Statistics** - 계산 결과 상세 통계 시각화
✅ **Personalization** - LocalStorage로 입력값 자동 저장
✅ **Accessibility** - 충분한 색상 대비, 44px 이상 터치 영역

### 프리미엄 기능
- **AI 세금 절약 팁** - 광고 시청 후 맞춤 세금 절약 팁 제공
- **개인화 추천** - 입력한 소득과 공제액에 따른 맞춤 팁

### PWA 기능
- **오프라인 지원** - Service Worker로 오프라인 접근 가능
- **설치 가능** - 홈화면에 앱처럼 설치 가능
- **빠른 로딩** - 캐싱을 통한 빠른 로딩

### 광고 영역
- **상단 배너** - 반응형 광고 영역
- **하단 배너** - 반응형 광고 영역
- **인터스티셜** - 프리미엄 팁 시청 시 광고

## 기술 스택

- **HTML5** - 의미론적 마크업
- **CSS3** - Glassmorphism, Grid, Flexbox, 애니메이션
- **Vanilla JavaScript** - 프레임워크 없음
- **PWA** - Service Worker, manifest.json
- **LocalStorage** - 데이터 자동 저장

## 파일 구조

```
tax-refund-preview/
├── index.html          # 메인 HTML
├── manifest.json       # PWA 설정
├── sw.js              # Service Worker
├── css/
│   └── style.css      # 스타일 (2026 트렌드 적용)
├── js/
│   ├── app.js         # 앱 로직
│   └── tax-data.js    # 세금 계산 로직 및 팁 데이터
├── icons/             # PWA 아이콘 (추후 생성)
└── README.md          # 이 파일
```

## 세금 계산 로직

### 포함된 항목
1. **근로소득공제** - 급여액의 등급별 공제
2. **기본공제** - 1,500,000원
3. **공제액**
   - 의료비: 300만원 초과분의 15%
   - 교육비: 최대 900,000원 전액
   - 기부금: 30% 공제
   - 신용카드: 15% 소비장려금 (최대 300,000원)
   - 주택담보이자: 최대 1,500,000원 전액
   - 연금보험료: 최대 400,000원 전액

4. **산출세액** - 누진세 적용
5. **세액공제** - 근로소득세액공제 55,000원

### 2026년 기준 세율
- 1,200만원 이하: 6%
- 4,700만원 이하: 15%
- 1억원 이하: 24%
- 5억원 이하: 35%
- 초과: 38%

## 사용 방법

### 웹에서 실행
```bash
# 프로젝트 디렉토리로 이동
cd projects/tax-refund-preview

# Python 내장 서버 실행
python -m http.server 8000

# 브라우저에서 접속
http://localhost:8000
```

### 직접 열기
```bash
# Windows
start index.html

# macOS
open index.html

# Linux
xdg-open index.html
```

## 주요 특징

### Glassmorphism 2.0 구현
- `backdrop-filter: blur(10px)` 활용
- 반투명 배경 (rgba)
- 테두리와 그림자로 명확한 계층화

### Dark Mode First
- 기본값: 어두운 배경 (#0f0f1e)
- `prefers-color-scheme: light` 미디어 쿼리로 라이트모드 지원
- 2026년 트렌드에 맞춘 다크 테마

### Microinteractions
- 버튼 호버 시 scale 변환
- 버튼 클릭 시 feedbcak
- 모달 등장 애니메이션 (slideUp)
- 프리미엄 버튼의 펄스 애니메이션

### 반응형 디자인
- Mobile First 접근 (360px 이상)
- 태블릿/데스크톱 최적화
- 터치 친화적 (44px 이상 버튼)

## 색상 팔레트

| 색상 | 값 | 용도 |
|------|-------|------|
| Primary | #3742fa | 주요 요소, 버튼 |
| Accent | #ffa726 | 강조 요소 |
| Success | #26de81 | 환급액 (긍정적) |
| Warning | #ffb74d | 추가납부 (주의) |
| Danger | #fc5c65 | 에러 |
| Dark BG | #0f0f1e | 배경 |
| Light Text | #ffffff | 다크모드 텍스트 |

## 성능 최적화

- **캐싱** - Service Worker로 오프라인 지원
- **번들 최소화** - 프레임워크 없음, 순수 JS
- **이미지 최적화** - SVG 아이콘 (추후)
- **CSS 최적화** - 필요한 스타일만 로드

## 브라우저 지원

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile Safari 14+

## 주의사항

⚠️ **본 앱의 계산은 참고용입니다**
- 정확한 세금 결과는 국세청 홈택스에서 확인하세요
- 각 가정의 상황에 따라 다를 수 있습니다
- 특수한 소득/공제 항목은 포함되지 않을 수 있습니다

## 프리미엄 콘텐츠

### AI 세금 절약 팁
- 의료비, 교육비, 기부금 등 공제 최대화 방법
- 신용카드 사용으로 소비장려금 받는 법
- 배우자 소득 고려 방법
- 연금보험료와 절세의 조화

팁은 사용자 입력값에 따라 맞춤 생성됩니다.

## 설치 및 배포

### 로컬 테스트
```bash
python -m http.server 8000
```

### Google Play Store 배포 (추후)
1. Trusted Web Activity (TWA) 패키징
2. Play Store 등록
3. AdMob 통합

## 라이선스

MIT License - 자유롭게 사용 및 수정 가능

## 개발 노트

**작성일**: 2026.02.07
**버전**: 1.0.0
**상태**: 개발 완료, 테스트 진행 중

### 계획 중인 기능
- [ ] 다국어 지원 (English)
- [ ] 이전 연도 데이터 비교
- [ ] 계산 히스토리
- [ ] 공유 기능 (카카오톡, 이메일)
- [ ] 세무사 상담 연결

## 피드백

사용자 피드백은 앱 내 도움말 섹션에서 수집합니다.

---

**Made with ❤️ for Financial Freedom**
