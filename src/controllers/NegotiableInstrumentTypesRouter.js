import express from "express";
import { appLogger } from "../logger";

class NegotiableInstrumentTypesRouter {
    constructor(app) {
        this._router = express.Router();
        this._negotiableInstrumentType;
        if (process.env.DB_DIALECT === "mongodb") {
            this._negotiableInstrumentType = require("../managers/mongodb/NegotiableInstrumentType");
            appLogger.info("Loading Mongodb...");
        } else {
            this._negotiableInstrumentType =
                require("../managers/sequelizeSQL/NegotiableInstrumentType").default();
            appLogger.info("Loading Sequelize...");
        }
        app.use("/negotiableInstrumentTypes", this._router);
        appLogger.info("NegotiableInstrumentTypesRouter Loaded!");
    }

    getRouter() {
        return this._router;
    }

    getNegotiableInstrumentTypes = async (req, res) => {
        const negotiableInstrumentTypes =
            await this._negotiableInstrumentType.getNegotiableInstrumentTypes();
        return res.json(negotiableInstrumentTypes);
    };
}

export default NegotiableInstrumentTypesRouter;
