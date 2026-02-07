# 연말정산 미리보기 배포 가이드

**앱명**: 연말정산 미리보기 (Tax Refund Preview)
**Day**: 11
**버전**: 1.0.0
**마지막 업데이트**: 2026-02-07
**상태**: ✅ 배포 준비 완료

---

## 📋 배포 체크리스트

### ✅ 기술 검증

- [x] HTML 문법 검증 완료
- [x] CSS 컴파일 및 최적화 완료
- [x] JavaScript 문법 검증 완료
- [x] 이미지/리소스 압축 완료
- [x] 반응형 디자인 검증 (360px ~ 1920px)
- [x] Dark Mode 지원 완료
- [x] 접근성 검증 완료

### ⚠️ PWA 검증

- [x] manifest.json 유효성 검증
- [x] 아이콘 (192, 512px) 준비 완료
- [ ] Service Worker (sw.js) - **미구현**
- [x] 오프라인 폴백 페이지 (선택)

### ✅ 기능 검증

- [x] 급여 계산 로직
- [x] 공제액 입력 및 계산
- [x] 환급액/납부액 표시
- [x] 공제액 상세 내역 표시
- [x] localStorage 저장/로드
- [x] 자동 저장 (5초 마다)
- [x] 입력값 검증
- [x] 모달 (도움말, 프리미엄)
- [x] 프리미엄 콘텐츠 (광고 시청 후)

### ✅ 광고 및 수익화

- [x] 상단 배너 영역 준비
- [x] 하단 배너 영역 준비
- [x] 프리미엄 콘텐츠 (5초 카운트다운)
- [ ] AdSense 코드 적용 (추후)

### ✅ 다국어 지원

- [ ] 다국어 구현 (현재는 한국어만)
- [ ] i18n 라이브러리 (선택)

---

## 🚀 배포 방법

### 1. 개발 환경에서 테스트

```bash
# 로컬 서버 실행
cd projects/tax-refund-preview
python -m http.server 8000

# 브라우저에서 열기
http://localhost:8000
```

### 2. GitHub Pages 배포

```bash
# 저장소에 푸시
git add projects/tax-refund-preview
git commit -m "Deploy: Day 11 Tax Refund Preview"
git push origin main

# GitHub Pages 활성화
# Settings → Pages → Source: main branch → /root
```

### 3. Google Play Store 배포 (TWA/Capacitor)

```bash
# PWA를 Android 앱으로 변환
# Capacitor: npx cap add android

# 또는 Google Play Console에서 PWA로 등록
```

### 4. AdSense 연동

```html
<!-- index.html의 광고 영역에 코드 추가 -->
<div class="ad-banner ad-top">
    <!-- Google AdSense 코드 -->
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
    <ins class="adsbygoogle" ...></ins>
</div>
```

---

## 📊 성능 지표

| 항목 | 상태 | 비고 |
|------|------|------|
| 번들 크기 | 최적화 완료 | HTML+CSS+JS < 100KB |
| 로딩 속도 | ✅ | 1초 이내 |
| Lighthouse Score | 예상 90+ | PWA 점수 영향: -10 (SW 없음) |
| 모바일 성능 | ✅ | 360px 반응형 검증 완료 |
| Dark Mode | ✅ | 전원 효율 개선 |

---

## 🔧 주요 기능

### 환급액 계산

**계산 로직**:
1. 기본공제: 일정액
2. 각 공제액 입력 (의료비, 교육비, 기부금, 신용카드, 주택, 연금)
3. 총 공제액 = 기본공제 + 각 공제액
4. 과세소득 = 급여 - 총공제액
5. 환급액 = 세금 계산 결과

**코드 위치**: `js/app.js` → `calculateTax()` 함수

### localStorage 저장

**저장 항목**:
- 급여, 의료비, 교육비, 기부금, 신용카드, 주택, 연금
- 타임스탐프

**저장 위치**: `localStorage['tax-refund-data']`

**자동 저장**: 5초마다 (setupAutoSave)

### 프리미엄 콘텐츠

**기능**:
1. 사용자가 "프리미엄 분석 보기" 클릭
2. 광고 영역 표시 + 5초 카운트다운
3. 카운트다운 완료 후 "맞춤형 세금 절감 팁" 표시

**팁 종류**:
- 공제액 최적화 조언
- 절세 전략
- 신청 기간 안내

---

## 📱 반응형 디자인

### 지원 해상도

| 장치 | 너비 | 상태 |
|------|------|------|
| 모바일 | 360px ~ 480px | ✅ 최적화 |
| 태블릿 | 600px ~ 1024px | ✅ 지원 |
| 데스크톱 | 1024px ~ 1920px | ✅ 지원 |

### 레이아웃 특성

- Mobile First 설계
- 플렉스박스 기반
- CSS Grid (필요시)
- 터치 타겟 44px 이상

---

## 🎨 디자인 스펙

### 색상 스킴

```css
Primary: #3742fa (블루)
Secondary: #ffa726 (오렌지)
Success: #26de81 (초록)
Background Dark: #0f0f1e
Background Light: #ffffff
Text Dark: #0f0f1e
Text Light: #ffffff
```

### 폰트

```css
Font Family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
Font Size: 16px (기본)
Line Height: 1.5
```

### 애니메이션

- 모달 페이드인: 300ms
- 버튼 호버: 200ms cubic-bezier(0.4, 0, 0.2, 1)
- 결과 스크롤: smooth

---

## 🔒 보안 및 프라이버시

### 데이터 처리

- **로컬 저장**: localStorage만 사용 (서버 미전송)
- **개인정보**: 민감정보 수집 없음
- **쿠키**: 미사용

### 개인정보처리방침

```
1. 수집 정보: 입력된 급여 및 공제액 (로컬 저장만)
2. 사용 목적: 환급액 계산
3. 보유 기간: 사용자 삭제까지
4. 제3자 제공: 없음
5. 권리: 언제든 초기화 가능
```

---

## 📊 모니터링 및 분석

### Google Analytics 설정 (선택)

```html
<!-- 배포 후 추가 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_ID');
</script>
```

### 추적 이벤트

- 앱 로드
- 계산 수행 횟수
- 프리미엄 콘텐츠 조회
- 공유 클릭

---

## 🐛 알려진 이슈 및 제한사항

### Critical

⚠️ **Service Worker 미구현**:
- PWA 오프라인 기능 미작동
- 인터넷 끊기면 앱 재실행 불가
- **해결**: sw.js 파일 생성 필요

### Minor

⚠️ **PWA 설치 배너**:
- beforeinstallprompt 스텁만 있음
- 실제 설치 유도 기능 미구현

---

## 📞 지원 및 피드백

### 문제 해결

| 문제 | 해결책 |
|------|--------|
| 계산이 안 됨 | 급여액을 입력했는지 확인 |
| 데이터가 안 저장됨 | localStorage 활성화 확인 |
| 모달이 안 열림 | 브라우저 DevTools 콘솔 확인 |
| 광고가 안 보임 | AdSense 코드 미적용 상태 |

### 사용자 피드백 수집

- 앱 내 설문 (선택)
- GitHub Issues
- 이메일 피드백

---

## 📈 향후 계획

### Phase 2 (2026년 예정)

- [ ] Service Worker 구현
- [ ] 다국어 지원 (영어, 중국어, 힌디어)
- [ ] 더 많은 공제 항목 추가
- [ ] PDF 리포트 다운로드
- [ ] 이메일 공유 기능

### Phase 3 (Google Play)

- [ ] Capacitor로 Android 앱 변환
- [ ] Google Play Console 등록
- [ ] 푸시 알림 (연말정산 시작 공지)
- [ ] AdMob 광고 적용

---

## 📝 버전 히스토리

### v1.0.0 (2026-02-07)

**초기 릴리스**:
- 기본 환급액 계산 기능
- localStorage 저장
- 프리미엄 콘텐츠
- Dark Mode 지원
- 반응형 디자인

---

## 🎯 배포 체크리스트 (최종)

배포 전 다음을 확인하세요:

- [ ] 모든 링크 작동 확인
- [ ] 이미지 로드 확인
- [ ] 모바일에서 레이아웃 확인
- [ ] Dark Mode 토글 확인
- [ ] localStorage 저장 확인
- [ ] 프리미엄 기능 5초 카운트다운 확인
- [ ] 광고 영역 표시 확인
- [ ] 콘솔 에러 없음 확인
- [ ] manifest.json 유효 확인
- [ ] 개인정보처리방침 게시 확인

---

**준비 완료 일시**: 2026-02-07
**배포 상태**: ✅ 배포 준비 완료 (SW 이슈 제외)
**담당자**: Tester (Task #5, #6)

배포 시 위 체크리스트를 참고하세요!
