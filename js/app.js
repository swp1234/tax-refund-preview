// ===== MONEY INPUT UTILITIES =====
function parseMoney(str) {
    const cleaned = str.toString().replace(/[^\d.-]/g, '');
    return parseInt(cleaned) || 0;
}

function formatMoney(num) {
    return new Intl.NumberFormat('ko-KR').format(num);
}

// ===== DOM ELEMENT CACHE =====
const elements = {
    // Inputs - Basic Info
    salary: document.getElementById('salary'),
    nonTaxable: document.getElementById('nonTaxable'),

    // Inputs - Insurance
    nationalPension: document.getElementById('nationalPension'),
    healthInsurance: document.getElementById('healthInsurance'),
    longTermCare: document.getElementById('longTermCare'),
    employmentInsurance: document.getElementById('employmentInsurance'),

    // Inputs - Income Deduction
    creditCard: document.getElementById('creditCard'),
    debitCard: document.getElementById('debitCard'),
    tradMarket: document.getElementById('tradMarket'),
    publicTransport: document.getElementById('publicTransport'),
    housingSaving: document.getElementById('housingSaving'),
    housingLoan: document.getElementById('housingLoan'),

    // Inputs - Tax Credit
    medical: document.getElementById('medical'),
    education: document.getElementById('education'),
    donations: document.getElementById('donations'),
    insurance: document.getElementById('insurance'),
    pensionSaving: document.getElementById('pensionSaving'),
    irp: document.getElementById('irp'),
    monthlyRent: document.getElementById('monthlyRent'),

    // Counters
    children: document.getElementById('children'),
    parents: document.getElementById('parents'),
    otherDep: document.getElementById('otherDep'),

    // Toggles
    spouseYes: document.getElementById('spouseYes'),
    spouseNo: document.getElementById('spouseNo'),

    // Buttons
    calculateBtn: document.getElementById('calculateBtn'),
    resetBtn: document.getElementById('resetBtn'),
    helpBtn: document.getElementById('helpBtn'),
    premiumBtn: document.getElementById('premiumBtn'),

    // Results
    resultsSection: document.getElementById('resultsSection'),
    resultStatus: document.getElementById('resultStatus'),
    refundAmount: document.getElementById('refundAmount'),
    refundSub: document.getElementById('refundSub'),
    breakdownList: document.getElementById('breakdownList'),
    resultStats: document.getElementById('resultStats'),
    quickSummary: document.getElementById('quickSummary'),
    qsRefund: document.getElementById('qsRefund'),

    // Section Summaries
    basicSummary: document.getElementById('basicSummary'),
    insuranceSummary: document.getElementById('insuranceSummary'),
    incomeDeductionSummary: document.getElementById('incomeDeductionSummary'),
    taxCreditSummary: document.getElementById('taxCreditSummary'),

    // Modals
    premiumModal: document.getElementById('premiumModal'),
    premiumAd: document.getElementById('premiumAd'),
    tipsContent: document.getElementById('tipsContent'),
    countdownNumber: document.getElementById('countdownNumber'),
    closeModal: document.getElementById('closeModal'),
    closeTipsBtn: document.getElementById('closeTipsBtn'),
    helpModal: document.getElementById('helpModal'),
    closeHelpModal: document.getElementById('closeHelpModal'),
};

// Track manually edited insurance fields
const manuallyEditedFields = new Set();

// Debounce timer
let saveDebounceTimer = null;

// ===== MONEY INPUT FORMATTING =====
function setupMoneyInputs() {
    document.querySelectorAll('.input-money').forEach(input => {
        input.addEventListener('input', (e) => {
            const raw = parseMoney(e.target.value);
            e.target.value = formatMoney(raw);

            // Track manual edits for auto-calc fields
            if (e.target.classList.contains('auto-field')) {
                manuallyEditedFields.add(e.target.id);
            }

            // Auto-calculate insurance when salary changes
            if (e.target.id === 'salary') {
                autoCalculateInsurance(raw);
            }

            debouncedSave();
        });

        // On blur, ensure formatting
        input.addEventListener('blur', (e) => {
            const raw = parseMoney(e.target.value);
            e.target.value = formatMoney(raw);
        });
    });
}

// ===== AUTO-CALCULATE INSURANCE =====
function autoCalculateInsurance(salary) {
    if (salary === 0) {
        elements.nationalPension.value = '';
        elements.healthInsurance.value = '';
        elements.longTermCare.value = '';
        elements.employmentInsurance.value = '';
        manuallyEditedFields.clear();
        return;
    }

    // Calculate insurance amounts
    const nationalPension = Math.round(salary * 0.045);
    const healthInsurance = Math.round(salary * 0.03545);
    const longTermCare = Math.round(healthInsurance * 0.1295);
    const employmentInsurance = Math.round(salary * 0.009);

    // Only update if field hasn't been manually edited
    if (!manuallyEditedFields.has('nationalPension')) {
        elements.nationalPension.value = formatMoney(nationalPension);
    }
    if (!manuallyEditedFields.has('healthInsurance')) {
        elements.healthInsurance.value = formatMoney(healthInsurance);
    }
    if (!manuallyEditedFields.has('longTermCare')) {
        elements.longTermCare.value = formatMoney(longTermCare);
    }
    if (!manuallyEditedFields.has('employmentInsurance')) {
        elements.employmentInsurance.value = formatMoney(employmentInsurance);
    }
}

// ===== SECTION ACCORDION =====
function setupAccordion() {
    document.querySelectorAll('.section-toggle').forEach(button => {
        button.addEventListener('click', (e) => {
            const section = button.closest('.form-section');
            section.classList.toggle('open');
        });
    });
}

// ===== TOGGLE BUTTONS =====
function setupToggleButtons() {
    document.querySelectorAll('.toggle-group').forEach(group => {
        const buttons = group.querySelectorAll('.toggle-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                buttons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                debouncedSave();
            });
        });
    });
}

// ===== COUNTER CONTROLS =====
function setupCounters() {
    document.querySelectorAll('.counter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetId = btn.dataset.target;
            const action = btn.dataset.action;
            const valueSpan = document.getElementById(targetId);

            let current = parseInt(valueSpan.textContent) || 0;

            if (action === 'plus') {
                if (current < 10) current++;
            } else if (action === 'minus') {
                if (current > 0) current--;
            }

            valueSpan.textContent = current;
            debouncedSave();
        });
    });
}

// ===== GET ALL FORM VALUES =====
function getFormData() {
    const salary = parseMoney(elements.salary.value);
    const nonTaxable = parseMoney(elements.nonTaxable.value) || 2400000;

    // Get spouse status (1 = yes, 0 = no)
    const hasSpouse = elements.spouseYes.classList.contains('active') ? 1 : 0;

    // Get dependents
    const children = parseInt(elements.children.textContent) || 0;
    const parents = parseInt(elements.parents.textContent) || 0;
    const otherDep = parseInt(elements.otherDep.textContent) || 0;

    // Get insurance amounts
    const nationalPension = parseMoney(elements.nationalPension.value);
    const healthInsurance = parseMoney(elements.healthInsurance.value);
    const longTermCare = parseMoney(elements.longTermCare.value);
    const employmentInsurance = parseMoney(elements.employmentInsurance.value);

    // Get deduction amounts
    const creditCard = parseMoney(elements.creditCard.value);
    const debitCard = parseMoney(elements.debitCard.value);
    const tradMarket = parseMoney(elements.tradMarket.value);
    const publicTransport = parseMoney(elements.publicTransport.value);
    const housingSaving = parseMoney(elements.housingSaving.value);
    const housingLoan = parseMoney(elements.housingLoan.value);

    // Get tax credit amounts
    const medical = parseMoney(elements.medical.value);
    const education = parseMoney(elements.education.value);
    const donations = parseMoney(elements.donations.value);
    const insurance = parseMoney(elements.insurance.value);
    const pensionSaving = parseMoney(elements.pensionSaving.value);
    const irp = parseMoney(elements.irp.value);
    const monthlyRent = parseMoney(elements.monthlyRent.value);

    return {
        salary,
        nonTaxable,
        hasSpouse,
        children,
        parents,
        otherDep,
        insurance: {
            nationalPension,
            healthInsurance,
            longTermCare,
            employmentInsurance,
        },
        deductions: {
            creditCard,
            debitCard,
            tradMarket,
            publicTransport,
            housingSaving,
            housingLoan,
            medical,
            education,
            donations,
            insurance,
            pensionSaving,
            irp,
            monthlyRent,
        },
    };
}

// ===== CALCULATE TAX =====
function handleCalculate() {
    const data = getFormData();

    // Validate salary
    if (data.salary === 0) {
        alert('급여액을 입력하세요.');
        elements.salary.focus();
        return;
    }

    // Calculate actual salary (after non-taxable)
    const taxableSalary = Math.max(0, data.salary - data.nonTaxable);

    // Create deductions object for calculation
    const deductions = {
        ...data.deductions,
        creditCard: data.deductions.creditCard,
        medical: data.deductions.medical,
        education: data.deductions.education,
        donations: data.deductions.donations,
        housing: data.deductions.housingLoan,
        pension: data.deductions.pensionSaving,
    };

    // Calculate tax using tax-data.js function
    const result = calculateTax(taxableSalary, deductions);

    // Display results
    displayResults(result, data);

    // Scroll to results
    elements.resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// ===== DISPLAY RESULTS =====
function displayResults(result, data) {
    // Show results section
    elements.resultsSection.classList.remove('hidden');

    // Calculate local income tax (10% of national income tax)
    const localTax = Math.round(result.finalTax * 0.1);
    const totalRefund = result.refund - localTax;

    // Determine status and color
    const isRefund = totalRefund >= 0;
    const statusText = isRefund ? '✅ 환급' : '⚠️ 추가납부';
    const statusColor = isRefund ? '#00b894' : '#ff6348';

    // Update main result
    elements.resultStatus.innerHTML = statusText;
    elements.resultStatus.style.color = statusColor;

    elements.refundAmount.textContent = formatMoney(Math.abs(totalRefund)) + '원';
    elements.refundAmount.style.color = statusColor;

    elements.refundSub.textContent = `(지방소득세 ${formatMoney(localTax)}원 포함 총 ${isRefund ? '환급' : '납부'})`;

    // Update quick summary
    elements.qsRefund.textContent = formatMoney(Math.abs(totalRefund)) + '원';
    elements.qsRefund.style.color = statusColor;

    // Display breakdown
    displayBreakdown(result, data, localTax);

    // Display stats
    displayStats(result, data);

    // Update section summaries
    updateSectionSummaries(result, data);
}

// ===== DISPLAY BREAKDOWN =====
function displayBreakdown(result, data, localTax) {
    const breakdown = [
        { label: '총급여', value: result.salary },
        { label: '비과세소득', value: data.nonTaxable, highlight: false },
        { label: '과세급여', value: result.salary - data.nonTaxable },
        { label: '근로소득공제', value: result.necessaryExpense, highlight: true },
        { label: '근로소득금액', value: result.earnedIncome },
        { label: '기본공제', value: result.basicDeduction, highlight: true },
        { label: '4대보험공제', value: data.insurance.nationalPension + data.insurance.healthInsurance + data.insurance.longTermCare + data.insurance.employmentInsurance, highlight: true },
        { label: '신용카드등공제', value: data.deductions.creditCard > 0 ? Math.min(data.deductions.creditCard * 0.15, 300000) : 0 },
        { label: '주택관련공제', value: Math.min(data.deductions.housingLoan, 1500000) },
        { label: '총공제액', value: result.totalDeductions, highlight: true },
        { label: '과세표준', value: result.taxableIncome, highlight: true },
        { label: '산출세액', value: result.calculatedTax, highlight: true },
        { label: '근로소득세액공제', value: result.taxCredit },
        { label: '자녀세액공제', value: Math.min(data.children, 2) * 150000 + Math.max(0, data.children - 2) * 300000 },
        { label: '의료비/교육비/기부금 세액공제', value: calculateDetailedTaxCredit(data.deductions) },
        { label: '결정세액', value: result.finalTax, highlight: true },
        { label: '지방소득세', value: localTax },
        { label: '총 결정세액', value: result.finalTax + localTax, highlight: true },
        { label: '기납부세액', value: result.withheldTax, highlight: true },
        { label: '환급/추가납부액', value: result.refund - localTax, highlight: true },
    ];

    let html = '';
    breakdown.forEach(item => {
        const formattedValue = formatMoney(Math.abs(Math.round(item.value)));
        const highlightClass = item.highlight ? ' highlight' : '';
        html += `<div class="breakdown-row${highlightClass}">
                    <span class="breakdown-label">${item.label}</span>
                    <span class="breakdown-value">${formattedValue}원</span>
                 </div>`;
    });

    elements.breakdownList.innerHTML = html;
}

// Calculate detailed tax credit (placeholder)
function calculateDetailedTaxCredit(deductions) {
    let credit = 0;

    // Medical: 300만원 초과분의 15%
    if (deductions.medical > 3000000) {
        credit += (deductions.medical - 3000000) * 0.15;
    }

    // Education: max 90만원
    credit += Math.min(deductions.education, 900000);

    // Donations: 30%
    credit += deductions.donations * 0.3;

    return Math.round(credit);
}

// ===== DISPLAY STATS =====
function displayStats(result, data) {
    const effectiveTaxRate = result.salary > 0 ? ((result.finalTax / result.salary) * 100).toFixed(2) : '0.00';
    const totalDeductions = result.totalDeductions + data.insurance.nationalPension + data.insurance.healthInsurance + data.insurance.longTermCare + data.insurance.employmentInsurance;
    const taxSavings = totalDeductions > 0 ? Math.round(totalDeductions * 0.14) : 0; // Approximate tax rate

    const statsHtml = `
        <div class="stats-grid">
            <div class="stat-item">
                <div class="stat-label">실효세율</div>
                <div class="stat-value">${effectiveTaxRate}%</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">총공제액</div>
                <div class="stat-value">${formatMoney(totalDeductions)}원</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">절세효과</div>
                <div class="stat-value">${formatMoney(taxSavings)}원</div>
            </div>
        </div>
    `;

    elements.resultStats.innerHTML = statsHtml;
}

// ===== UPDATE SECTION SUMMARIES =====
function updateSectionSummaries(result, data) {
    // Basic summary
    const totalDep = (data.hasSpouse ? 1 : 0) + data.children + data.parents + data.otherDep;
    elements.basicSummary.textContent = `연봉 ${formatMoney(result.salary)}만원, 부양가족 ${totalDep}명`;

    // Insurance summary
    const totalInsurance = data.insurance.nationalPension + data.insurance.healthInsurance + data.insurance.longTermCare + data.insurance.employmentInsurance;
    elements.insuranceSummary.textContent = `총 ${formatMoney(totalInsurance)}원 공제`;

    // Income deduction summary
    const incomeDeductionAmount = Math.min(data.deductions.creditCard * 0.15, 300000) + Math.min(data.deductions.housingLoan, 1500000);
    elements.incomeDeductionSummary.textContent = `소득공제 ${formatMoney(incomeDeductionAmount)}원`;

    // Tax credit summary
    const taxCreditAmount = calculateDetailedTaxCredit(data.deductions) + (Math.min(data.children, 2) * 150000) + (Math.max(0, data.children - 2) * 300000);
    elements.taxCreditSummary.textContent = `세액공제 ${formatMoney(taxCreditAmount)}원`;
}

// ===== RESET FORM =====
function handleReset() {
    // Clear all inputs
    elements.salary.value = '';
    elements.nonTaxable.value = '2,400,000';

    // Clear insurance
    elements.nationalPension.value = '';
    elements.healthInsurance.value = '';
    elements.longTermCare.value = '';
    elements.employmentInsurance.value = '';
    manuallyEditedFields.clear();

    // Clear income deduction
    elements.creditCard.value = '';
    elements.debitCard.value = '';
    elements.tradMarket.value = '';
    elements.publicTransport.value = '';
    elements.housingSaving.value = '';
    elements.housingLoan.value = '';

    // Clear tax credit
    elements.medical.value = '';
    elements.education.value = '';
    elements.donations.value = '';
    elements.insurance.value = '';
    elements.pensionSaving.value = '';
    elements.irp.value = '';
    elements.monthlyRent.value = '';

    // Reset counters
    elements.children.textContent = '0';
    elements.parents.textContent = '0';
    elements.otherDep.textContent = '0';

    // Reset toggle to "없음"
    elements.spouseYes.classList.remove('active');
    elements.spouseNo.classList.add('active');

    // Hide results
    elements.resultsSection.classList.add('hidden');

    // Reset summaries
    elements.basicSummary.textContent = '급여와 부양가족 정보를 입력하세요';
    elements.insuranceSummary.textContent = '급여 기준 자동 계산됩니다';
    elements.incomeDeductionSummary.textContent = '카드 사용액, 주택 관련 공제';
    elements.taxCreditSummary.textContent = '의료비, 교육비, 연금저축 등';

    // Reset quick summary
    elements.qsRefund.textContent = '-';
    elements.qsRefund.style.color = 'inherit';

    // Clear localStorage
    localStorage.removeItem('taxRefundFormData');
}

// ===== PREMIUM MODAL HANDLER =====
function handlePremiumClick() {
    elements.premiumModal.classList.remove('hidden');
    elements.premiumAd.classList.remove('hidden');
    elements.tipsContent.classList.add('hidden');

    // Start countdown
    let countdown = 5;
    elements.countdownNumber.textContent = countdown;

    const countdownInterval = setInterval(() => {
        countdown--;
        elements.countdownNumber.textContent = countdown;

        if (countdown === 0) {
            clearInterval(countdownInterval);
            showTips();
        }
    }, 1000);
}

function showTips() {
    elements.premiumAd.classList.add('hidden');
    elements.tipsContent.classList.remove('hidden');

    const data = getFormData();
    const taxableSalary = Math.max(0, data.salary - data.nonTaxable);
    const deductions = {
        ...data.deductions,
        housing: data.deductions.housingLoan,
        pension: data.deductions.pensionSaving,
    };

    const tips = generatePersonalizedTips(taxableSalary, deductions);

    let tipsHtml = '';
    tips.forEach(tip => {
        tipsHtml += `
            <div class="tip-item">
                <h4>${tip.title}</h4>
                <p>${tip.description}</p>
            </div>
        `;
    });

    document.querySelector('.tips-list').innerHTML = tipsHtml;
}

function closePremiumModal() {
    elements.premiumModal.classList.add('hidden');
}

// ===== HELP MODAL HANDLER =====
function handleHelpClick() {
    elements.helpModal.classList.remove('hidden');
}

function closeHelpModal() {
    elements.helpModal.classList.add('hidden');
}

// ===== MODAL OVERLAY CLICK =====
function setupModalCloseOnOverlay() {
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                e.target.closest('.modal').classList.add('hidden');
            }
        });
    });
}

// ===== DEBOUNCED SAVE =====
function debouncedSave() {
    clearTimeout(saveDebounceTimer);
    saveDebounceTimer = setTimeout(saveFormData, 2000);
}

// ===== LOCALSTORAGE SAVE/LOAD =====
function saveFormData() {
    const data = getFormData();
    localStorage.setItem('taxRefundFormData', JSON.stringify(data));
}

function loadFormData() {
    const saved = localStorage.getItem('taxRefundFormData');
    if (!saved) return;

    try {
        const data = JSON.parse(saved);

        // Load basic info
        if (data.salary) elements.salary.value = formatMoney(data.salary);
        if (data.nonTaxable) elements.nonTaxable.value = formatMoney(data.nonTaxable);

        // Load spouse
        if (data.hasSpouse) {
            elements.spouseYes.classList.add('active');
            elements.spouseNo.classList.remove('active');
        }

        // Load dependents
        elements.children.textContent = data.children || 0;
        elements.parents.textContent = data.parents || 0;
        elements.otherDep.textContent = data.otherDep || 0;

        // Load insurance
        if (data.insurance) {
            if (data.insurance.nationalPension) elements.nationalPension.value = formatMoney(data.insurance.nationalPension);
            if (data.insurance.healthInsurance) elements.healthInsurance.value = formatMoney(data.insurance.healthInsurance);
            if (data.insurance.longTermCare) elements.longTermCare.value = formatMoney(data.insurance.longTermCare);
            if (data.insurance.employmentInsurance) elements.employmentInsurance.value = formatMoney(data.insurance.employmentInsurance);
        }

        // Load deductions
        if (data.deductions) {
            if (data.deductions.creditCard) elements.creditCard.value = formatMoney(data.deductions.creditCard);
            if (data.deductions.debitCard) elements.debitCard.value = formatMoney(data.deductions.debitCard);
            if (data.deductions.tradMarket) elements.tradMarket.value = formatMoney(data.deductions.tradMarket);
            if (data.deductions.publicTransport) elements.publicTransport.value = formatMoney(data.deductions.publicTransport);
            if (data.deductions.housingSaving) elements.housingSaving.value = formatMoney(data.deductions.housingSaving);
            if (data.deductions.housingLoan) elements.housingLoan.value = formatMoney(data.deductions.housingLoan);
            if (data.deductions.medical) elements.medical.value = formatMoney(data.deductions.medical);
            if (data.deductions.education) elements.education.value = formatMoney(data.deductions.education);
            if (data.deductions.donations) elements.donations.value = formatMoney(data.deductions.donations);
            if (data.deductions.insurance) elements.insurance.value = formatMoney(data.deductions.insurance);
            if (data.deductions.pensionSaving) elements.pensionSaving.value = formatMoney(data.deductions.pensionSaving);
            if (data.deductions.irp) elements.irp.value = formatMoney(data.deductions.irp);
            if (data.deductions.monthlyRent) elements.monthlyRent.value = formatMoney(data.deductions.monthlyRent);
        }
    } catch (e) {
        console.error('Failed to load saved data:', e);
    }
}

// ===== SERVICE WORKER REGISTRATION =====
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(err => {
            console.log('Service Worker registration failed:', err);
        });
    }
}

// ===== INITIALIZE APP =====
function initApp() {
    // Load saved data first
    loadFormData();

    // Setup UI components
    setupMoneyInputs();
    setupAccordion();
    setupToggleButtons();
    setupCounters();
    setupModalCloseOnOverlay();

    // Setup event listeners
    elements.calculateBtn.addEventListener('click', handleCalculate);
    elements.resetBtn.addEventListener('click', handleReset);
    elements.helpBtn.addEventListener('click', handleHelpClick);
    elements.premiumBtn.addEventListener('click', handlePremiumClick);
    elements.closeModal.addEventListener('click', closePremiumModal);
    elements.closeTipsBtn.addEventListener('click', closePremiumModal);
    elements.closeHelpModal.addEventListener('click', closeHelpModal);

    // Register service worker
    registerServiceWorker();
}

// Start app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
