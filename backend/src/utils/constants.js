const BASE_EXP_PER_PAGE = 0.05;
const BASE_EXP_PER_COIN = 0.2;
const EXP_RATE_REDUCTION_FACTOR = 0.5;
const MIN_EXP_PER_COIN = 1e-9;
const dailyRewardsData = [
    { day: 1, type: 'Xu', amount: 30 }, { day: 2, type: 'Xu', amount: 50 },
    { day: 3, type: 'Xu', amount: 60 }, { day: 4, type: 'Xu', amount: 70 },
    { day: 5, type: 'Xu', amount: 100 }, { day: 6, type: 'Xu', amount: 120 },
    { day: 7, type: 'Xu', amount: 200 },
];

module.exports = {
    BASE_EXP_PER_PAGE,
    BASE_EXP_PER_COIN,
    EXP_RATE_REDUCTION_FACTOR,
    MIN_EXP_PER_COIN,
    dailyRewardsData
};