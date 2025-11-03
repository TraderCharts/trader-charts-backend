import express from "express";
import { getLimit, getOffset } from "./_helpersControllers/URLQueryHelpers";
import { appLogger } from "../logger";

class NegotiableInstrumentsRouter {
    constructor(app) {
        this._router = express.Router();
        this._negotiableInstrument;
        if (process.env.DB_DIALECT === "mongodb") {
            this._negotiableInstrument = require("../managers/mongodb/NegotiableInstrument");
            appLogger.info("Loading Mongodb...");
        } else {
            this._negotiableInstrument =
                require("../managers/sequelizeSQL/NegotiableInstrument").default();
            appLogger.info("Loading Sequelize...");
        }
        app.use("/negotiableInstruments", this._router);
        appLogger.info("NegotiableInstrumentsRouter Loaded!");
    }

    getRouter() {
        return this._router;
    }

    getNegotiableInstruments = async (req, res) => {
        const offset = getOffset(req.query.page, req.query.perPage);
        const limit = getLimit(req.query);
        const sort = req.query.sort;
        const ticker = req.query.ticker;
        const query = {};
        if (ticker) query.code = ticker;

        const negotiableInstruments = await this._negotiableInstrument.getNegotiableInstruments(
            { offset, limit },
            sort,
            query
        );
        return res.json(negotiableInstruments);
    };
}

export default NegotiableInstrumentsRouter;
