// Mock Account Aggregator (AA) Connector Service

const PROFILES = {
  HIGH_TRUST: {
    monthlyInflows: [820000, 850000, 790000, 910000, 840000, 860000]
  },
  MEDIUM_TRUST: {
    monthlyInflows: [650000, 480000, 720000, 510000, 680000, 590000]
  },
  AT_RISK: {
    monthlyInflows: [450000, 120000, 580000, 90000, 310000, 150000]
  }
};

/**
 * Calculates cash flow stability percentage (0 to 100) based on coefficient of variation.
 * @param {number[]} inflows 
 * @returns {number} Stability score rounded to 1 decimal place
 */
function calculateStability(inflows) {
  if (!inflows || inflows.length === 0) return 0;
  const mean = inflows.reduce((sum, val) => sum + val, 0) / inflows.length;
  if (mean === 0) return 0;

  const variance = inflows.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / inflows.length;
  const stdDev = Math.sqrt(variance);
  const cv = stdDev / mean; // Coefficient of variation

  const stability = Math.max(0, Math.min(100, (1 - cv) * 100));
  return Math.round(stability * 10) / 10;
}

/**
 * Deterministically maps unitId to a profile key.
 */
function getProfileKey(unitId) {
  if (!unitId) return 'MEDIUM_TRUST';
  const str = String(unitId).toUpperCase();

  if (str.includes('HIGH') || str.includes('U001') || str.endsWith('1') || str.endsWith('5')) {
    return 'HIGH_TRUST';
  }
  if (str.includes('RISK') || str.includes('AT_RISK') || str.includes('LOW') || str.includes('U003') || str.endsWith('3') || str.endsWith('9')) {
    return 'AT_RISK';
  }
  if (str.includes('MED') || str.includes('MEDIUM') || str.includes('U002') || str.endsWith('2') || str.endsWith('4')) {
    return 'MEDIUM_TRUST';
  }

  // Fallback hash for arbitrary unit IDs
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const mod = Math.abs(hash) % 3;
  if (mod === 0) return 'HIGH_TRUST';
  if (mod === 1) return 'MEDIUM_TRUST';
  return 'AT_RISK';
}

/**
 * Returns simulated bank data from Account Aggregator connector for a given unitId.
 * @param {string} unitId 
 * @returns {object} Simulated bank flow data
 */
function getBankData(unitId) {
  const targetUnit = unitId ? String(unitId).trim() : 'UNKNOWN';
  const profileKey = getProfileKey(targetUnit);
  const inflows = PROFILES[profileKey].monthlyInflows;

  const monthsAnalyzed = 6;
  const totalInflow = inflows.reduce((acc, val) => acc + val, 0);
  const averageMonthlyInflow = Math.round(totalInflow / monthsAnalyzed);
  const cashFlowStability = calculateStability(inflows);

  return {
    unitId: targetUnit,
    monthsAnalyzed,
    averageMonthlyInflow,
    monthlyInflows: inflows,
    cashFlowStability
  };
}

module.exports = {
  getBankData
};
