import MongodbManager from '../../adapters/DAOMongodbManager';
import { ObjectId } from 'mongodb';
import { formatNegotiableInstrumentToFrontend } from '../_helpersDb/parseToFrontend';
import { appLogger } from '../../logger';

export const syncFixtures = async () => {
  const db = await MongodbManager();
  const collection = await db.collection('negotiable_instruments');
  let negotiableInstrumentCount = await collection.count();
  appLogger.info(`There is ${negotiableInstrumentCount} negotiableInstruments`);
  if (negotiableInstrumentCount === 0) {
    appLogger.info(`Adding negotiableInstruments ... `);
    let negotiableInstrumentFixtures = require('../../fixtures/negotiableInstruments.json');
    negotiableInstrumentFixtures = negotiableInstrumentFixtures.map(async (elem) => {
      const negotiableInstrumentTypesCollection = await db.collection(
        'negotiable_instrument_types'
      );
      const negotiableInstrumentTypesQuery = { id: elem.typeId };
      let negotiableInstrumentType = await negotiableInstrumentTypesCollection.findOne(
        negotiableInstrumentTypesQuery
      );
      appLogger.info('negotiableInstrumentType', negotiableInstrumentType);
      let newElem = { ...elem, _id: new ObjectId(elem.id), typeId: negotiableInstrumentType._id };
      return newElem;
    });
    negotiableInstrumentFixtures = await Promise.all(negotiableInstrumentFixtures);
    appLogger.info('negotiableInstrumentFixtures', negotiableInstrumentFixtures);
    await collection.insertMany(negotiableInstrumentFixtures);
    negotiableInstrumentCount = await collection.count();
    appLogger.info(`There is ${negotiableInstrumentCount} negotiableInstruments`);
  } else {
    appLogger.info(`No needs to add negotiableInstruments`);
  }
};

export const getNegotiableInstruments = async (
  { offset = 0, limit = 1000 },
  sort = { name: 1 },
  query = {}
) => {
  const db = await MongodbManager();
  const collection = await db.collection('negotiable_instruments');
  let negotiableInstruments = await collection.aggregate([
    { $sort: sort },
    { $skip: offset },
    { $limit: limit },
    {
      $addFields: {
        id: '$_id',
      },
    },
    { $unset: '_id' },
  ]);
  negotiableInstruments = await negotiableInstruments.toArray();
  negotiableInstruments = negotiableInstruments.map((elem) =>
    formatNegotiableInstrumentToFrontend(elem)
  );
  return negotiableInstruments;
};
