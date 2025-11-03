const express = require("express");
import { appLogger } from "../logger";

class UploadRouter {
    constructor(app) {
        this._router = express.Router();
        app.use("/upload", this._router);
        appLogger.info("UploadRouter Loaded!");
    }

    getRouter() {
        return this._router;
    }

    renderUploadFileForm = (req, res) => {
        res.render("form");
    };
}

export default UploadRouter;
