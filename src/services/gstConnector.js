// Mock GST Connector Service

const PROFILES = {
  HIGH_TRUST: {
    gstActive: true,
    totalFilings: 24,
    filingsOnTime: 23,
    lateFilings: 1,
    filingConsistency: 95.8
  },
  MEDIUM_TRUST: {
    gstActive: true,
    totalFilings: 24,
    filingsOnTime: 19,
    lateFilings: 5,
    filingConsistency: 79.2
  },
  AT_RISK: {
    gstActive: true,
    totalFilings: 24,
    filingsOnTime: 14,
    lateFilings: 10,
    filingConsistency: 58.3
  }
};

/**
 * Deterministically maps any GST number or input to one of three profiles:
 * HIGH_TRUST, MEDIUM_TRUST, or AT_RISK.
 */
function getProfileKey(gstNumber) {
  if (!gstNumber) return 'MEDIUM_TRUST';
  const upper = String(gstNumber).toUpperCase();

  if (upper.includes('HIGH') || upper.includes('33ABCDE1234F1Z5') || upper.endsWith('1') || upper.endsWith('5')) {
    return 'HIGH_TRUST';
  }
  if (upper.includes('RISK') || upper.includes('AT_RISK') || upper.includes('LOW') || upper.endsWith('3') || upper.endsWith('9')) {
    return 'AT_RISK';
  }
  if (upper.includes('MED') || upper.includes('MEDIUM') || upper.endsWith('2') || upper.endsWith('4')) {
    return 'MEDIUM_TRUST';
  }

  // Fallback hash for deterministic mapping of arbitrary GST numbers
  let hash = 0;
  for (let i = 0; i < upper.length; i++) {
    hash = (hash << 5) - hash + upper.charCodeAt(i);
    hash |= 0;
  }
  const mod = Math.abs(hash) % 3;
  if (mod === 0) return 'HIGH_TRUST';
  if (mod === 1) return 'MEDIUM_TRUST';
  return 'AT_RISK';
}

/**
 * Returns realistic simulated GST data based on the provided GST number.
 * @param {string} gstNumber 
 * @returns {object} Simulated GST data
 */
function getGSTData(gstNumber) {
  const targetGst = gstNumber ? String(gstNumber).trim() : 'UNKNOWN';
  const profileKey = getProfileKey(targetGst);
  const profile = PROFILES[profileKey];

  return {
    gstNumber: targetGst,
    gstActive: profile.gstActive,
    filingConsistency: profile.filingConsistency,
    filingsOnTime: profile.filingsOnTime,
    totalFilings: profile.totalFilings,
    lateFilings: profile.lateFilings
  };
}

module.exports = {
  getGSTData
};
