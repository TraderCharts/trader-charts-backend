import express from 'express';
import { getLimit, getOffset, getOffsetByQuery } from './_helpersControllers/URLQueryHelpers';
import { appLogger } from '../logger';

class BymaStocksDataRouter {
  constructor(app) {
    this._router = express.Router();
    this._bymaStockData;
    if (process.env.DB_DIALECT === 'mongodb') {
      this._bymaStockData = require('../managers/mongodb/BymaStockData');
      appLogger.info('Loading Mongodb...');
    } else {
      this._bymaStockData = require('../managers/sequelizeSQL/BymaStockData').default();
      appLogger.info('Loading Sequelize...');
    }
    app.use('/bymaStocksData', this._router);
    appLogger.info('BymaStocksDataRouter Loaded!');
  }

  getRouter() {
    return this._router;
  }

  getBymaStocksData = async (req, res) => {
    const offset = getOffset(req.query.page, req.query.perPage);
    const limit = getLimit(req.query);
    const sort = req.query.sort;
    const ticker = req.query.ticker;
    const fromDate = req.query.from;
    const toDate = req.query.to;
    const query = {};
    if (ticker) query.ticker = ticker;
    const date = {};
    if (fromDate) date[Op.gte] = fromDate;
    if (toDate) date[Op.lte] = toDate;
    if (fromDate || toDate) query.date = date;

    const bymaStockData = await this._bymaStockData.getBymaStocksData(
      { offset, limit },
      sort,
      query
    );
    return res.json(bymaStockData);
  };

  getBymaStockData = (req, res) => {
    const id = req.params.id;
    return this._bymaStockData.getBymaStockData(res, id);
  };
}

export default BymaStocksDataRouter;
