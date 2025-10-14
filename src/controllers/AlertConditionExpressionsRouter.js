import express from 'express';
import { getOffsetByQuery, getLimit } from './_helpersControllers/URLQueryHelpers';
import { appLogger } from '../logger';

class AlertConditionExpressionsRouter {
  constructor(app) {
    this._router = express.Router();
    this._alertConditionExpression;
    if (process.env.DB_DIALECT === 'mongodb') {
      this._alertConditionExpression = require('../managers/mongodb/AlertConditionExpression');
      appLogger.info('Loading Mongodb...');
    } else {
      this._alertConditionExpression =
        require('../managers/sequelizeSQL/AlertConditionExpression').default();
      appLogger.info('Loading Sequelize...');
    }
    app.use('/alertConditionExpressions', this._router);
    appLogger.info('AlertConditionExpressionsRouter Loaded!');
  }

  getRouter() {
    return this._router;
  }

  getAlertConditionExpressions = async (req, res) => {
    const alertConditionExpressions =
      await this._alertConditionExpression.getAlertConditionExpressions();
    return res.json(alertConditionExpressions);
  };
}

export default AlertConditionExpressionsRouter;
