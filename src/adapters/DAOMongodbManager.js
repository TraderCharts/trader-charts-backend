import { MongoClient, ServerApiVersion } from 'mongodb';
import * as User from '../managers/mongodb/User';
import * as NegotiableInstrumentType from '../managers/mongodb/NegotiableInstrumentType';
import * as NegotiableInstrument from '../managers/mongodb/NegotiableInstrument';
import * as AlertConditionExpression from '../managers/mongodb/AlertConditionExpression';
import * as AlertConditionOperation from '../managers/mongodb/AlertConditionOperation';
import * as Alert from '../managers/mongodb/Alert';
import * as AlertsTargetNegotiableInstruments from '../managers/mongodb/AlertsTargetNegotiableInstruments';
import * as BymaStockData from '../managers/mongodb/BymaStockData';
import * as Indicators from '../managers/mongodb/Indicator';
import { appLogger } from '../logger';

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const uri = process.env.MONGODB_URI || '';
const shouldConnectToDB = process.env.GENERATE_OPENAPI !== 'true';

const client = () => {
  appLogger.info('Database Name: ', uri);
  return new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });
};

const MongodbManager = async () => {
  try {
    const connection = await client().connect();
    let db = connection.db(process.env.DB_NAME);
    return db;
  } catch (e) {
    console.error(e);
  }
};

const sync = async () => {
  // create all tables
  try {
    appLogger.info('Adding fixtures on Mongodb ...');
    appLogger.info('ºSyncing fixtures is async operation, so there is no order');
    await User.syncFixtures();
    await NegotiableInstrumentType.syncFixtures();
    await NegotiableInstrument.syncFixtures();
    await AlertConditionExpression.syncFixtures();
    await AlertConditionOperation.syncFixtures();
    await Indicators.syncFixtures();
    if (process.env.NODE_ENV === 'development') {
      await Alert.syncFixtures();
      await AlertsTargetNegotiableInstruments.syncFixtures();
      await BymaStockData.syncFixtures();
    }
    appLogger.info('\nFixtures Added!');
  } catch (e) {
    console.error('Unable to sync');
  }
};

let DAOMongodbManagerPromise = null;
const DAOMongodbManagerSingleton = () => {
  if (!DAOMongodbManagerPromise) {
    DAOMongodbManagerPromise = (async () => {
      const db = await MongodbManager();
      console.log('process.env.NODE_ENV', process.env.NODE_ENV);
      console.log('process.env.LOAD_MOCK_DATA', process.env.LOAD_MOCK_DATA);
      if (process.env.NODE_ENV !== 'production' && process.env.LOAD_MOCK_DATA === 'true') {
        appLogger.info('Syncing...');
        sync().catch((err) => console.error('Sync failed', err));
      }
      return db;
    })();
  }
  return DAOMongodbManagerPromise;
};
export default DAOMongodbManagerSingleton;
