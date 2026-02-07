// 연말정산 미리보기 앱 메인 로직

// 상수
const STORAGE_KEY = 'tax-refund-data';
const STORAGE_HISTORY_KEY = 'tax-refund-history';

// DOM 요소
const form = {
    salary: document.getElementById('salary'),
    medical: document.getElementById('medical'),
    education: document.getElementById('education'),
    donations: document.getElementById('donations'),
    creditCard: document.getElementById('creditCard'),
    housing: document.getElementById('housing'),
    pension: document.getElementById('pension'),
};

const buttons = {
    calculate: document.getElementById('calculateBtn'),
    reset: document.getElementById('resetBtn'),
    help: document.getElementById('helpBtn'),
    premium: document.getElementById('premiumBtn'),
};

const modals = {
    premium: document.getElementById('premiumModal'),
    help: document.getElementById('helpModal'),
};

const results = {
    section: document.getElementById('resultsSection'),
    refund: document.getElementById('refundAmount'),
    status: document.getElementById('resultStatus'),
    breakdown: document.getElementById('breakdownList'),
    deductions: document.getElementById('totalDeductions'),
    taxableIncome: document.getElementById('taxableIncome'),
};

// 초기화
function init() {
    registerServiceWorker();
    loadFromStorage();
    attachEventListeners();
    setupAutoSave();
}

// Service Worker 등록
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(err => {
            // Service Worker 등록 실패 - 무시
        });
    }
}

// 이벤트 리스너 등록
function attachEventListeners() {
    buttons.calculate.addEventListener('click', handleCalculate);
    buttons.reset.addEventListener('click', handleReset);
    buttons.help.addEventListener('click', openHelpModal);
    buttons.premium.addEventListener('click', openPremiumModal);

    // 모달 닫기
    document.getElementById('closeModal').addEventListener('click', closePremiumModal);
    document.getElementById('closeTipsBtn').addEventListener('click', closePremiumModal);
    document.getElementById('closeHelpModal').addEventListener('click', closeHelpModal);
    document.getElementById('helpModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('helpModal')) {
            closeHelpModal();
        }
    });
    document.getElementById('premiumModal').addEventListener('click', (e) => {
        if (e.target.id === 'premiumModal' || e.target.className === 'modal-overlay') {
            closePremiumModal();
        }
    });

    // 입력 필드 변경 이벤트
    Object.values(form).forEach(field => {
        field.addEventListener('change', saveToStorage);
        field.addEventListener('input', validateInput);
    });
}

// 입력값 검증
function validateInput(event) {
    const value = event.target.value;
    if (value && (value < 0 || isNaN(value))) {
        event.target.value = '';
    }
}

// 계산 처리
function handleCalculate() {
    const deductions = {
        medical: parseInt(form.medical.value) || 0,
        education: parseInt(form.education.value) || 0,
        donations: parseInt(form.donations.value) || 0,
        creditCard: parseInt(form.creditCard.value) || 0,
        housing: parseInt(form.housing.value) || 0,
        pension: parseInt(form.pension.value) || 0,
    };

    const salary = parseInt(form.salary.value) || 0;

    if (salary === 0) {
        alert('급여액을 입력해주세요.');
        form.salary.focus();
        return;
    }

    // 세금 계산
    const result = calculateTax(salary, deductions);

    // 결과 표시
    displayResults(result);

    // 저장
    saveToStorage();

    // 결과 섹션 표시
    results.section.classList.remove('hidden');

    // 스크롤
    setTimeout(() => {
        results.section.scrollIntoView({ behavior: 'smooth' });
    }, 100);
}

// 결과 표시
function displayResults(result) {
    // 메인 환급액
    const refundText = result.isRefund ? '환급' : '납부';
    results.refund.textContent = `${formatCurrency(Math.abs(result.refund))} 원`;
    results.status.textContent = result.isRefund ? '✓ 환급 대상입니다' : '⚠ 추가 납부 대상입니다';
    results.status.className = `result-status ${result.isRefund ? 'refund' : 'payment'}`;

    // 공제액 내역
    const breakdown = result.deductions;
    let breakdownHTML = '';

    const deductionLabels = {
        medical: '의료비',
        education: '교육비',
        donations: '기부금',
        creditCard: '신용카드',
        housing: '주택담보이자',
        pension: '연금보험료',
    };

    // 기본공제
    breakdownHTML += `
        <div class="breakdown-item">
            <span class="breakdown-label">기본공제</span>
            <span class="breakdown-value">${formatCurrency(result.basicDeduction)} 원</span>
        </div>
    `;

    // 각 공제액
    for (const [key, value] of Object.entries(breakdown)) {
        if (value > 0) {
            breakdownHTML += `
                <div class="breakdown-item">
                    <span class="breakdown-label">${deductionLabels[key]}</span>
                    <span class="breakdown-value">${formatCurrency(value)} 원</span>
                </div>
            `;
        }
    }

    results.breakdown.innerHTML = breakdownHTML;

    // 통계
    results.deductions.textContent = `${formatCurrency(result.totalDeductions)} 원`;
    results.taxableIncome.textContent = `${formatCurrency(result.taxableIncome)} 원`;
}

// 초기화 처리
function handleReset() {
    if (!confirm('모든 입력값을 초기화하시겠습니까?')) {
        return;
    }

    form.salary.value = '';
    form.medical.value = '';
    form.education.value = '';
    form.donations.value = '';
    form.creditCard.value = '';
    form.housing.value = '';
    form.pension.value = '';

    results.section.classList.add('hidden');
    localStorage.removeItem(STORAGE_KEY);
}

// LocalStorage 저장
function saveToStorage() {
    const data = {
        salary: form.salary.value,
        medical: form.medical.value,
        education: form.education.value,
        donations: form.donations.value,
        creditCard: form.creditCard.value,
        housing: form.housing.value,
        pension: form.pension.value,
        timestamp: Date.now(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// LocalStorage 로드
function loadFromStorage() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return;

    try {
        const parsed = JSON.parse(data);
        form.salary.value = parsed.salary || '';
        form.medical.value = parsed.medical || '';
        form.education.value = parsed.education || '';
        form.donations.value = parsed.donations || '';
        form.creditCard.value = parsed.creditCard || '';
        form.housing.value = parsed.housing || '';
        form.pension.value = parsed.pension || '';
    } catch (e) {
        console.error('Failed to load data from storage:', e);
    }
}

// 자동 저장 설정 (5초마다)
function setupAutoSave() {
    setInterval(() => {
        if (form.salary.value || form.medical.value) {
            saveToStorage();
        }
    }, 5000);
}

// 프리미염 모달 열기
function openPremiumModal() {
    const salary = parseInt(form.salary.value) || 0;
    if (salary === 0) {
        alert('먼저 계산을 진행해주세요.');
        return;
    }

    modals.premium.classList.remove('hidden');

    // 5초 카운트다운
    let count = 5;
    const countElement = document.getElementById('countdownNumber');
    countElement.textContent = count;

    const countInterval = setInterval(() => {
        count--;
        countElement.textContent = count;

        if (count === 0) {
            clearInterval(countInterval);
            showPremiumTips();
        }
    }, 1000);

    // 카운트다운 중에 닫혀도 interval 정리
    setTimeout(() => {
        if (!modals.premium.classList.contains('hidden')) {
            clearInterval(countInterval);
        }
    }, 6000);
}

// 프리미엄 팁 표시
function showPremiumTips() {
    const salary = parseInt(form.salary.value) || 0;
    const deductions = {
        medical: parseInt(form.medical.value) || 0,
        education: parseInt(form.education.value) || 0,
        donations: parseInt(form.donations.value) || 0,
        creditCard: parseInt(form.creditCard.value) || 0,
        housing: parseInt(form.housing.value) || 0,
        pension: parseInt(form.pension.value) || 0,
    };

    const tips = generatePersonalizedTips(salary, deductions);

    const modalAd = document.getElementById('premiumAd');
    const tipsContent = document.getElementById('tipsContent');

    modalAd.classList.add('hidden');
    tipsContent.classList.remove('hidden');

    let tipsHTML = '';
    tips.forEach(tip => {
        tipsHTML += `
            <div class="tip-item">
                <div class="tip-title">${tip.title}</div>
                <div class="tip-description">${tip.description}</div>
            </div>
        `;
    });

    tipsContent.querySelector('.tips-list').innerHTML = tipsHTML;
}

// 프리미엄 모달 닫기
function closePremiumModal() {
    modals.premium.classList.add('hidden');
    // 모달 초기화
    document.getElementById('premiumAd').classList.remove('hidden');
    document.getElementById('tipsContent').classList.add('hidden');
}

// 도움말 모달 열기
function openHelpModal() {
    modals.help.classList.remove('hidden');
}

// 도움말 모달 닫기
function closeHelpModal() {
    modals.help.classList.add('hidden');
}

// PWA 설치 배너
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    // PWA 설치 배너 처리 (추후 구현)
});

// 다크모드 감지
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.style.colorScheme = 'dark';
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    document.documentElement.style.colorScheme = e.matches ? 'dark' : 'light';
});

// 앱 시작
document.addEventListener('DOMContentLoaded', init);

// 페이지 언로드 시 저장
window.addEventListener('beforeunload', saveToStorage);
