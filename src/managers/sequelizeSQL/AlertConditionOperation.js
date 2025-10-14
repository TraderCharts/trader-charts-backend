import daoSequelizeManager from '../../adapters/DAOSequelizeManager';
import { INTEGER, STRING, ARRAY, BOOLEAN } from '../../adapters/DAOSequelizeManager';
import Sequelize from 'sequelize';
import { appLogger } from '../../logger';

const Op = Sequelize.Op;

const AlertConditionOperation = () => {
  const alertConditionOperationAttributes = {
    id: {
      type: INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    name: STRING,
    operator: STRING,
  };

  const alertConditionOperationOptions = {
    freezeTableName: true,
  };

  const _model = daoSequelizeManager.define(
    'alert_condition_operations',
    alertConditionOperationAttributes,
    alertConditionOperationOptions
  );
  _model.sync(); //must be just after model definition

  const syncFixtures = async () => {
    let alertConditionOperationCount = await _model.count();
    appLogger.info(`There is ${alertConditionOperationCount} alertConditionOperations`);
    if (alertConditionOperationCount === 0) {
      appLogger.info(`Adding alertConditionOperation ... `);
      const alertConditionOperationFixtures = require('../../fixtures/alertConditionOperations.json');
      await _model.bulkCreate(alertConditionOperationFixtures, { validate: true });
      let alertConditionOperationCount = await _model.count();
      appLogger.info(`There is ${alertConditionOperationCount} alertConditionOperations`);
    } else {
      appLogger.info(`No needs to add alertConditionOperations`);
    }
  };

  const getAlertConditionOperations = async (res, { offset, limit } = {}, where = {}) => {
    const alertConditionOperations = await _model.findAll({
      offset: offset,
      limit: limit,
      where: where,
    });
    return alertConditionOperations;
  };

  return {
    model: _model,
    syncFixtures,
    getAlertConditionOperations,
  };
};

export default AlertConditionOperation;
