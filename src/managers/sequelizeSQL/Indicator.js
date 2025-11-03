import daoSequelizeManager, { INTEGER, STRING } from "../../adapters/DAOSequelizeManager";
import { appLogger } from "../../logger";

const Indicator = () => {
    const indicatorAttributes = {
        id: {
            type: INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        code: STRING,
        windowSize: INTEGER,
        stroke: STRING,
        strokeWidth: INTEGER,
        type: STRING,
    };

    const indicatorOptions = {
        freezeTableName: true,
    };

    const _model = daoSequelizeManager.define("indicators", indicatorAttributes, indicatorOptions);
    _model.sync(); //must be just after model definition

    const syncFixtures = async () => {
        let indicatorCount = await _model.count();
        appLogger.info(`There is ${indicatorCount} indicators`);
        if (indicatorCount === 0) {
            appLogger.info(`Adding indicators ... `);
            const indicatorsFixtures = require("../../fixtures/indicators.json");
            await _model.bulkCreate(indicatorsFixtures, { validate: true });
            indicatorCount = await _model.count();
            appLogger.info(`There is ${indicatorCount} indicators`);
        } else {
            appLogger.info(`No needs to add indicators`);
        }
    };

    const getIndicators = (res, offset, limit) => {
        return _model.findAll({
            offset: offset,
            limit: limit,
        });
    };

    return {
        model: _model,
        syncFixtures,
        getIndicators,
    };
};

export default Indicator;
