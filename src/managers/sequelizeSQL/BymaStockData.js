import daoSequelizeManager, {
    DATEONLY,
    DECIMAL,
    INTEGER,
    STRING,
} from "../../adapters/DAOSequelizeManager";
import { appLogger } from "../../logger";
import { formatNegotiableInstrumentToBackend } from "../_helpersDb/parseToBackend";
import NegotiableInstrument from "./NegotiableInstrument";

const BymaStockData = () => {
    const bymaStockDataAttributes = {
        id: {
            type: INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        ticker: STRING,
        date: DATEONLY,
        expiration: STRING,
        type: STRING,
        close: DECIMAL(10, 4),
        variation: INTEGER,
        open: DECIMAL(10, 4),
        high: DECIMAL(10, 4),
        low: DECIMAL(10, 4),
        volume: INTEGER,
        amount: INTEGER,
    };

    const bymaStockDataOptions = {
        freezeTableName: true,
    };

    const _model = daoSequelizeManager.define(
        "byma_stock_data",
        bymaStockDataAttributes,
        bymaStockDataOptions
    );
    _model.sync(); //must be just after model definition
    _model.belongsTo(new NegotiableInstrument().model, { foreignKey: { allowNull: false } });

    const syncFixtures = async () => {
        const bymaStockDataCount = await _model.count();
        appLogger.info(`There is ${bymaStockDataCount} bymaStockData`);
        if (bymaStockDataCount === 0) {
            appLogger.info(`Adding bymaStockData ...222 `);
            let negotiableInstruments = NegotiableInstrument();
            negotiableInstruments = await negotiableInstruments.getNegotiableInstruments();
            const bymaStockDataFixtures = require("../../fixtures/bymaStocksData.json");
            await _model.bulkCreate(
                bymaStockDataFixtures.map((elem) =>
                    formatNegotiableInstrumentToBackend(elem, negotiableInstruments)
                ),
                { validate: true }
            );
            const bymaStockDataConditionOperationCount = await _model.count();
            appLogger.info(`There is ${bymaStockDataConditionOperationCount} bymaStockData`);
        } else {
            appLogger.info(`No needs to add bymaStockData`);
        }
    };

    const getBymaStocksData = async (
        { offset, limit = 100 } = {},
        sort = [["id", "ASC"]],
        where = {}
    ) => {
        appLogger.info("666");
        const bymaStockData = _model.findAll({
            offset,
            limit,
            where,
            order: sort,
        });
        return bymaStockData;
    };

    return {
        model: () => _model,
        syncFixtures,
        getBymaStocksData,
    };
};

export default BymaStockData;
