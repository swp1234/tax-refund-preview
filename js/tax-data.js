// 세금 계산 데이터 및 로직
// 2026년 기준 연말정산 계산

const TAX_CONFIG = {
    // 기본 공제 및 세율
    basicDeduction: 1500000, // 기본공제
    employeePensionRate: 0.09, // 직원 국민연금료 9%
    healthInsuranceRate: 0.06395, // 건강보험료 6.395%
    employmentInsuranceRate: 0.009, // 고용보험료 0.9%
    totalInsuranceRate: 0.16295, // 통합 보험료율

    // 세율 (누진세)
    taxBrackets: [
        { min: 0, max: 12000000, rate: 0.06 },        // 1,200만원 이하: 6%
        { min: 12000000, max: 47000000, rate: 0.15 }, // 4,700만원 이하: 15%
        { min: 47000000, max: 100000000, rate: 0.24 }, // 1억원 이하: 24%
        { min: 100000000, max: 500000000, rate: 0.35 }, // 5억원 이하: 35%
        { min: 500000000, max: Infinity, rate: 0.38 }, // 초과: 38%
    ],

    // 공제율 상한
    deductionLimits: {
        medical: { limit: null, rate: 0.15, threshold: 3000000 }, // 초과분의 15% (300만원 초과)
        education: { limit: 900000, rate: 1.0 },  // 전액 공제 (최대 90만원)
        donations: { limit: null, rate: 0.3 }, // 30% (상한 없음)
        creditCard: { limit: null, rate: 0.15, threshold: null }, // 15% (장려금)
        housing: { limit: 1500000, rate: 1.0 }, // 전액 공제 (최대 150만원)
        pension: { limit: 400000, rate: 1.0 }, // 전액 공제 (최대 40만원)
    },

    // 자녀 세액공제
    childTaxCredit: {
        first: 150000,  // 첫째: 15만원
        second: 150000, // 둘째: 15만원
        third: 300000,  // 셋째 이상: 30만원
    },
};

// 세금 계산 함수
function calculateTax(salary, deductions) {
    // 1. 필요경비 계산 (근로소득공제)
    const necessaryExpense = calculateNecessaryExpense(salary);

    // 2. 근로소득금액
    const earnedIncome = Math.max(0, salary - necessaryExpense);

    // 3. 공제액 계산
    const totalDeductions = calculateTotalDeductions(earnedIncome, deductions);

    // 4. 과세표준
    const taxableIncome = Math.max(0, earnedIncome - totalDeductions);

    // 5. 산출세액
    const calculatedTax = calculateCalculatedTax(taxableIncome);

    // 6. 세액공제 및 감면
    const taxCredit = calculateTaxCredit();

    // 7. 최종 세액
    const finalTax = Math.max(0, calculatedTax - taxCredit);

    // 8. 원천징수액 (근로소득 간이세액표 근사)
    const monthlySalary = salary / 12;
    let monthlyWithheld = 0;
    if (monthlySalary <= 1500000) monthlyWithheld = 0;
    else if (monthlySalary <= 3000000) monthlyWithheld = (monthlySalary - 1500000) * 0.02;
    else if (monthlySalary <= 5000000) monthlyWithheld = 30000 + (monthlySalary - 3000000) * 0.04;
    else if (monthlySalary <= 8000000) monthlyWithheld = 110000 + (monthlySalary - 5000000) * 0.06;
    else monthlyWithheld = 290000 + (monthlySalary - 8000000) * 0.08;
    const withheldTax = monthlyWithheld * 12;

    // 9. 환급액 또는 추가납부액
    const refund = withheldTax - finalTax;

    return {
        salary,
        necessaryExpense,
        earnedIncome,
        basicDeduction: TAX_CONFIG.basicDeduction,
        deductions: calculateDeductionBreakdown(earnedIncome, deductions),
        totalDeductions,
        taxableIncome,
        calculatedTax: Math.round(calculatedTax),
        taxCredit: Math.round(taxCredit),
        finalTax: Math.round(finalTax),
        withheldTax: Math.round(withheldTax),
        refund: Math.round(refund),
        isRefund: refund > 0,
    };
}

// 근로소득공제 계산
function calculateNecessaryExpense(salary) {
    let expense = 0;

    if (salary <= 3300000) {
        expense = salary * 0.7;
    } else if (salary <= 7000000) {
        expense = 2310000 + (salary - 3300000) * 0.4;
    } else if (salary <= 14000000) {
        expense = 3810000 + (salary - 7000000) * 0.15;
    } else {
        expense = 4860000 + (salary - 14000000) * 0.05;
    }

    return Math.min(expense, 2000000 + salary * 0.5);
}

// 공제액 계산 (기본공제 포함)
function calculateTotalDeductions(earnedIncome, deductions) {
    let total = TAX_CONFIG.basicDeduction; // 기본공제

    // 의료비 공제
    if (deductions.medical > 3000000) {
        total += (deductions.medical - 3000000) * 0.15;
    }

    // 교육비 공제
    total += Math.min(deductions.education, 900000);

    // 기부금 공제
    total += deductions.donations * 0.3;

    // 신용카드 사용액 공제 (소비장려금)
    if (deductions.creditCard > 0) {
        const cardCredit = deductions.creditCard * 0.15;
        total += Math.min(cardCredit, 300000);
    }

    // 주택담보이자 공제
    total += Math.min(deductions.housing, 1500000);

    // 연금보험료 공제
    total += Math.min(deductions.pension, 400000);

    return Math.round(total);
}

// 공제액 상세 계산
function calculateDeductionBreakdown(earnedIncome, deductions) {
    const breakdown = {};

    // 의료비
    if (deductions.medical > 3000000) {
        breakdown.medical = (deductions.medical - 3000000) * 0.15;
    } else {
        breakdown.medical = 0;
    }

    // 교육비
    breakdown.education = Math.min(deductions.education, 900000);

    // 기부금
    breakdown.donations = deductions.donations * 0.3;

    // 신용카드
    breakdown.creditCard = Math.min(deductions.creditCard * 0.15, 300000);

    // 주택담보이자
    breakdown.housing = Math.min(deductions.housing, 1500000);

    // 연금보험료
    breakdown.pension = Math.min(deductions.pension, 400000);

    return breakdown;
}

// 산출세액 계산
function calculateCalculatedTax(taxableIncome) {
    let tax = 0;

    for (const bracket of TAX_CONFIG.taxBrackets) {
        if (taxableIncome >= bracket.max) {
            tax += (bracket.max - bracket.min) * bracket.rate;
        } else if (taxableIncome > bracket.min) {
            tax += (taxableIncome - bracket.min) * bracket.rate;
            break;
        }
    }

    return tax;
}

// 세액공제 계산
function calculateTaxCredit() {
    // 기본 근로소득세액공제
    return 55000; // 2026년 기준
}

// 포맷팅 함수
function formatCurrency(amount) {
    return new Intl.NumberFormat('ko-KR').format(Math.round(amount));
}

// AI 세금 절약 팁 (프리미엄 콘텐츠)
const TAX_SAVING_TIPS = [
    {
        title: '의료비 공제 최대화',
        description: '병원비, 약값, 안경구입비 등 본인과 부양가족의 의료비를 모두 합산하면 300만원을 초과할 수 있습니다. 초과분의 15%를 공제받으세요.',
    },
    {
        title: '교육비 공제 활용',
        description: '자녀 학비 뿐 아니라 취업 준비생의 기술습득비, 자격증 취득비도 포함될 수 있습니다. 최대 90만원까지 공제 가능합니다.',
    },
    {
        title: '신용카드 사용으로 소비장려금',
        description: '현금 사용보다 신용카드 사용을 늘리면 사용액의 15%를 공제받을 수 있습니다(최대 30만원).',
    },
    {
        title: '기부금 공제',
        description: '종교단체, 적십자 등 지정기부금은 30%를 공제받을 수 있습니다. 연초에 계획적으로 기부하세요.',
    },
    {
        title: '주택담보이자 공제',
        description: '주택 구입 대출금의 이자는 최대 150만원까지 공제됩니다. 금리 인상 시기에 더 유리합니다.',
    },
    {
        title: '연금보험료 공제',
        description: '개인연금보험료는 최대 40만원까지 공제됩니다. 노후자금 적립과 절세를 함께 하세요.',
    },
    {
        title: '영수증 정리 중요성',
        description: '영수증, 통장기록, 신용카드명세서 등 모든 증빙 서류를 보관해야 세무조사 시 안전합니다.',
    },
    {
        title: '배우자 소득 고려',
        description: '배우자가 근로소득이 있다면 별도로 연말정산할 수 있습니다. 가족 전체의 세부담을 최소화하세요.',
    },
];

// 사용자 입력값에 따른 맞춤 팁 생성
function generatePersonalizedTips(salary, deductions) {
    const personalTips = [];
    const result = calculateTax(salary, deductions);

    // 의료비가 적은 경우
    if (deductions.medical < 3000000 && deductions.medical > 0) {
        personalTips.push({
            title: '의료비 추가 확인',
            description: `현재 의료비는 ${formatCurrency(deductions.medical)}원입니다. 300만원 이상이면 초과분의 15%를 공제받을 수 있으니 치과, 안경, 한의원 비용을 확인해보세요.`,
        });
    }

    // 신용카드 사용이 적은 경우
    if (deductions.creditCard < salary * 0.05) {
        personalTips.push({
            title: '신용카드 사용 활성화',
            description: '현금 사용을 신용카드로 바꾸면 사용액의 15%를 소비장려금으로 받을 수 있습니다.',
        });
    }

    // 환급액이 많은 경우
    if (result.isRefund && result.refund > 2000000) {
        personalTips.push({
            title: '과도한 환급액 주의',
            description: `예상 환급액이 많습니다. 월급에서 원천징수를 재조정하여 연중에 받으면 더 유리합니다.`,
        });
    }

    return personalTips.length > 0 ? personalTips : TAX_SAVING_TIPS.slice(0, 4);
}
