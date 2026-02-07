// 간단한 기능 검증 스크립트
// Node.js에서 tax-data.js의 함수들을 테스트합니다

// tax-data.js 로드 (간소화된 버전)
const TAX_CONFIG = {
    basicDeduction: 1500000,
    taxBrackets: [
        { min: 0, max: 12000000, rate: 0.06 },
        { min: 12000000, max: 47000000, rate: 0.15 },
        { min: 47000000, max: 100000000, rate: 0.24 },
        { min: 100000000, max: 500000000, rate: 0.35 },
        { min: 500000000, max: Infinity, rate: 0.38 },
    ],
};

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

function calculateTotalDeductions(earnedIncome, deductions) {
    let total = TAX_CONFIG.basicDeduction;
    if (deductions.medical > 3000000) {
        total += (deductions.medical - 3000000) * 0.15;
    }
    total += Math.min(deductions.education, 900000);
    total += deductions.donations * 0.3;
    if (deductions.creditCard > 0) {
        const cardCredit = deductions.creditCard * 0.15;
        total += Math.min(cardCredit, 300000);
    }
    total += Math.min(deductions.housing, 1500000);
    total += Math.min(deductions.pension, 400000);
    return Math.round(total);
}

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

function calculateTax(salary, deductions) {
    const necessaryExpense = calculateNecessaryExpense(salary);
    const earnedIncome = Math.max(0, salary - necessaryExpense);
    const totalDeductions = calculateTotalDeductions(earnedIncome, deductions);
    const taxableIncome = Math.max(0, earnedIncome - totalDeductions);
    const calculatedTax = calculateCalculatedTax(taxableIncome);
    const taxCredit = 55000;
    const finalTax = Math.max(0, calculatedTax - taxCredit);
    const withheldTax = salary * 0.03;
    const refund = withheldTax - finalTax;

    return {
        salary,
        necessaryExpense,
        earnedIncome,
        totalDeductions,
        taxableIncome,
        calculatedTax: Math.round(calculatedTax),
        finalTax: Math.round(finalTax),
        withheldTax: Math.round(withheldTax),
        refund: Math.round(refund),
        isRefund: refund > 0,
    };
}

// 테스트 케이스
console.log('=== 연말정산 계산 검증 ===\n');

// 테스트 1: 기본 시나리오
console.log('테스트 1: 급여 30,000,000원, 공제 없음');
const test1 = calculateTax(30000000, {
    medical: 0, education: 0, donations: 0, creditCard: 0, housing: 0, pension: 0
});
console.log(`  급여: ${test1.salary.toLocaleString('ko-KR')}원`);
console.log(`  근로소득공제: ${test1.necessaryExpense.toLocaleString('ko-KR')}원`);
console.log(`  과세표준: ${test1.taxableIncome.toLocaleString('ko-KR')}원`);
console.log(`  산출세액: ${test1.calculatedTax.toLocaleString('ko-KR')}원`);
console.log(`  최종 세액: ${test1.finalTax.toLocaleString('ko-KR')}원`);
console.log(`  원천징수액: ${test1.withheldTax.toLocaleString('ko-KR')}원`);
console.log(`  환급액: ${test1.refund.toLocaleString('ko-KR')}원\n`);

// 테스트 2: 의료비 공제
console.log('테스트 2: 급여 30,000,000원, 의료비 5,000,000원');
const test2 = calculateTax(30000000, {
    medical: 5000000, education: 0, donations: 0, creditCard: 0, housing: 0, pension: 0
});
console.log(`  의료비 공제: ${((5000000 - 3000000) * 0.15).toLocaleString('ko-KR')}원 (초과분 15%)`);
console.log(`  과세표준: ${test2.taxableIncome.toLocaleString('ko-KR')}원`);
console.log(`  환급액: ${test2.refund.toLocaleString('ko-KR')}원\n`);

// 테스트 3: 종합 공제
console.log('테스트 3: 급여 40,000,000원, 종합 공제');
const test3 = calculateTax(40000000, {
    medical: 4000000,
    education: 500000,
    donations: 1000000,
    creditCard: 2000000,
    housing: 1200000,
    pension: 300000
});
console.log(`  의료비 공제: ${((4000000 - 3000000) * 0.15).toLocaleString('ko-KR')}원`);
console.log(`  교육비 공제: ${Math.min(500000, 900000).toLocaleString('ko-KR')}원`);
console.log(`  기부금 공제: ${(1000000 * 0.3).toLocaleString('ko-KR')}원`);
console.log(`  신용카드 공제: ${Math.min(2000000 * 0.15, 300000).toLocaleString('ko-KR')}원`);
console.log(`  주택담보 공제: ${Math.min(1200000, 1500000).toLocaleString('ko-KR')}원`);
console.log(`  연금 공제: ${Math.min(300000, 400000).toLocaleString('ko-KR')}원`);
console.log(`  총 공제액: ${test3.totalDeductions.toLocaleString('ko-KR')}원`);
console.log(`  과세표준: ${test3.taxableIncome.toLocaleString('ko-KR')}원`);
console.log(`  환급액: ${test3.refund.toLocaleString('ko-KR')}원\n`);

// 테스트 4: 저소득층
console.log('테스트 4: 급여 15,000,000원');
const test4 = calculateTax(15000000, {
    medical: 0, education: 0, donations: 0, creditCard: 0, housing: 0, pension: 0
});
console.log(`  급여: ${test4.salary.toLocaleString('ko-KR')}원`);
console.log(`  과세표준: ${test4.taxableIncome.toLocaleString('ko-KR')}원`);
console.log(`  환급액: ${test4.refund.toLocaleString('ko-KR')}원\n`);

// 테스트 5: 고소득층
console.log('테스트 5: 급여 100,000,000원');
const test5 = calculateTax(100000000, {
    medical: 0, education: 0, donations: 0, creditCard: 0, housing: 0, pension: 0
});
console.log(`  급여: ${test5.salary.toLocaleString('ko-KR')}원`);
console.log(`  과세표준: ${test5.taxableIncome.toLocaleString('ko-KR')}원`);
console.log(`  최종 세액: ${test5.finalTax.toLocaleString('ko-KR')}원`);
console.log(`  환급액/추가납부: ${(test5.isRefund ? '+' : '')}${test5.refund.toLocaleString('ko-KR')}원\n`);

console.log('✅ 모든 테스트 완료');
