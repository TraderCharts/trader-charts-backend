import daoSequelizeManager, { INTEGER } from "../../adapters/DAOSequelizeManager";
import { appLogger } from "../../logger";

const AlertsTargetNegotiableInstruments = () => {
    const alertAttributes = {
        id: {
            type: INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        alertId: INTEGER,
        targetNegotiableInstrumentId: INTEGER,
    };

    const alertOptions = {
        freezeTableName: true,
    };

    const _model = daoSequelizeManager.define(
        "alerts_target_negotiable_instruments",
        alertAttributes,
        alertOptions
    );
    _model.sync(); // create tables in database if doesn't exists

    const syncFixtures = async () => {
        const alertsTargetNegotiableInstrumentsCount = await _model.count();
        appLogger.info(
            `There is ${alertsTargetNegotiableInstrumentsCount} alertsTargetNegotiableInstruments`
        );
        if (alertsTargetNegotiableInstrumentsCount === 0) {
            appLogger.info(`Adding alertsTargetNegotiableInstruments ... `);
            await _model.bulkCreate([{ alertId: 1, targetNegotiableInstrumentId: 1 }], {
                validate: true,
            });
            const alertsTargetNegotiableInstrumentsCount = await _model.count();
            appLogger.info(
                `There is ${alertsTargetNegotiableInstrumentsCount} alertsTargetNegotiableInstruments`
            );
        } else {
            appLogger.info(`No needs to add alertsTargetNegotiableInstruments`);
        }
    };

    const getAlertsTargetNegotiableInstruments = async ({ offset, limit = 100 }, sort, where) => {
        const alertsTargetNegotiableInstruments = await _model.findAll({
            offset,
            limit,
            where,
            order: sort || [["id", "ASC"]],
        });
        return alertsTargetNegotiableInstruments;
    };

    return {
        model: _model,
        syncFixtures,
        getAlertsTargetNegotiableInstruments,
    };
};

export default AlertsTargetNegotiableInstruments;
