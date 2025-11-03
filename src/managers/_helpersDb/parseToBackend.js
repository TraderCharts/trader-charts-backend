export const formatAlertToBackend = (alert) => {
    const newAlert = {
        id: alert.id,
        description: alert.description,
        active: alert.active,
        ringing: alert.ringing,
        conditionExpression1Id: alert.parameter1,
        conditionOperationId: alert.condition,
        conditionExpression2Id: alert.parameter2,
        sourceNegotiableInstrumentId: alert.sourceNegotiableInstrumentId,
        userId: alert.userId,
    };
    return newAlert;
};

export const formatNegotiableInstrumentToBackend = (bymaStockData, negotiableInstruments) => {
    const newNegotiableInstrument = negotiableInstruments.find(
        (elem) => elem.code === bymaStockData.ticker
    );
    if (!newNegotiableInstrument)
        console.error("Ticker not present in negotiableInstruments: ", bymaStockData.ticker);
    return {
        ticker: bymaStockData.ticker,
        date: bymaStockData.date,
        expiration: bymaStockData.expiration,
        type: bymaStockData.type,
        close: bymaStockData.close,
        variation: bymaStockData.variation,
        open: bymaStockData.open,
        high: bymaStockData.high,
        low: bymaStockData.low,
        volume: bymaStockData.volume,
        amount: bymaStockData.amount,
        userId: bymaStockData.userId,
        negotiableInstrumentId: newNegotiableInstrument.id,
    };
};
