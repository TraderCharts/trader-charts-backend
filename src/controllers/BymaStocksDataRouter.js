import express from "express";
import { Op } from "sequelize";
import { appLogger } from "../logger";
import { getLimit, getOffset } from "./_helpersControllers/URLQueryHelpers";

class BymaStocksDataRouter {
    constructor(app) {
        this._router = express.Router();
        this._bymaStockData;
        if (process.env.DB_DIALECT === "mongodb") {
            this._bymaStockData = require("../managers/mongodb/BymaStockData");
            appLogger.info("Loading Mongodb...");
        } else {
            this._bymaStockData = require("../managers/sequelizeSQL/BymaStockData").default();
            appLogger.info("Loading Sequelize...");
        }
        app.use("/bymaStocksData", this._router);
        appLogger.info("BymaStocksDataRouter Loaded!");
    }

    getRouter() {
        return this._router;
    }

    getBymaStocksData = async (req, res) => {
        const offset = getOffset(req.query.page, req.query.perPage);
        const limit = getLimit(req.query);
        const interval = req.query.interval || "M";
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
            { offset, limit, interval },
            query
        );
        return res.json(bymaStockData);
    };

    getBymaStockData = (req, res) => {
        const id = req.params.id;
        return this._bymaStockData.getBymaStockData(res, id);
    };

    getBymaStocksDataByExpression = async (req, res) => {
        try {
            const { expression, interval = "D", from, to, page = 1, perPage = 10 } = req.body;

            if (!expression) {
                return res.status(400).json({ error: "Expression is required" });
            }

            const offset = getOffset(page, perPage);
            const limit = getLimit({ perPage });

            const query = {};
            if (from || to) {
                query.date = {};
                if (from) query.date[Op.gte] = from;
                if (to) query.date[Op.lte] = to;
            }

            const result = await this._bymaStockData.getBymaStocksDataByExpression(
                expression,
                { offset, limit, interval },
                query
            );
            return res.json(result);
        } catch (error) {
            appLogger.error("Error in getBymaStocksDataByExpression:", error);
            return res.status(500).json({ error: error.message });
        }
    };

    getLatestBymaStocksData = async (req, res) => {
        const tickers = req.body.tickers || [];

        const bymaStockData = await this._bymaStockData.getLatestBymaStocksData(tickers);

        return res.json(bymaStockData);
    };
}

export default BymaStocksDataRouter;
