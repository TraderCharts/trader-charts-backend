import express from "express";
import { getLimit, getOffset } from "./_helpersControllers/URLQueryHelpers";

import { appLogger } from "../logger";

class AlertsTargetNegotiableInstrumentsRouter {
    constructor(app) {
        this._router = express.Router();
        this._alertsTargetNegotiableInstrument;
        if (process.env.DB_DIALECT === "mongodb") {
            this._alertsTargetNegotiableInstrument = require("../managers/mongodb/AlertsTargetNegotiableInstruments");
            appLogger.info("Loading Mongodb...");
        } else {
            this._alertsTargetNegotiableInstrument =
                require("../managers/sequelizeSQL/AlertsTargetNegotiableInstruments").default();
            appLogger.info("Loading Sequelize...");
        }
        app.use("/negotiableInstrumentsAlerts", this._router);
        appLogger.info("AlertsTargetNegotiableInstrumentsRouter Loaded!");
    }

    getRouter() {
        return this._router;
    }

    getAlertsTargetNegotiableInstruments = async (req, res) => {
        const offset = getOffset(req.query.page, req.query.perPage);
        const limit = getLimit(req.query);
        const negotiableInstrumentId = req.query.negotiableInstrumentId;
        const alertId = req.query.alertId;
        const userId = req.query.userId;
        const query = { negotiableInstrumentId, alertId, userId };
        Object.keys(query).forEach((key) => {
            if (query[key] === undefined) {
                delete query[key];
            }
        });

        const alertsTargetNegotiableInstruments =
            await this._alertsTargetNegotiableInstrument.getAlertsTargetNegotiableInstruments(
                { offset, limit },
                query
            );
        return res.json(alertsTargetNegotiableInstruments);
    };

    postAlertsTargetNegotiableInstruments = async (req, res) => {
        const data = req.body;
        const newAlertsTargetNegotiableInstrument =
            await this._alertsTargetNegotiableInstrument.createAlertsTargetNegotiableInstrument(
                data
            );
        return res.json(newAlertsTargetNegotiableInstrument);
    };
}

export default AlertsTargetNegotiableInstrumentsRouter;
