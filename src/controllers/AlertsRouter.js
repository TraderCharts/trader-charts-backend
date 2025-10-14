import express from 'express';
import { getLimit, getOffset } from './_helpersControllers/URLQueryHelpers';
import { appLogger } from '../logger';

class AlertsRouter {
  constructor(app) {
    this._router = express.Router();
    if (process.env.DB_DIALECT === 'mongodb') {
      this._alert = require('../managers/mongodb/Alert');
      appLogger.info('Loading Mongodb...');
    } else {
      this._alert = require('../managers/sequelizeSQL/Alert').default();
      appLogger.info('Loading Sequelize...');
    }
    app.use('/alerts', this._router);
    appLogger.info('AlertsRouter Loaded!');
  }

  getRouter() {
    return this._router;
  }

  getAlerts = async (req, res) => {
    const offset = getOffset(req.query.page, req.query.perPage);
    const limit = getLimit(req.query);
    const sort = req.query.sort;
    const query = {};

    const alerts = await this._alert.getAlerts(res, { offset, limit }, sort, query);
    return res.json(alerts);
  };

  getAlert = async (req, res) => {
    const alertId = req.params.id;
    const alert = await this._alert.getAlert(alertId);
    return res.json(alert);
  };

  postAlert = async (req, res) => {
    const data = req.body;
    const newAlert = await this._alert.createAlert(data);
    return res.json(newAlert);
  };
  patchAlert = async (req, res) => {
    const id = req.params.id;
    const data = req.body;
    const newAlert = await this._alert.updateAlert(id, data);
    return res.json(newAlert);
  };
  deleteAlert = async (req, res) => {
    const alertId = req.params.id;
    const alert = await this._alert.deleteAlert(alertId);
    return res.json(alert);
  };
}

export default AlertsRouter;
