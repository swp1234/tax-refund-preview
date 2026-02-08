/**
 * tax-data.js
 * 2025년 귀속(2026년 신고) 한국 근로소득세 계산 엔진
 * 정확한 세금 계산 로직 포함
 */

// 근로소득공제 계산
function calculateEarnedIncomeDeduction(salary) {
  if (salary <= 5000000) {
    return salary * 0.70;
  } else if (salary <= 15000000) {
    return 3500000 + (salary - 5000000) * 0.40;
  } else if (salary <= 45000000) {
    return 7500000 + (salary - 15000000) * 0.15;
  } else if (salary <= 100000000) {
    return 12000000 + (salary - 45000000) * 0.05;
  } else {
    return 14750000 + (salary - 100000000) * 0.02;
  }
}

// 산출세액 계산 (누진세 적용)
function calculateCalculatedTax(taxableIncome) {
  if (taxableIncome <= 14000000) {
    return taxableIncome * 0.06;
  } else if (taxableIncome <= 50000000) {
    return 840000 + (taxableIncome - 14000000) * 0.15;
  } else if (taxableIncome <= 88000000) {
    return 6240000 + (taxableIncome - 50000000) * 0.24;
  } else if (taxableIncome <= 150000000) {
    return 15360000 + (taxableIncome - 88000000) * 0.35;
  } else if (taxableIncome <= 300000000) {
    return 37060000 + (taxableIncome - 150000000) * 0.38;
  } else if (taxableIncome <= 500000000) {
    return 94060000 + (taxableIncome - 300000000) * 0.40;
  } else if (taxableIncome <= 1000000000) {
    return 174060000 + (taxableIncome - 500000000) * 0.42;
  } else {
    return 384060000 + (taxableIncome - 1000000000) * 0.45;
  }
}

// 근로소득세액공제 계산
function calculateEarnedIncomeTaxCredit(calculatedTax, totalSalary) {
  let credit;
  if (calculatedTax <= 1300000) {
    credit = calculatedTax * 0.55;
  } else {
    credit = 715000 + (calculatedTax - 1300000) * 0.30;
  }

  // 공제 한도 적용
  let limit;
  if (totalSalary <= 33000000) {
    limit = 740000;
  } else if (totalSalary <= 70000000) {
    limit = 660000;
  } else {
    limit = 500000;
  }

  return Math.min(credit, limit);
}

// 자녀 세액공제 계산
function calculateChildTaxCredit(children) {
  if (children === 0) return 0;
  if (children === 1) return 150000;
  if (children === 2) return 350000;
  // 3명 이상
  return 350000 + (children - 2) * 300000;
}

// 의료비 세액공제 계산
function calculateMedicalTaxCredit(medical, totalSalary) {
  const threshold = totalSalary * 0.03;
  if (medical <= threshold) return 0;

  const creditBase = (medical - threshold) * 0.15;
  const limit = 7000000;
  return Math.min(creditBase, limit);
}

// 교육비 세액공제 계산
function calculateEducationTaxCredit(education) {
  const credit = education * 0.15;
  const limit = 9000000;
  return Math.min(credit, limit);
}

// 기부금 세액공제 계산
function calculateDonationTaxCredit(donations) {
  if (donations <= 10000000) {
    return donations * 0.15;
  } else {
    return 1500000 + (donations - 10000000) * 0.30;
  }
}

// 보장성보험료 세액공제 계산
function calculateInsuranceTaxCredit(insurance) {
  const insurable = Math.min(insurance, 1000000);
  return insurable * 0.12;
}

// 연금저축 세액공제 계산
function calculatePensionTaxCredit(pensionSaving, irp, totalSalary) {
  // 연금저축 한도: 600만원
  const pensionLimit = Math.min(pensionSaving, 6000000);

  // 연금저축 + IRP 합산 한도: 900만원
  const totalPensionAmount = Math.min(pensionLimit + irp, 9000000);

  // 세액공제율
  const creditRate = totalSalary <= 55000000 ? 0.15 : 0.12;

  return totalPensionAmount * creditRate;
}

// 월세 세액공제 계산
function calculateRentTaxCredit(monthlyRent, totalSalary) {
  if (totalSalary > 70000000) return 0;

  const rentAmount = Math.min(monthlyRent, 10000000);

  if (totalSalary <= 55000000) {
    return rentAmount * 0.17;
  } else {
    return rentAmount * 0.15;
  }
}

// 신용카드 등 소득공제 계산
function calculateCardDeduction(
  creditCard,
  debitCard,
  tradMarket,
  publicTransport,
  totalSalary
) {
  const minUsage = totalSalary * 0.25;
  const totalUsage = creditCard + debitCard + tradMarket + publicTransport;

  if (totalUsage <= minUsage) return { deduction: 0, detail: {} };

  const excess = totalUsage - minUsage;

  // 신용카드 공제 (15%)
  const creditCardDeduction = Math.min(creditCard, excess) * 0.15;
  const remainingExcess = excess - Math.min(creditCard, excess);

  // 체크카드/현금영수증 공제 (30%)
  const debitDeduction = Math.min(debitCard, remainingExcess) * 0.30;
  const remainingExcess2 = remainingExcess - Math.min(debitCard, remainingExcess);

  // 전통시장 공제 (40%)
  const tradDeduction = Math.min(tradMarket, remainingExcess2) * 0.40;
  const remainingExcess3 = remainingExcess2 - Math.min(tradMarket, remainingExcess2);

  // 대중교통 공제 (40%)
  const publicTransportDeduction = Math.min(publicTransport, remainingExcess3) * 0.40;

  let totalDeduction =
    creditCardDeduction +
    debitDeduction +
    tradDeduction +
    publicTransportDeduction;

  // 한도 적용
  let limit;
  if (totalSalary <= 70000000) {
    limit = 3000000;
  } else if (totalSalary <= 120000000) {
    limit = 2500000;
  } else {
    limit = 2000000;
  }

  // 전통시장과 대중교통 추가 한도 (각 100만원)
  const tradLimit = 1000000;
  const publicLimit = 1000000;

  const tradDeductionLimited = Math.min(tradDeduction, tradLimit);
  const publicDeductionLimited = Math.min(publicTransportDeduction, publicLimit);

  totalDeduction =
    creditCardDeduction +
    debitDeduction +
    tradDeductionLimited +
    publicDeductionLimited;
  totalDeduction = Math.min(totalDeduction, limit);

  const detail = {
    minUsage: minUsage,
    totalUsage: totalUsage,
    excess: excess,
    creditCardDeduction: creditCardDeduction,
    debitDeduction: debitDeduction,
    tradDeductionLimited: tradDeductionLimited,
    publicDeductionLimited: publicDeductionLimited,
    limit: limit,
  };

  return { deduction: totalDeduction, detail: detail };
}

// 주택 관련 공제 (청약저축 + 대출이자)
function calculateHousingDeduction(
  housingSaving,
  housingLoan,
) {
  // 주택청약저축 공제: 납입액의 40%, 연 240만원 한도
  const savingDeduction = Math.min(housingSaving * 0.40, 2400000);

  // 주택담보대출이자 공제: 간소화로 500만원 한도 적용
  const loanDeduction = Math.min(housingLoan, 5000000);

  const totalDeduction = savingDeduction + loanDeduction;

  const detail = {
    savingDeduction: savingDeduction,
    savingLimit: 2400000,
    loanDeduction: loanDeduction,
    loanLimit: 5000000,
  };

  return { deduction: totalDeduction, detail: detail };
}

// 간편한 월급세 계산 (4대보험료 포함)
function calculateSimplifiedWithheldTax(
  monthlyGross,
  monthlyInsurance,
  dependents
) {
  // 간이세액표 기준 (근사값)
  const taxableIncome = monthlyGross - monthlyInsurance;

  // 기본 세율
  let monthlyTax = 0;

  if (taxableIncome <= 1000000) {
    monthlyTax = 0;
  } else if (taxableIncome <= 2000000) {
    monthlyTax = (taxableIncome - 1000000) * 0.06;
  } else if (taxableIncome <= 3500000) {
    monthlyTax = 60000 + (taxableIncome - 2000000) * 0.08;
  } else if (taxableIncome <= 5000000) {
    monthlyTax = 180000 + (taxableIncome - 3500000) * 0.10;
  } else if (taxableIncome <= 7500000) {
    monthlyTax = 330000 + (taxableIncome - 5000000) * 0.12;
  } else {
    monthlyTax = 630000 + (taxableIncome - 7500000) * 0.14;
  }

  // 부양가족 수에 따른 감액 (간소화)
  const dependentReduction = Math.max(0, dependents - 1) * 50000;
  monthlyTax = Math.max(0, monthlyTax - dependentReduction);

  return monthlyTax;
}

// 4대보험료 계산
function calculateInsurance(salary) {
  const monthlyGross = salary / 12;

  // 국민연금: 납부 상한 월 보수 590만원
  const pensionBase = Math.min(monthlyGross, 5900000);
  const nationalPension = pensionBase * 0.045 * 12;

  // 건강보험: 월급 기준
  const healthInsurance = monthlyGross * 0.03545 * 12;

  // 장기요양보험: 건강보험의 12.95%
  const longTermCare = healthInsurance * 0.1295;

  // 고용보험: 월급 기준
  const employmentInsurance = monthlyGross * 0.009 * 12;

  return {
    nationalPension: Math.round(nationalPension),
    healthInsurance: Math.round(healthInsurance),
    longTermCare: Math.round(longTermCare),
    employmentInsurance: Math.round(employmentInsurance),
  };
}

// 통화 형식 함수 (한국 원화)
function formatCurrency(amount) {
  return Math.round(amount).toLocaleString('ko-KR') + '원';
}

// 메인 세금 계산 함수
function calculateTax(input) {
  // 기본값 설정
  const salary = input.salary || 0;
  const nonTaxable = input.nonTaxable || 0;
  const spouse = input.spouse || 0;
  const children = input.children || 0;
  const parents = input.parents || 0;
  const otherDep = input.otherDep || 0;
  const nationalPension = input.nationalPension || 0;
  const healthInsurance = input.healthInsurance || 0;
  const longTermCare = input.longTermCare || 0;
  const employmentInsurance = input.employmentInsurance || 0;
  const creditCard = input.creditCard || 0;
  const debitCard = input.debitCard || 0;
  const tradMarket = input.tradMarket || 0;
  const publicTransport = input.publicTransport || 0;
  const housingSaving = input.housingSaving || 0;
  const housingLoan = input.housingLoan || 0;
  const medical = input.medical || 0;
  const education = input.education || 0;
  const donations = input.donations || 0;
  const insurance = input.insurance || 0;
  const pensionSaving = input.pensionSaving || 0;
  const irp = input.irp || 0;
  const monthlyRent = input.monthlyRent || 0;

  // 1. 총급여 계산
  const grossSalary = salary;
  const totalSalary = salary - nonTaxable;

  // 2. 근로소득공제
  const earnedIncomeDeduction = calculateEarnedIncomeDeduction(totalSalary);
  const earnedIncome = Math.max(0, totalSalary - earnedIncomeDeduction);

  // 3. 인적공제 계산
  const basicPersonalDeduction = (1 + spouse + children + parents + otherDep) * 1500000;
  const elderlyAddition = parents * 1000000; // 70세 이상 부모 추가공제
  const personalDeduction = basicPersonalDeduction + elderlyAddition;
  const personalDeductionDetail = {
    selfAndDependents: (1 + spouse + children + parents + otherDep),
    basicDeduction: basicPersonalDeduction,
    elderlyAddition: elderlyAddition,
    totalPersonal: personalDeduction,
  };

  // 4. 4대보험료 공제
  const insuranceDeduction = nationalPension + healthInsurance + longTermCare + employmentInsurance;
  const insuranceDetail = {
    nationalPension: nationalPension,
    healthInsurance: healthInsurance,
    longTermCare: longTermCare,
    employmentInsurance: employmentInsurance,
    total: insuranceDeduction,
  };

  // 5. 신용카드 등 소득공제
  const cardResult = calculateCardDeduction(
    creditCard,
    debitCard,
    tradMarket,
    publicTransport,
    totalSalary
  );
  const cardDeduction = cardResult.deduction;
  const cardDeductionDetail = cardResult.detail;

  // 6. 주택 관련 공제
  const housingResult = calculateHousingDeduction(
    housingSaving,
    housingLoan
  );
  const housingDeduction = housingResult.deduction;
  const housingDetail = housingResult.detail;

  // 7. 전체 소득공제 합계
  const totalIncomeDeduction =
    personalDeduction +
    insuranceDeduction +
    cardDeduction +
    housingDeduction;

  // 8. 과세표준 (음수 방지)
  const taxableIncome = Math.max(0, earnedIncome - totalIncomeDeduction);

  // 9. 산출세액
  const calculatedTax = calculateCalculatedTax(taxableIncome);

  // 10. 세액공제 계산
  const earnedIncomeTaxCredit = calculateEarnedIncomeTaxCredit(
    calculatedTax,
    totalSalary
  );
  const childTaxCredit = calculateChildTaxCredit(children);
  const medicalTaxCredit = calculateMedicalTaxCredit(medical, totalSalary);
  const educationTaxCredit = calculateEducationTaxCredit(education);
  const donationTaxCredit = calculateDonationTaxCredit(donations);
  const insuranceTaxCredit = calculateInsuranceTaxCredit(insurance);
  const pensionTaxCredit = calculatePensionTaxCredit(pensionSaving, irp, totalSalary);
  const rentTaxCredit = calculateRentTaxCredit(monthlyRent, totalSalary);

  const totalTaxCredit =
    earnedIncomeTaxCredit +
    childTaxCredit +
    medicalTaxCredit +
    educationTaxCredit +
    donationTaxCredit +
    insuranceTaxCredit +
    pensionTaxCredit +
    rentTaxCredit;

  // 11. 결정세액
  const determinedTax = Math.max(0, calculatedTax - totalTaxCredit);

  // 12. 지방소득세 (결정세액의 10%)
  const localTax = Math.round(determinedTax * 0.10);

  // 13. 원천징수 (간이세액표 기준)
  const monthlyGross = totalSalary / 12;
  const monthlyInsurance = insuranceDeduction / 12;
  const dependentCount =
    1 + spouse + children + parents + otherDep;
  const monthlyWithheldTax = calculateSimplifiedWithheldTax(
    monthlyGross,
    monthlyInsurance,
    dependentCount
  );
  const withheldTax = Math.round(monthlyWithheldTax * 12);
  const withheldLocalTax = Math.round(withheldTax * 0.10);

  // 14. 환급액 계산
  const refund = Math.round(withheldTax - determinedTax);
  const localRefund = Math.round(withheldLocalTax - localTax);
  const totalRefund = refund + localRefund;
  const isRefund = totalRefund > 0;

  // 결과 객체 반환
  return {
    // 기본 계산값
    grossSalary: Math.round(grossSalary),
    totalSalary: Math.round(totalSalary),
    earnedIncomeDeduction: Math.round(earnedIncomeDeduction),
    earnedIncome: Math.round(earnedIncome),

    // 인적공제
    personalDeduction: Math.round(personalDeduction),
    personalDeductionDetail: personalDeductionDetail,

    // 4대보험료
    insuranceDeduction: Math.round(insuranceDeduction),
    insuranceDetail: insuranceDetail,

    // 신용카드 등 소득공제
    cardDeduction: Math.round(cardDeduction),
    cardDeductionDetail: cardDeductionDetail,

    // 주택 관련 공제
    housingDeduction: Math.round(housingDeduction),
    housingDetail: housingDetail,

    // 전체 소득공제
    totalIncomeDeduction: Math.round(totalIncomeDeduction),

    // 과세표준
    taxableIncome: Math.round(taxableIncome),

    // 세액 계산
    calculatedTax: Math.round(calculatedTax),

    // 세액공제 상세
    earnedIncomeTaxCredit: Math.round(earnedIncomeTaxCredit),
    childTaxCredit: Math.round(childTaxCredit),
    medicalTaxCredit: Math.round(medicalTaxCredit),
    educationTaxCredit: Math.round(educationTaxCredit),
    donationTaxCredit: Math.round(donationTaxCredit),
    insuranceTaxCredit: Math.round(insuranceTaxCredit),
    pensionTaxCredit: Math.round(pensionTaxCredit),
    rentTaxCredit: Math.round(rentTaxCredit),

    // 세액공제 합계
    totalTaxCredit: Math.round(totalTaxCredit),

    // 최종 세액
    determinedTax: Math.round(determinedTax),
    localTax: localTax,

    // 원천징수
    withheldTax: withheldTax,
    withheldLocalTax: withheldLocalTax,

    // 환급/추가납부
    refund: refund,
    localRefund: localRefund,
    totalRefund: totalRefund,
    isRefund: isRefund,
  };
}

// 개인화된 세금 절감 팁 생성
function generatePersonalizedTips(input, result) {
  const tips = [];
  const totalSalary = input.salary - (input.nonTaxable || 0);

  // 1. 신용카드 사용 최적화
  const cardMinUsage = totalSalary * 0.25;
  const totalCardUsage =
    (input.creditCard || 0) +
    (input.debitCard || 0) +
    (input.tradMarket || 0) +
    (input.publicTransport || 0);

  if (totalCardUsage < cardMinUsage) {
    tips.push({
      category: '신용카드 사용',
      title: '신용카드 사용액 부족',
      description: `총급여의 25% (${formatCurrency(cardMinUsage)})에 도달하지 못했습니다. 부족한 ${formatCurrency(cardMinUsage - totalCardUsage)}만큼 더 사용하면 공제를 받을 수 있습니다.`,
      impact: `최대 ${formatCurrency((cardMinUsage - totalCardUsage) * 0.15)}까지 절감 가능`,
      priority: 'high',
    });
  } else if (totalCardUsage >= cardMinUsage) {
    tips.push({
      category: '신용카드 사용',
      title: '신용카드 사용 최적화 중',
      description: `현재 ${formatCurrency(totalCardUsage)} 사용으로 카드 공제를 받고 있습니다.`,
      impact: `공제액: ${formatCurrency(result.cardDeduction)}`,
      priority: 'info',
    });
  }

  // 2. 체크카드/현금영수증 활용
  if ((input.debitCard || 0) < (input.creditCard || 0) * 0.3) {
    tips.push({
      category: '체크카드/현금영수증',
      title: '체크카드 비율 증가',
      description: '체크카드와 현금영수증은 신용카드보다 높은 공제율(30%)을 제공합니다. 체크카드 사용을 늘려보세요.',
      impact: `공제율 15% → 30% (추가 절감 가능)`,
      priority: 'medium',
    });
  }

  // 3. 전통시장/대중교통 활용
  const tradMarketAmount = input.tradMarket || 0;
  const publicTransportAmount = input.publicTransport || 0;

  if (tradMarketAmount === 0) {
    tips.push({
      category: '전통시장',
      title: '전통시장 이용',
      description: '전통시장은 40% 공제율로 신용카드보다 유리합니다. 최대 100만원까지 공제받을 수 있습니다.',
      impact: `최대 ${formatCurrency(1000000 * 0.40)}까지 절감 가능`,
      priority: 'medium',
    });
  }

  if (publicTransportAmount === 0) {
    tips.push({
      category: '대중교통',
      title: '대중교통 이용',
      description: '대중교통은 40% 공제율로 높은 수익을 제공합니다. 최대 100만원까지 공제받을 수 있습니다.',
      impact: `최대 ${formatCurrency(1000000 * 0.40)}까지 절감 가능`,
      priority: 'medium',
    });
  }

  // 4. 주택청약저축
  if ((input.housingSaving || 0) === 0 && totalSalary > 30000000) {
    tips.push({
      category: '주택청약저축',
      title: '주택청약저축 가입',
      description: '연간 240만원까지 납입액의 40%를 공제받을 수 있습니다. 매월 20만원만 저축해도 연간 96만원의 공제를 받습니다.',
      impact: `연 ${formatCurrency(2400000 * 0.40)} 절감 가능`,
      priority: 'high',
    });
  }

  // 5. 주택담보대출이자
  if ((input.housingLoan || 0) === 0 && totalSalary > 40000000) {
    tips.push({
      category: '주택담보대출',
      title: '주택담보대출이자 활용',
      description: '주택담보대출 이자는 연 500만원까지 전액 공제됩니다. 주택 마련 시 세제 혜택을 고려하세요.',
      impact: `최대 ${formatCurrency(5000000)}까지 공제 가능`,
      priority: 'info',
    });
  }

  // 6. 의료비 공제
  const medicalThreshold = totalSalary * 0.03;
  const medicalAmount = input.medical || 0;

  if (medicalAmount > medicalThreshold) {
    const medicalDeductible = medicalAmount - medicalThreshold;
    tips.push({
      category: '의료비',
      title: '의료비 공제 활용',
      description: `총급여의 3% (${formatCurrency(medicalThreshold)})를 초과하는 의료비 ${formatCurrency(medicalDeductible)}에 대해 15% 공제를 받고 있습니다.`,
      impact: `공제액: ${formatCurrency(result.medicalTaxCredit)}`,
      priority: 'info',
    });
  } else if (medicalAmount > 0) {
    tips.push({
      category: '의료비',
      title: '의료비 공제 임계값 미달',
      description: `의료비가 총급여의 3% (${formatCurrency(medicalThreshold)})에 도달하지 못해 공제를 받지 못하고 있습니다.`,
      impact: `${formatCurrency(medicalThreshold - medicalAmount)} 이상 필요`,
      priority: 'low',
    });
  }

  // 7. 교육비 공제
  if ((input.education || 0) > 0) {
    tips.push({
      category: '교육비',
      title: '교육비 공제 중',
      description: `교육비 ${formatCurrency(input.education)}에 대해 15% 공제를 받고 있습니다.`,
      impact: `공제액: ${formatCurrency(result.educationTaxCredit)}`,
      priority: 'info',
    });
  } else if (totalSalary > 30000000) {
    tips.push({
      category: '교육비',
      title: '교육비 공제 활용',
      description: '자녀 교육비, 본인의 직업 훈련비 등은 15% 공제를 받을 수 있습니다.',
      impact: `최대 ${formatCurrency(9000000 * 0.15)}까지 절감 가능`,
      priority: 'medium',
    });
  }

  // 8. 기부금 공제
  if ((input.donations || 0) > 0) {
    tips.push({
      category: '기부금',
      title: '기부금 공제 중',
      description: `기부금 ${formatCurrency(input.donations)}에 대해 ${input.donations > 10000000 ? '15~30%' : '15%'} 공제를 받고 있습니다.`,
      impact: `공제액: ${formatCurrency(result.donationTaxCredit)}`,
      priority: 'info',
    });
  }

  // 9. 보장성보험료
  if ((input.insurance || 0) > 0) {
    tips.push({
      category: '보장성보험료',
      title: '보장성보험료 공제 중',
      description: `최대 100만원까지의 보장성보험료에 대해 12% 공제를 받고 있습니다.`,
      impact: `공제액: ${formatCurrency(result.insuranceTaxCredit)}`,
      priority: 'info',
    });
  } else if (totalSalary > 25000000) {
    tips.push({
      category: '보장성보험료',
      title: '보장성보험료 가입',
      description: '질병/사망 보장 보험료는 최대 100만원까지 12% 공제를 받을 수 있습니다.',
      impact: `최대 ${formatCurrency(1000000 * 0.12)}까지 절감 가능`,
      priority: 'medium',
    });
  }

  // 10. 연금저축/IRP
  if (
    (input.pensionSaving || 0) > 0 ||
    (input.irp || 0) > 0
  ) {
    tips.push({
      category: '연금저축/IRP',
      title: '연금저축/IRP 공제 중',
      description: `연금저축과 IRP 합산 최대 900만원까지 ${totalSalary <= 55000000 ? '15%' : '12%'} 공제를 받고 있습니다.`,
      impact: `공제액: ${formatCurrency(result.pensionTaxCredit)}`,
      priority: 'info',
    });
  } else if (totalSalary > 30000000) {
    tips.push({
      category: '연금저축/IRP',
      title: '연금저축/IRP 가입',
      description: `연금저축은 연 600만원, IRP와 합산 900만원까지 ${totalSalary <= 55000000 ? '15%' : '12%'} 공제를 받을 수 있습니다. 장기 자산 형성에 유리합니다.`,
      impact: `최대 ${formatCurrency(9000000 * (totalSalary <= 55000000 ? 0.15 : 0.12))}까지 절감 가능`,
      priority: 'high',
    });
  }

  // 11. 월세 공제
  if ((input.monthlyRent || 0) > 0 && totalSalary <= 70000000) {
    tips.push({
      category: '월세',
      title: '월세 공제 중',
      description: `월세 ${formatCurrency(input.monthlyRent)}에 대해 ${totalSalary <= 55000000 ? '17%' : '15%'} 공제를 받고 있습니다.`,
      impact: `공제액: ${formatCurrency(result.rentTaxCredit)}`,
      priority: 'info',
    });
  } else if ((input.monthlyRent || 0) === 0 && totalSalary <= 70000000) {
    tips.push({
      category: '월세',
      title: '월세 공제 활용',
      description: `월세를 내고 있다면 연 최대 1,000만원까지 ${totalSalary <= 55000000 ? '17%' : '15%'} 공제를 받을 수 있습니다.`,
      impact: `최대 ${formatCurrency(10000000 * (totalSalary <= 55000000 ? 0.17 : 0.15))}까지 절감 가능`,
      priority: 'high',
    });
  } else if (totalSalary > 70000000) {
    tips.push({
      category: '월세',
      title: '월세 공제 대상 아님',
      description: `총급여가 7,000만원을 초과하여 월세 공제 대상이 아닙니다.`,
      impact: `공제 불가`,
      priority: 'info',
    });
  }

  // 12. 자녀 세액공제
  if (input.children > 0) {
    tips.push({
      category: '자녀',
      title: '자녀 세액공제 중',
      description: `${input.children}명의 20세 이하 자녀에 대해 세액공제를 받고 있습니다.`,
      impact: `공제액: ${formatCurrency(result.childTaxCredit)}`,
      priority: 'info',
    });
  }

  // 13. 배우자 인적공제
  if (input.spouse === 1) {
    tips.push({
      category: '배우자',
      title: '배우자 인적공제 중',
      description: '배우자에 대해 150만원의 인적공제를 받고 있습니다.',
      impact: `공제액: ${formatCurrency(1500000)} (세금 절감 약 ${formatCurrency(1500000 * 0.06)})`,
      priority: 'info',
    });
  }

  // 14. 부모 부양 공제
  if (input.parents > 0) {
    tips.push({
      category: '부모',
      title: '부모 인적공제 중',
      description: `70세 이상 부모 ${input.parents}명에 대해 추가 인적공제를 받고 있습니다.`,
      impact: `공제액: ${formatCurrency(input.parents * 1000000)} (추가 공제)`,
      priority: 'info',
    });
  }

  // 15. 비과세소득
  if ((input.nonTaxable || 0) > 0) {
    tips.push({
      category: '비과세소득',
      title: '비과세소득 포함',
      description: `${formatCurrency(input.nonTaxable)}의 비과세소득이 포함되어 있습니다. 이는 세금 계산에 포함되지 않습니다.`,
      impact: `세금 대상에서 제외됨`,
      priority: 'info',
    });
  }

  return tips;
}

// 전역 함수로 노출
window.calculateTax = calculateTax;
window.formatCurrency = formatCurrency;
window.generatePersonalizedTips = generatePersonalizedTips;
window.calculateInsurance = calculateInsurance;
