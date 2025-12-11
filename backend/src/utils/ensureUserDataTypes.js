const ensureUserDataTypes = (userData) => {
    if (!userData) return null;
    const safeData = { ...userData };

    try {
        safeData.exp = parseFloat(safeData.exp || 0);
        if (isNaN(safeData.exp)) safeData.exp = 0;
    } catch (e) {
        safeData.exp = 0;
    }

    try {
        if (typeof safeData.addresses === 'string') {
           safeData.addresses = JSON.parse(safeData.addresses || '[]');
        }
        if (!Array.isArray(safeData.addresses)) safeData.addresses = [];
    } catch(e) {
        console.error("Error parsing addresses:", e, "Original value:", safeData.addresses);
        safeData.addresses = [];
    }
    
    safeData.avatarUrl = String(safeData.avatarUrl || 'https://via.placeholder.com/150');

    safeData.level = parseInt(safeData.level || 1);
    if (isNaN(safeData.level)) safeData.level = 1;

    safeData.coinBalance = parseInt(safeData.coinBalance || 0);
     if (isNaN(safeData.coinBalance)) safeData.coinBalance = 0;

    safeData.consecutiveLoginDays = parseInt(safeData.consecutiveLoginDays || 0);
     if (isNaN(safeData.consecutiveLoginDays)) safeData.consecutiveLoginDays = 0;

    if (typeof safeData.id !== 'undefined' && typeof safeData.id !== 'string') {
        safeData.id = String(safeData.id);
    }

    return safeData;
};

module.exports = ensureUserDataTypes;