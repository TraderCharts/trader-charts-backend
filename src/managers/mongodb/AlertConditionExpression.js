import MongodbManager from '../../adapters/DAOMongodbManager';
import { appLogger } from '../../logger';

export const syncFixtures = async () => {
  let db = await MongodbManager();
  let collection = await db.collection('alert_condition_expressions');
  let alertConditionExpressionCount = await collection.count();
  appLogger.info(`There is ${alertConditionExpressionCount} negotiableInstrumentTypes`);
  if (alertConditionExpressionCount === 0) {
    appLogger.info(`Adding alertConditionExpression ... `);
    const alertConditionExpressionFixtures = require('../../fixtures/alertConditionExpressions.json');
    await collection.insertMany(alertConditionExpressionFixtures);
    alertConditionExpressionCount = await collection.count();
    appLogger.info(`There is ${alertConditionExpressionCount} negotiableInstrumentTypes`);
  } else {
    appLogger.info(`No needs to add alertConditionExpressions`);
  }
};

export const getAlertConditionExpressions = async () => {
  const db = await MongodbManager();
  const collection = await db.collection('alert_condition_expressions');
  let alertConditionExpressions = await collection.aggregate([
    {
      $addFields: {
        id: '$_id',
      },
    },
    { $unset: '_id' },
  ]);
  alertConditionExpressions = await alertConditionExpressions.toArray();
  return alertConditionExpressions;
};
