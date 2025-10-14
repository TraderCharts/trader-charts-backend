import MongodbManager from '../../adapters/DAOMongodbManager';
import { ObjectId } from 'mongodb';
import { appLogger } from '../../logger';

export const syncFixtures = async () => {
  let db = await MongodbManager();
  let collection = await db.collection('alerts_target_negotiable_instruments');
  let alertsTargetNegotiableInstrumentsCount = await collection.count();
  appLogger.info(
    `There is ${alertsTargetNegotiableInstrumentsCount} alertsTargetNegotiableInstruments`
  );
  if (alertsTargetNegotiableInstrumentsCount === 0) {
    appLogger.info(`Adding alertsTargetNegotiableInstruments ... `);
    let alertsTargetNegotiableInstrumentFixtures = require('../../fixtures/alertsTargetNegotiableInstrument.json');
    alertsTargetNegotiableInstrumentFixtures = alertsTargetNegotiableInstrumentFixtures.map(
      async (elem) => {
        const aCollection = await db.collection('alerts');
        const niCollection = await db.collection('negotiable_instruments');
        const aQuery = { id: elem.alertId };
        const niQuery = { id: elem.targetNegotiableInstrumentId };
        const a = await aCollection.findOne(aQuery);
        const ni = await niCollection.findOne(niQuery);
        let newElem = {
          ...elem,
          _id: new ObjectId(elem.id),
          alertId: a._id,
          targetNegotiableInstrumentId: ni._id,
        };
        return newElem;
      }
    );
    alertsTargetNegotiableInstrumentFixtures = await Promise.all(
      alertsTargetNegotiableInstrumentFixtures
    );
    await collection.insertMany(alertsTargetNegotiableInstrumentFixtures);
    let alertsTargetNegotiableInstrumentsCount = await collection.count();
    appLogger.info(
      `There is ${alertsTargetNegotiableInstrumentsCount} alertsTargetNegotiableInstruments`
    );
  } else {
    appLogger.info(`No needs to add alertsTargetNegotiableInstruments`);
  }
};

export const getAlertsTargetNegotiableInstruments = async ({ offset = 0, limit = 1000 }, query) => {
  const db = await MongodbManager();
  const collection = await db.collection('alerts_target_negotiable_instruments');
  let negotiableInstrumentsData = await collection.aggregate([
    { $skip: offset },
    { $limit: limit },
    {
      $addFields: {
        id: '$_id',
      },
    },
    { $unset: '_id' },
  ]);
  negotiableInstrumentsData = await negotiableInstrumentsData.toArray();
  return negotiableInstrumentsData;
};
export const createAlertsTargetNegotiableInstrument = async (data) => {
  const db = await MongodbManager();
  const collection = await db.collection('alerts_target_negotiable_instruments');
  const newDocument = {
    alertId: new ObjectId(data.alertId),
    targetNegotiableInstrumentId: new ObjectId(data.targetNegotiableInstrumentId),
  };
  const createdAlert = await collection.insertOne(newDocument);
  return createdAlert;
};
