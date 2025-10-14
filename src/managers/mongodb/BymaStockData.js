import MongodbManager from '../../adapters/DAOMongodbManager';
import { formatNegotiableInstrumentToBackend } from '../_helpersDb/parseToBackend';
import { appLogger } from '../../logger';

export const syncFixtures = async () => {
  let db = await MongodbManager();
  let collection = await db.collection('byma_stock_data');
  let bymaStockDataCount = await collection.count();
  appLogger.info(`There is ${bymaStockDataCount} bymaStockData`);
  if (bymaStockDataCount === 0) {
    appLogger.info(`Adding bymaStockData ... `);
    const negotiableInstrumentsCollection = await db.collection('negotiable_instruments');
    const negotiableInstruments = await negotiableInstrumentsCollection.find({}).toArray();
    const bymaStockDataFixtures = require('../../fixtures/bymaStocksData.json');
    await collection.insertMany(
      bymaStockDataFixtures.map((elem) =>
        formatNegotiableInstrumentToBackend(elem, negotiableInstruments)
      ),
      { validate: true }
    );
    let bymaStockDataConditionOperationCount = await collection.count();
    appLogger.info(`There is ${bymaStockDataConditionOperationCount} bymaStockData`);
  } else {
    appLogger.info(`No needs to add bymaStockData`);
  }
};

export const getBymaStocksData = async (
  { offset = 0, limit = 1000 },
  sort = { date: -1 },
  query = {}
) => {
  const db = await MongodbManager();
  const collection = await db.collection('byma_stock_data');
  let bymaStockData = await collection.aggregate([
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
  bymaStockData = await bymaStockData.toArray();
  return bymaStockData;
};
