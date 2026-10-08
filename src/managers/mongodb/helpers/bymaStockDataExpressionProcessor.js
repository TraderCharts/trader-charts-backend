import { getLastValidValue } from "./bymaStockDataHelpers";

const MAX_DAYS_BACK = 5;

export const parseExpression = (expression) => {
    const pattern =
        /([A-Z0-9]+)\.(price|parity|currentYield|residualValue|technicalValue|accruedInterest|annualIncome|couponIncome)(?:\.(open|high|low|close))?/g;
    const components = [];
    let match;

    while ((match = pattern.exec(expression)) !== null) {
        components.push({
            ticker: match[1],
            metric: match[2],
            subMetric: match[3] || null,
            fullMatch: match[0],
            hasMultipleFields: ["price", "parity", "currentYield"].includes(match[2]) && !match[3],
        });
    }
    return components;
};

export const formatTickerDataForExpression = (rawData, component) => {
    if (component.hasMultipleFields) {
        return rawData.map((day) => ({
            date: day.date,
            value: day[component.metric],
            volume: day.volume,
            hasMultipleFields: true,
        }));
    }

    const specificField = component.subMetric || "close";
    return rawData.map((day) => ({
        date: day.date,
        value: day[component.metric]?.[specificField] ?? day[component.metric],
        volume: day.volume,
        hasMultipleFields: false,
    }));
};

export const collectAllTradingDates = (tickerHistoricalData) => {
    const allDates = new Set();
    for (const ticker in tickerHistoricalData) {
        tickerHistoricalData[ticker].forEach((day) => allDates.add(day.date));
    }
    return Array.from(allDates).sort();
};

export const evaluateExpression = (expression, values) => {
    let resultExpression = expression;
    for (const [key, value] of Object.entries(values)) {
        if (typeof value === "object" && value !== null) return null;
        const regex = new RegExp(key.replace(/\./g, "\\."), "g");
        resultExpression = resultExpression.replace(regex, value);
    }

    const validCharacters = /^[0-9+\-*/^()\s\.]+$/;
    if (!validCharacters.test(resultExpression)) return null;

    try {
        const evaluator = new Function(
            `"use strict"; return (${resultExpression.replace(/\^/g, "**")})`
        );
        return evaluator();
    } catch {
        return null;
    }
};

export const processSingleTicker = (expression, component, tickerData) => {
    if (expression.trim() === component.fullMatch) {
        return tickerData.map((day) => ({
            date: day.date,
            open: day[component.metric]?.open,
            high: day[component.metric]?.high,
            low: day[component.metric]?.low,
            close: day[component.metric]?.close,
            volume: day.volume,
        }));
    }

    const results = [];
    for (const day of tickerData) {
        const priceData = day[component.metric];
        if (!priceData) continue;

        const resultForDay = { date: day.date, volume: day.volume };
        for (const priceField of ["open", "high", "low", "close"]) {
            const expressionWithValue = expression.replace(
                component.fullMatch,
                priceData[priceField]
            );
            resultForDay[priceField] = evaluateExpression(expressionWithValue, {});
        }
        results.push(resultForDay);
    }
    return results;
};

const calculateMultiFieldForDate = (
    expression,
    currentDate,
    tickerHistoricalData,
    expressionComponents
) => {
    let totalVolume = 0;
    const fieldValues = { open: {}, high: {}, low: {}, close: {} };
    let missingData = false;
    const priceFields = ["open", "high", "low", "close"];

    for (const priceField of priceFields) {
        for (const component of expressionComponents) {
            const tickerData = tickerHistoricalData[component.ticker];
            const exactMatch = tickerData.find((day) => day.date === currentDate);
            let value = null;

            if (exactMatch) {
                value =
                    component.hasMultipleFields && typeof exactMatch.value === "object"
                        ? exactMatch.value[priceField]
                        : exactMatch.value;
                totalVolume += exactMatch.volume || 0;
            } else {
                const closestValidValue = getLastValidValue(tickerData, currentDate, MAX_DAYS_BACK);
                if (closestValidValue !== null) {
                    value =
                        component.hasMultipleFields && typeof closestValidValue === "object"
                            ? closestValidValue[priceField]
                            : closestValidValue;
                    totalVolume += tickerData.find((day) => day.date === currentDate)?.volume || 0;
                } else {
                    missingData = true;
                }
            }

            if (value === null || value === undefined) missingData = true;
            fieldValues[priceField][component.fullMatch] = value;
        }
    }

    if (missingData) {
        const defaultValue = expression.includes("*") || expression.includes("/") ? 1 : 0;
        for (const priceField of priceFields) {
            for (const component of expressionComponents) {
                if (fieldValues[priceField][component.fullMatch] == null) {
                    fieldValues[priceField][component.fullMatch] = defaultValue;
                }
            }
        }
    }

    const resultForDate = { date: currentDate, volume: totalVolume };
    for (const priceField of priceFields) {
        const result = evaluateExpression(expression, fieldValues[priceField]);
        resultForDate[priceField] = result !== null && isFinite(result) ? result : null;
    }

    return resultForDate.open !== null ||
        resultForDate.high !== null ||
        resultForDate.low !== null ||
        resultForDate.close !== null
        ? resultForDate
        : null;
};

const calculateSingleFieldForDate = (
    expression,
    currentDate,
    tickerHistoricalData,
    expressionComponents
) => {
    const fieldValues = {};
    let missingData = false;
    let totalVolume = 0;

    for (const component of expressionComponents) {
        const tickerData = tickerHistoricalData[component.ticker];
        const exactMatch = tickerData.find((day) => day.date === currentDate);
        let value = null;

        if (exactMatch) {
            value = exactMatch.value;
            totalVolume += exactMatch.volume || 0;
        } else {
            const closestValidValue = getLastValidValue(tickerData, currentDate, MAX_DAYS_BACK);
            if (closestValidValue !== null) {
                value = closestValidValue;
                totalVolume += tickerData.find((day) => day.date === currentDate)?.volume || 0;
            } else {
                missingData = true;
            }
        }

        if (value == null) missingData = true;
        fieldValues[component.fullMatch] = value;
    }

    if (missingData) {
        const defaultValue = expression.includes("*") || expression.includes("/") ? 1 : 0;
        for (const component of expressionComponents) {
            if (fieldValues[component.fullMatch] == null) {
                fieldValues[component.fullMatch] = defaultValue;
            }
        }
    }

    const result = evaluateExpression(expression, fieldValues);
    if (result !== null && isFinite(result)) {
        return {
            date: currentDate,
            open: result,
            high: result,
            low: result,
            close: result,
            volume: totalVolume,
        };
    }
    return null;
};

/**
 * Calculates expression values for each date in the sorted dates list
 */
export const calculateForEachDate = (
    expression,
    sortedDates,
    tickerHistoricalData,
    expressionComponents
) => {
    const expressionHasNumbers = /\d+/.test(expression.replace(/[A-Z0-9]+\.[a-zA-Z]+/g, ""));
    const allComponentsHaveMultipleFields = expressionComponents.every((c) => c.hasMultipleFields);

    const results = [];

    for (const currentDate of sortedDates) {
        if (allComponentsHaveMultipleFields || expressionHasNumbers) {
            const anyComponentHasMultipleFields = expressionComponents.some(
                (c) => c.hasMultipleFields
            );

            if (anyComponentHasMultipleFields) {
                const result = calculateMultiFieldForDate(
                    expression,
                    currentDate,
                    tickerHistoricalData,
                    expressionComponents
                );
                if (result) results.push(result);
            } else {
                const result = calculateSingleFieldForDate(
                    expression,
                    currentDate,
                    tickerHistoricalData,
                    expressionComponents
                );
                if (result) results.push(result);
            }
        } else {
            const result = calculateSingleFieldForDate(
                expression,
                currentDate,
                tickerHistoricalData,
                expressionComponents
            );
            if (result) results.push(result);
        }
    }

    return results;
};
