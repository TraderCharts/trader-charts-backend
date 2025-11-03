import daoSequelizeManager, { INTEGER, STRING } from "../../adapters/DAOSequelizeManager";
import { appLogger } from "../../logger";

const NegotiableInstrumentType = () => {
    const negotiableInstrumentTypeAttributes = {
        id: {
            type: INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        name: STRING,
    };

    const negotiableInstrumentTypeOptions = {
        freezeTableName: true,
    };

    const _model = daoSequelizeManager.define(
        "negotiable_instrument_types",
        negotiableInstrumentTypeAttributes,
        negotiableInstrumentTypeOptions
    );
    _model.sync(); //must be just after model definition

    const syncFixtures = async () => {
        let negotiableInstrumentTypeCount = await _model.count();
        appLogger.info(`There is ${negotiableInstrumentTypeCount} negotiableInstrumentTypes`);
        if (negotiableInstrumentTypeCount === 0) {
            appLogger.info(`Adding negotiableInstrumentTypes ... `);
            const negotiableInstrumentTypesFixtures = require("../../fixtures/negotiableInstrumentTypes.json");
            await _model.bulkCreate(negotiableInstrumentTypesFixtures, { validate: true });
            negotiableInstrumentTypeCount = await _model.count();
            appLogger.info(`There is ${negotiableInstrumentTypeCount} negotiableInstrumentTypes`);
        } else {
            appLogger.info(`No needs to add negotiableInstrumentTypes`);
        }
    };

    const getNegotiableInstrumentTypes = async (res, { offset, limit } = {}, where = {}) => {
        const negotiableInstrumentTypes = await _model.findAll({
            offset: offset,
            limit: limit,
            where: where,
        });
        return negotiableInstrumentTypes;
    };

    return {
        model: _model,
        syncFixtures,
        getNegotiableInstrumentTypes,
    };
};

export default NegotiableInstrumentType;
