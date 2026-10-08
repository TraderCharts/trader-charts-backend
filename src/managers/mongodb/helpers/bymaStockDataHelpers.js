export const getLastValidValue = (tickerData, targetDate, maxDaysBack) => {
    const target = new Date(targetDate).getTime();
    let best = null;
    let bestDiff = Infinity;

    for (const item of tickerData) {
        const itemDate = new Date(item.date).getTime();

        if (itemDate > target) continue;

        const diff = Math.floor((target - itemDate) / (1000 * 60 * 60 * 24));

        if (diff > maxDaysBack) continue;

        const value = item.value ?? item.close;

        if (value != null && diff < bestDiff) {
            bestDiff = diff;
            best = value;
        }
    }

    return best;
};

export const getCouponRateByDate = (coupons, currentDate) => {
    let rate = 0;

    for (const coupon of coupons || []) {
        if (currentDate >= new Date(coupon.date)) {
            rate = coupon.rate;
        } else {
            break;
        }
    }

    return rate;
};

export const getDaysSinceLastCoupon = (currentDate, paymentMonths, paymentDay) => {
    let lastMonth = paymentMonths[0];

    for (let i = paymentMonths.length - 1; i >= 0; i--) {
        if (currentDate.getMonth() + 1 > paymentMonths[i]) {
            lastMonth = paymentMonths[i];
            break;
        }
    }

    let lastPayment = new Date(currentDate.getFullYear(), lastMonth - 1, paymentDay);

    if (lastPayment > currentDate) {
        lastPayment = new Date(currentDate.getFullYear() - 1, lastMonth - 1, paymentDay);
    }

    return Math.floor((currentDate - lastPayment) / (1000 * 60 * 60 * 24));
};

export const calculateResidualValue = (
    parValue,
    amortizations,
    currentDate,
    exDateOffset = 0,
    marketDates = []
) => {
    const sortedMarketDates = marketDates.map((date) => new Date(date)).sort((a, b) => a - b);

    return (amortizations || []).reduce((residual, amortization) => {
        const amortizationDate = new Date(amortization.date);
        let exDate = amortizationDate;

        if (exDateOffset > 0 && sortedMarketDates.length > 0) {
            const marketDateIndex = sortedMarketDates.findIndex((date) => date >= amortizationDate);

            if (marketDateIndex >= 0) {
                const exDateIndex = Math.max(0, marketDateIndex - exDateOffset);
                exDate = sortedMarketDates[exDateIndex];
            }
        }

        if (exDate <= currentDate) {
            return residual - parValue * (amortization.percent / 100);
        }

        return residual;
    }, parValue);
};

export const getCouponsInPeriod = (coupons, startDate, endDate) => {
    return (coupons || [])
        .map((coupon) => ({
            ...coupon,
            dateObject: new Date(coupon.date),
            rate: Number(coupon.rate),
        }))
        .filter((coupon) => coupon.dateObject > startDate && coupon.dateObject <= endDate)
        .sort((a, b) => a.dateObject - b.dateObject);
};

export const calculateAccruedInterest = (residualValue, couponRate, daysSinceLastPayment) => {
    return (residualValue * couponRate * daysSinceLastPayment) / 365;
};

export const calculateTechnicalValue = (residualValue, accruedInterest) => {
    return residualValue + accruedInterest;
};

export const calculateAnnualIncome = (coupons, amortizations, currentDate, parValue) => {
    const endDate = new Date(currentDate);
    endDate.setFullYear(endDate.getFullYear() + 1);

    const futureCoupons = getCouponsInPeriod(coupons, currentDate, endDate);

    return futureCoupons.reduce((income, coupon) => {
        const residualValue = calculateResidualValue(parValue, amortizations, coupon.dateObject);

        return income + residualValue * coupon.rate;
    }, 0);
};

export const calculateCouponIncome = (coupons, amortizations, currentDate, parValue) => {
    const nextCoupon = getCouponsInPeriod(coupons, currentDate, new Date(8640000000000000))[0];

    if (!nextCoupon) {
        return null;
    }

    const residualValue = calculateResidualValue(parValue, amortizations, nextCoupon.dateObject);

    return residualValue * nextCoupon.rate;
};

export const calculateParity = (price, technicalValue) => {
    return technicalValue > 0 ? (price / technicalValue) * 100 : null;
};

export const calculateCurrentYield = (price, residualValue, accruedInterest, annualIncome) => {
    const marketValue = (price * residualValue) / 100;
    const denominator = marketValue - accruedInterest;

    return denominator > 0 ? annualIncome / denominator : null;
};

export const calculateBondMetrics = (row, bondTerms, marketDates = []) => {
    if (!bondTerms?.parValue) return null;

    const currentDate = new Date(row.date);
    const paymentMonths = [1, 7];
    const paymentDay = 9;

    const couponRate = getCouponRateByDate(bondTerms.coupons, currentDate);

    const daysSinceLastPayment = getDaysSinceLastCoupon(currentDate, paymentMonths, paymentDay);

    const residualValue = calculateResidualValue(
        bondTerms.parValue,
        bondTerms.amortizations,
        currentDate,
        bondTerms.exDateOffset,
        marketDates
    );

    const accruedInterest = calculateAccruedInterest(
        residualValue,
        couponRate,
        daysSinceLastPayment
    );

    const technicalValue = calculateTechnicalValue(residualValue, accruedInterest);

    const annualIncome = calculateAnnualIncome(
        bondTerms.coupons,
        bondTerms.amortizations,
        currentDate,
        bondTerms.parValue
    );

    const couponIncome = calculateCouponIncome(
        bondTerms.coupons,
        bondTerms.amortizations,
        currentDate,
        bondTerms.parValue
    );

    return {
        residualValue,
        accruedInterest,
        technicalValue,
        couponRate,
        annualIncome,
        couponIncome,

        price: {
            open: row.open,
            high: row.high,
            low: row.low,
            close: row.close,
        },

        parity: {
            open: calculateParity(row.open, technicalValue),
            high: calculateParity(row.high, technicalValue),
            low: calculateParity(row.low, technicalValue),
            close: calculateParity(row.close, technicalValue),
        },

        currentYield: {
            open: calculateCurrentYield(row.open, residualValue, accruedInterest, annualIncome),
            high: calculateCurrentYield(row.high, residualValue, accruedInterest, annualIncome),
            low: calculateCurrentYield(row.low, residualValue, accruedInterest, annualIncome),
            close: calculateCurrentYield(row.close, residualValue, accruedInterest, annualIncome),
        },
    };
};

export const formatDate = (date) => {
    return date instanceof Date ? date.toISOString().split("T")[0] : date;
};

export const buildBaseData = (tradingDay) => {
    const priceData = {
        open: tradingDay.open,
        high: tradingDay.high,
        low: tradingDay.low,
        close: tradingDay.close,
    };

    const previousClose =
        tradingDay.previousClose !== undefined && tradingDay.previousClose !== null
            ? Number(tradingDay.previousClose)
            : null;

    const close = Number(tradingDay.close);

    const dailyChange =
        previousClose !== null && !Number.isNaN(close) ? close - previousClose : null;

    const dailyChangePercent =
        previousClose !== null && previousClose !== 0 && !Number.isNaN(close)
            ? (dailyChange / previousClose) * 100
            : null;

    return {
        ticker: tradingDay.ticker,
        source: tradingDay.source,
        negotiableInstrumentId: tradingDay.negotiableInstrumentId,

        date: formatDate(tradingDay.date),

        open: tradingDay.open,
        high: tradingDay.high,
        low: tradingDay.low,
        close: tradingDay.close,
        volume: tradingDay.volume,

        previousClose,
        previousDate: tradingDay.previousDate ? formatDate(tradingDay.previousDate) : null,

        dailyChange,
        dailyChangePercent,

        price: priceData,

        residualValue: null,
        accruedInterest: null,
        technicalValue: null,
        couponRate: null,
        annualIncome: null,
        couponIncome: null,

        parity: {
            open: null,
            high: null,
            low: null,
            close: null,
        },

        currentYield: {
            open: null,
            high: null,
            low: null,
            close: null,
        },
    };
};

export const getBondTermsByInstrument = async (database) => {
    const allBondTerms = await database.collection("bond_terms").find({}).toArray();

    const bondTermsByInstrumentId = {};

    allBondTerms.forEach((bondTerm) => {
        bondTermsByInstrumentId[bondTerm._id.toString()] = bondTerm;
    });

    return bondTermsByInstrumentId;
};

export const enrichWithBondMetrics = (rawData, bondTermsByInstrumentId) => {
    const marketDates = rawData.map((tradingDay) => tradingDay.date);

    return rawData.map((tradingDay) => {
        const bondTermsId = tradingDay.negotiableInstrument?.bondTermsId;

        const bondTerms = bondTermsId ? bondTermsByInstrumentId[bondTermsId.toString()] : null;

        const baseData = buildBaseData(tradingDay);

        if (!bondTerms) {
            return baseData;
        }

        const quoteCurrency = tradingDay.negotiableInstrument?.quoteCurrency;

        const emissionCurrency = bondTerms.currencyEmission;

        if (quoteCurrency !== emissionCurrency) {
            return baseData;
        }

        const metrics = calculateBondMetrics(tradingDay, bondTerms, marketDates);

        return metrics
            ? {
                  ...baseData,
                  ...metrics,
              }
            : baseData;
    });
};
