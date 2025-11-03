import cors from "cors";
import express from "express";
import expressOasGenerator from "express-oas-generator";
import morgan from "morgan";
import path from "path";
import swaggerConfig from "../../config/swaggerConfig.js";
import { appLogger } from "../logger";
import File from "../managers/fileSystem/File.js";
import { validatePhotoRequestMiddleware } from "./_helpersControllers/Photo";
import AlertConditionExpressionsRouter from "./AlertConditionExpressionsRouter";
import AlertConditionOperationsRouter from "./AlertConditionOperationsRouter";
import AlertsRouter from "./AlertsRouter";
import AlertsTargetNegotiableInstrumentsRouter from "./AlertsTargetNegotiableInstrumentsRouter";
import BymaStocksDataRouter from "./BymaStocksDataRouter";
import IndicatorsRouter from "./IndicatorsRouter";
import NegotiableInstrumentsRouter from "./NegotiableInstrumentsRouter";
import NegotiableInstrumentTypesRouter from "./NegotiableInstrumentTypesRouter";
import PhotoRouter from "./PhotoRouter";
import RssFeedsDataRouter from "./RssFeedsDataRouter.js";
import UploadRouter from "./UploadRouter";
import UsersRouter from "./UsersRouter";

const createAppRouter = () => {
    const app = express();

    app.set("view engine", "ejs");
    app.use("/assets", express.static(path.resolve(__dirname, "../../assets/public")));
    app.use("/docs", express.static(path.resolve(__dirname, "../../docs")));
    app.get("/api", (req, res) => res.redirect("/api-docs"));
    app.get("/api/v3", (req, res) => res.redirect("/api-docs/v3"));
    app.use((req, res, next) => {
        res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
        res.set("Pragma", "no-cache");
        res.set("Expires", "0");
        res.set("Surrogate-Control", "no-store");
        next();
    });
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(morgan("dev"));

    const corsUrl =
        process.env.NODE_ENV === "production" ? process.env.HOST_ALLOWED : "http://localhost:3001";
    app.use(cors({ origin: corsUrl }));

    expressOasGenerator.handleResponses(app, swaggerConfig);
    app.get("/", (req, res) => res.send("test route for codeship environment"));
    appLogger.info("AppRouter Loaded!");

    const initPhotoRouter = () => {
        const router = new PhotoRouter(app);
        const fileManager = new File("avatar");
        router
            .getRouter()
            .post(
                "/",
                fileManager.uploadFileRequestMiddleware,
                validatePhotoRequestMiddleware,
                router.saveFile
            );
        router.getRouter().get("/:id", router.getPhoto);
    };

    const initUploadRouter = () => {
        const uploadRouter = new UploadRouter(app);
        uploadRouter.getRouter().get("/", uploadRouter.renderUploadFileForm);
    };

    const initUsersRouter = () => {
        const router = new UsersRouter(app);
        router.getRouter().get("/", router.getUsers);
        router.getRouter().get("/:id", router.getUser);
        router.getRouter().post("/", router.postUser);
        router.getRouter().patch("/:id", router.patchUser);
        router.getRouter().delete("/:id", router.deleteUser);
    };

    const initNegotiableInstrumentsRouter = () => {
        const router = new NegotiableInstrumentsRouter(app);
        router.getRouter().get("/", router.getNegotiableInstruments);
        router.getRouter().get("/data", router.getNegotiableInstruments);
    };

    const initNegotiableInstrumentTypesRouter = () => {
        const router = new NegotiableInstrumentTypesRouter(app);
        router.getRouter().get("/", router.getNegotiableInstrumentTypes);
    };

    const initIndicatorsRouter = () => {
        const router = new IndicatorsRouter(app);
        router.getRouter().get("/", router.getIndicators);
    };

    const initAlertConditionExpressionsRouter = () => {
        const router = new AlertConditionExpressionsRouter(app);
        router.getRouter().get("/", router.getAlertConditionExpressions);
    };

    const initAlertConditionOperationsRouter = () => {
        const router = new AlertConditionOperationsRouter(app);
        router.getRouter().get("/", router.getAlertConditionOperations);
    };

    const initBymaStocksDataRouter = () => {
        const router = new BymaStocksDataRouter(app);
        router.getRouter().get("/", router.getBymaStocksData);
    };

    const initRssFeedsDataRouter = () => {
        const router = new RssFeedsDataRouter(app);
        router.getRouter().get("/", router.getRssFeedsData);
    };

    const initAlertsRouter = () => {
        const router = new AlertsRouter(app);
        router.getRouter().get("/", router.getAlerts);
        router.getRouter().get("/:id", router.getAlert);
        router.getRouter().post("/", router.postAlert);
        router.getRouter().patch("/:id", router.patchAlert);
        router.getRouter().delete("/:id", router.deleteAlert);
    };

    const initAlertsTargetNegotiableInstrumentsRouter = () => {
        const router = new AlertsTargetNegotiableInstrumentsRouter(app);
        router.getRouter().get("/", router.getAlertsTargetNegotiableInstruments);
        router.getRouter().post("/", router.postAlertsTargetNegotiableInstruments);
    };

    return {
        getApp: () => app,
        initPhotoRouter,
        initUploadRouter,
        initUsersRouter,
        initNegotiableInstrumentsRouter,
        initNegotiableInstrumentTypesRouter,
        initIndicatorsRouter,
        initAlertConditionExpressionsRouter,
        initAlertConditionOperationsRouter,
        initBymaStocksDataRouter,
        initRssFeedsDataRouter,
        initAlertsRouter,
        initAlertsTargetNegotiableInstrumentsRouter,
    };
};

export default createAppRouter;
