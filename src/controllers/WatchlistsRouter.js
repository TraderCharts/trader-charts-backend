import express from "express";
import { appLogger } from "../logger";
//import checkJwt from "../middlewares/auth";
import resolveUser from "../middlewares/resolveUser";

class WatchlistsRouter {
    constructor(app) {
        this._router = express.Router();
        this._watchlist;

        if (process.env.DB_DIALECT === "mongodb") {
            this._watchlist = require("../managers/mongodb/Watchlist");
            appLogger.info("Loading Mongodb...");
        } else {
            this._watchlist = require("../managers/sequelizeSQL/Watchlist").default();
            appLogger.info("Loading Sequelize...");
        }

        //this._router.use("/", checkJwt, resolveUser); for validate token, needs public key from auth0, but for now we will just resolve user from sub in token
        this._router.use("/", resolveUser);

        app.use("/watchlists", this._router);

        appLogger.info("WatchlistsRouter Loaded!");
    }

    getRouter() {
        return this._router;
    }

    getWatchlists = async (req, res) => {
        try {
            const watchlists = await this._watchlist.getWatchlists(req.user._id);

            return res.json(watchlists);
        } catch (error) {
            appLogger.error("Error in getWatchlists:", error);

            return res.status(500).json({
                error: error.message,
            });
        }
    };

    addTicker = async (req, res) => {
        try {
            const { ticker } = req.body;

            if (!ticker) {
                return res.status(400).json({
                    error: "Ticker is required",
                });
            }

            const watchlist = await this._watchlist.addTicker(req.user._id, ticker);

            return res.json(watchlist);
        } catch (error) {
            appLogger.error("Error in addTicker:", error);

            return res.status(500).json({
                error: error.message,
            });
        }
    };

    removeTicker = async (req, res) => {
        try {
            const { ticker } = req.body;

            if (!ticker) {
                return res.status(400).json({
                    error: "Ticker is required",
                });
            }

            const watchlist = await this._watchlist.removeTicker(req.user._id, ticker);

            return res.json(watchlist);
        } catch (error) {
            appLogger.error("Error in removeTicker:", error);

            return res.status(500).json({
                error: error.message,
            });
        }
    };
}

export default WatchlistsRouter;
