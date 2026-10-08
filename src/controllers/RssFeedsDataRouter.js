import express from "express";
import { Op } from "sequelize";
import { appLogger } from "../logger";
import { getLimit, getOffset } from "./_helpersControllers/URLQueryHelpers";

class RssFeedsDataRouter {
    constructor(app) {
        this._router = express.Router();
        this._rssFeedsData;
        if (process.env.DB_DIALECT === "mongodb") {
            this._rssFeedsData = require("../managers/mongodb/RssFeedsData");
            appLogger.info("Loading Mongodb...");
        } else {
            this._rssFeedsData = require("../managers/sequelizeSQL/RssFeedsData").default();
            appLogger.info("Loading Sequelize...");
        }
        app.use("/trendingNews", this._router);
        appLogger.info("RssFeedsDataRouter Loaded!");
    }

    getRouter() {
        return this._router;
    }

    getRssFeedsData = async (req, res) => {
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

        const rssFeedsData = await this._rssFeedsData.getRssFeedsData(
            { offset, limit },
            sort,
            query
        );
        return res.json(rssFeedsData);
    };

    getRssFeedData = (req, res) => {
        const id = req.params.id;
        return this._rssFeedsData.getRssFeedsData(res, id);
    };
}

export default RssFeedsDataRouter;
