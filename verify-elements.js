// HTML의 필수 요소 검증
const required = [
    // 입력 필드
    'salary', 'medical', 'education', 'donations', 'creditCard', 'housing', 'pension',
    // 버튼
    'calculateBtn', 'resetBtn', 'helpBtn', 'premiumBtn',
    // 결과 영역
    'resultsSection', 'refundAmount', 'resultStatus', 'breakdownList', 'totalDeductions', 'taxableIncome',
    // 모달
    'premiumModal', 'helpModal', 'closeModal', 'closeHelpModal',
    // 기타
    'premiumAd', 'tipsContent'
];

let missing = [];
for (const id of required) {
    if (!document.getElementById(id)) {
        missing.push(id);
    }
}

if (missing.length === 0) {
    console.log('✅ 모든 필수 DOM 요소가 존재합니다');
    console.log(`   총 ${required.length}개 요소 검증 완료`);
} else {
    console.log('❌ 누락된 요소:');
    missing.forEach(id => console.log(`   - ${id}`));
}
