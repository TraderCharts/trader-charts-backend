import MongodbManager from '../../adapters/DAOMongodbManager';
import { appLogger } from '../../logger';

export const syncFixtures = async () => {
  let db = await MongodbManager();
  let collection = await db.collection('alert_condition_operations');
  let alertConditionOperationCount = await collection.count();
  appLogger.info(`There is ${alertConditionOperationCount} alertConditionOperations`);
  if (alertConditionOperationCount === 0) {
    appLogger.info(`Adding alertConditionOperation ... `);
    const alertConditionOperationFixtures = require('../../fixtures/alertConditionOperations.json');
    await collection.insertMany(alertConditionOperationFixtures);
    let alertConditionOperationCount = await collection.count();
    appLogger.info(`There is ${alertConditionOperationCount} alertConditionOperations`);
  } else {
    appLogger.info(`No needs to add alertConditionOperations`);
  }
};

export const getAlertConditionOperations = async () => {
  const db = await MongodbManager();
  const collection = await db.collection('alert_condition_operations');
  let alertConditionOperations = await collection.aggregate([
    {
      $addFields: {
        id: '$_id',
      },
    },
    { $unset: '_id' },
  ]);
  alertConditionOperations = await alertConditionOperations.toArray();
  return alertConditionOperations;
};
