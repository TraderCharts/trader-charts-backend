import express from 'express';
import { getOffsetByQuery, getLimit } from './_helpersControllers/URLQueryHelpers';
import { appLogger } from '../logger';

class IndicatorsRouter {
  constructor(app) {
    this._router = express.Router();
    this._indicator;
    if (process.env.DB_DIALECT === 'mongodb') {
      this._indicator = require('../managers/mongodb/Indicator');
      appLogger.info('Loading Mongodb...');
    } else {
      this._indicator = require('../managers/sequelizeSQL/Indicator').default();
      appLogger.info('Loading Sequelize...');
    }
    app.use('/indicators', this._router);
    appLogger.info('IndicatorsRouter Loaded!');
  }

  getRouter() {
    return this._router;
  }

  getIndicators = async (req, res) => {
    const indicators = await this._indicator.getIndicators();
    return res.json(indicators);
  };
}

export default IndicatorsRouter;
