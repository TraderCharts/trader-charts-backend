//libs is usually used for custom classes/functions/modules
import Sequelize from "sequelize";
import NegotiableInstrumentType from "../managers/sequelizeSQL/NegotiableInstrumentType";
import AlertConditionExpression from "../managers/sequelizeSQL/AlertConditionExpression";
import AlertConditionOperation from "../managers/sequelizeSQL/AlertConditionOperation";
import NegotiableInstrument from "../managers/sequelizeSQL/NegotiableInstrument";
import Alert from "../managers/sequelizeSQL/Alert";
import BymaStockData from "../managers/sequelizeSQL/BymaStockData";
import User from "../managers/sequelizeSQL/User";
import Indicator from "../managers/sequelizeSQL/Indicator";
import AlertsTargetNegotiableInstruments from "../managers/sequelizeSQL/AlertsTargetNegotiableInstruments";
import { sequelizeLogger } from "../logger";
import { appLogger } from "../logger";

export const INTEGER = Sequelize.INTEGER;
export const STRING = Sequelize.STRING;
export const DATE = Sequelize.DATE;
export const DATEONLY = Sequelize.DATEONLY;
export const ARRAY = Sequelize.ARRAY;
export const BOOLEAN = Sequelize.BOOLEAN;
export const DECIMAL = Sequelize.DECIMAL;

class DAOSequelizeManager {
    constructor() {
        this._dbDialect = process.env.DB_DIALECT || "postgres";
        this._dbHost = process.env.DB_HOST || "localhost";
        this._dbName = process.env.DB_NAME || "api3";
        this._dbPort = process.env.DB_PORT || 5432;
        this._dbUser = process.env.DB_USER || "postgres";
        this._dbPass = process.env.DB_PASS || "postgres";
        this._dbSSL = process.env.DB_SSL || false;
        appLogger.info("Loading DAOSequelizeManager...");
        appLogger.info("Database Name: ", this._dbName);
        this._sequelize = new Sequelize(this._dbName, this._dbUser, this._dbPass, {
            dialect: this._dbDialect,
            host: this._dbHost,
            port: this._dbPort,
            dialectOptions: {
                connectTimeout: 5000, // Connection timeout in milliseconds
            },
            pool: {
                acquire: 3000, // 3 segundos máximo para obtener una conexión
                idle: 10000,
                max: 5,
                min: 0,
            },
            logQueryParameters: true,
            logging: sequelizeLogger,
        });
    }

    initialize() {
        this._sequelize
            .authenticate()
            .then(() => {
                appLogger.info(
                    `Connection has been established successfully to database '${this._dbName}' from HOST '${this._dbHost}'`
                );
                if (
                    process.env.NODE_ENV !== "production" &&
                    process.env.LOAD_MOCK_DATA === "true"
                ) {
                    this.sync();
                }
            })
            .catch(() => {
                console.error("Unable to connect to the database");
            });
        appLogger.info("DAOSequelizeManager Loaded!\n");
    }

    define(entityName, entityAttributes, entityOptions) {
        return this._sequelize.define(entityName, entityAttributes, entityOptions);
    }

    sync() {
        return this._sequelize
            .sync({ alter: true })
            .then(async () => {
                appLogger.info(
                    "sync successfully! All missing tables were created automatically by Sequelize on database, with foreignKeys and join tables"
                );
                appLogger.info("\nAdding fixtures on SQL database ...");
                await User().syncFixtures();
                await NegotiableInstrumentType().syncFixtures();
                await NegotiableInstrument().syncFixtures();
                await AlertConditionExpression().syncFixtures();
                await AlertConditionOperation().syncFixtures();
                await Indicator().syncFixtures();
                if (process.env.NODE_ENV === "development") {
                    await Alert().syncFixtures();
                    await AlertsTargetNegotiableInstruments().syncFixtures();
                    await BymaStockData().syncFixtures();
                }
                appLogger.info("Fixtures Added!");
            })
            .catch((e) => {
                console.error("Unable to sync", e);
            });
    }
}

const DAOSequelizeManagerInstance = new DAOSequelizeManager();
DAOSequelizeManagerInstance.initialize();

export default DAOSequelizeManagerInstance;
