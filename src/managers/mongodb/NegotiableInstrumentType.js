import MongodbManager from '../../adapters/DAOMongodbManager';
import usersFixtures from '../../fixtures/users.json';
import { ObjectId } from 'mongodb';
import { appLogger } from '../../logger';

export const syncFixtures = async () => {
  const db = await MongodbManager();
  const collection = await db.collection('negotiable_instrument_types');
  let negotiableInstrumentTypeCount = await collection.count();
  appLogger.info(`There is ${negotiableInstrumentTypeCount} negotiableInstrumentTypes`);
  if (negotiableInstrumentTypeCount === 0) {
    appLogger.info(`Adding negotiableInstrumentTypes ... `);
    let negotiableInstrumentTypesFixtures = require('../../fixtures/negotiableInstrumentTypes.json');
    negotiableInstrumentTypesFixtures = negotiableInstrumentTypesFixtures.map((elem) => {
      let newElem = { ...elem, _id: new ObjectId(elem.id) };
      return newElem;
    });
    await collection.insertMany(negotiableInstrumentTypesFixtures);
    negotiableInstrumentTypeCount = await collection.count();
    appLogger.info(`There is ${negotiableInstrumentTypeCount} negotiableInstrumentTypes`);
  } else {
    appLogger.info(`No needs to add negotiableInstrumentTypes`);
  }
};
export const getNegotiableInstrumentTypes = async () => {
  const db = await MongodbManager();
  const collection = await db.collection('negotiable_instrument_types');
  let negotiableInstrumentTypes = await collection.aggregate([
    {
      $addFields: {
        id: '$_id',
      },
    },
    { $unset: '_id' },
  ]);
  negotiableInstrumentTypes = await negotiableInstrumentTypes.toArray();
  return negotiableInstrumentTypes;
};
