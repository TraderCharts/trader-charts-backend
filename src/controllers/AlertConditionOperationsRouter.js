import express from 'express';
import { getOffsetByQuery, getLimit } from './_helpersControllers/URLQueryHelpers';
import { appLogger } from '../logger';

class AlertConditionOperationsRouter {
  constructor(app) {
    this._router = express.Router();
    this._alertConditionOperation;
    if (process.env.DB_DIALECT === 'mongodb') {
      this._alertConditionOperation = require('../managers/mongodb/AlertConditionOperation');
      appLogger.info('Loading Mongodb...');
    } else {
      this._alertConditionOperation =
        require('../managers/sequelizeSQL/AlertConditionOperation').default();
      appLogger.info('Loading Sequelize...');
    }
    app.use('/alertConditionOperations', this._router);
    appLogger.info('AlertConditionOperationsRouter Loaded!');
  }

  getRouter() {
    return this._router;
  }

  getAlertConditionOperations = async (req, res) => {
    const alertConditionOperations =
      await this._alertConditionOperation.getAlertConditionOperations();
    return res.json(alertConditionOperations);
  };
}

export default AlertConditionOperationsRouter;
