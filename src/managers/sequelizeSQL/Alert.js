import daoSequelizeManager, { BOOLEAN, INTEGER, STRING } from "../../adapters/DAOSequelizeManager";
import { appLogger } from "../../logger";
import { formatAlertToBackend } from "../_helpersDb/parseToBackend";
import AlertConditionExpression from "./AlertConditionExpression";
import AlertConditionOperation from "./AlertConditionOperation";
import AlertsTargetNegotiableInstruments from "./AlertsTargetNegotiableInstruments";
import NegotiableInstrument from "./NegotiableInstrument";
import NegotiableInstrumentType from "./NegotiableInstrumentType";
import User from "./User";

const Alert = () => {
    const alertAttributes = {
        id: {
            type: INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        description: STRING,
        active: BOOLEAN,
        ringing: BOOLEAN,
    };

    const alertOptions = {
        freezeTableName: true,
    };

    const _model = daoSequelizeManager.define("alerts", alertAttributes, alertOptions);
    _model.sync(); //must be just after model definition

    _model.belongsTo(new User().model, { foreignKey: { allowNull: false } });
    _model.belongsTo(new AlertConditionExpression().model, {
        as: "conditionExpression1",
        foreignKey: { allowNull: false },
    });
    _model.belongsTo(new AlertConditionExpression().model, {
        as: "conditionExpression2",
        foreignKey: { allowNull: false },
    });
    _model.belongsTo(new AlertConditionOperation().model, {
        as: "conditionOperation",
        foreignKey: { allowNull: false },
    });
    _model.belongsToMany(new NegotiableInstrument().model, {
        through: new AlertsTargetNegotiableInstruments().model,
        otherKey: "targetNegotiableInstrumentId" /*foreignKey: 'targetNegotiableInstrumentId'*/,
    });

    const syncFixtures = async () => {
        const alertCount = await _model.count();
        appLogger.info(`There is ${alertCount} alerts`);
        if (alertCount === 0) {
            appLogger.info(`Adding alerts ... `);
            const alertsFixtures = require("../../fixtures/alerts.json");
            await _model.bulkCreate(
                alertsFixtures.map((elem) => formatAlertToBackend(elem)),
                { validate: true }
            );
            const alertConditionOperationCount = await _model.count();
            appLogger.info(`There is ${alertConditionOperationCount} alerts`);
        } else {
            appLogger.info(`No needs to add alerts`);
        }
    };

    const getAlerts = async (res, { offset, limit } = {}) => {
        return await _model.findAll({
            offset: offset,
            limit: limit,
            include: [
                { model: new User().model },
                {
                    model: new AlertConditionExpression().model,
                    as: "conditionExpression1",
                    attributes: ["typeId"],
                },
                {
                    model: new AlertConditionExpression().model,
                    as: "conditionExpression2",
                    attributes: ["typeId"],
                },
                {
                    model: new AlertConditionOperation().model,
                    as: "conditionOperation",
                    attributes: ["name", "operator"],
                },
                {
                    model: new NegotiableInstrument().model,
                    as: "sourceInstrument",
                    attributes: ["id", "code", "name"],
                    include: {
                        model: new NegotiableInstrumentType().model,
                        as: "type",
                        attributes: ["id", "name"],
                    },
                },
                {
                    model: new NegotiableInstrument().model,
                    through: new AlertsTargetNegotiableInstruments().model,
                },
            ],
        });
    };
    const getAlert = (res, id) => {
        return _model.findOne({
            where: {
                id: id,
            },
            include: [
                { model: new User().model },
                {
                    model: new AlertConditionExpression().model,
                    as: "conditionExpression1",
                    attributes: ["typeId"],
                },
                {
                    model: new AlertConditionExpression().model,
                    as: "conditionExpression2",
                    attributes: ["typeId"],
                },
                {
                    model: new AlertConditionOperation().model,
                    as: "conditionOperation",
                    attributes: ["name", "operator"],
                },
                {
                    model: new NegotiableInstrument().model,
                    as: "sourceInstrument",
                    attributes: ["code", "name"],
                    include: {
                        model: new NegotiableInstrumentType().model,
                        as: "type",
                        attributes: ["id", "name"],
                    },
                },
                {
                    model: new NegotiableInstrument().model,
                    through: new AlertsTargetNegotiableInstruments().model,
                },
            ],
        });
    };
    const createAlert = async (res, data) => {
        //const negotiableInstruments = await new NegotiableInstrument().model.findAll();
        let newAlert = formatAlertToBackend(data);
        newAlert = await _model.create(newAlert);
        await new AlertsTargetNegotiableInstruments().model.bulkCreate(
            data.targetTickers.map((elemId) => ({
                alertId: newAlert.id,
                targetNegotiableInstrumentId: elemId,
            }))
        );
        return newAlert;
    };
    const updateAlert = async (id, data) => {
        //const negotiableInstruments = await new NegotiableInstrument().model.findAll();
        let newAlert = formatAlertToBackend(data);
        newAlert = await _model.update(newAlert, {
            where: {
                id: id,
            },
        });
        const alertsTargetNegotiableInstrumentsModel = new AlertsTargetNegotiableInstruments()
            .model;
        alertsTargetNegotiableInstrumentsModel.destroy({
            where: {
                alertId: id,
            },
        });
        const alertsTargetNegotiableInstruments = data.targetTickers.map((elemId) => ({
            alertId: id,
            targetNegotiableInstrumentId: elemId,
        }));
        appLogger.info("alertsTargetNegotiableInstruments", alertsTargetNegotiableInstruments);
        await alertsTargetNegotiableInstrumentsModel.bulkCreate(alertsTargetNegotiableInstruments);
        return newAlert;
    };
    const deleteAlert = (res, id) => {
        return _model.destroy({
            where: {
                id: id,
            },
        });
    };

    return {
        model: _model,
        syncFixtures,
        getAlerts,
        getAlert,
        createAlert,
        updateAlert,
        deleteAlert,
    };
};

export default Alert;
