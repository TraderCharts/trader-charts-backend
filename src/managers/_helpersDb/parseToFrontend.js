export const formatObjectIdToFrontend = (elem) => {
    const res = {
        ...elem,
        id: elem._id,
    };
    delete res._id;
    return res;
};
export const formatNegotiableInstrumentToFrontend = (negotiableInstrumentData) => {
    return {
        id: negotiableInstrumentData.id,
        ticker: negotiableInstrumentData.code,
        name: negotiableInstrumentData.name,
        icon: negotiableInstrumentData.icon,
    };
};

export const formatAlertToFrontend = (alert) => {
    return {
        id: alert.id,
        description: alert.description,
        sourceNegotiableInstrumentId: alert.sourceNegotiableInstrumentId,
        parameter1: alert.conditionExpression1Id,
        condition: alert.conditionOperationId,
        parameter2: alert.conditionExpression2Id,
        targetTickers:
            alert.negotiable_instruments &&
            alert.negotiable_instruments.map((ni) => ni.targetNegotiableInstrumentId),
        userId: alert.userId,
        active: alert.active,
        ringing: alert.ringing,
    };
};
