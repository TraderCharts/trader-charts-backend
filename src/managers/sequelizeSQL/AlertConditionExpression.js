import daoSequelizeManager from '../../adapters/DAOSequelizeManager';
import { INTEGER, STRING, ARRAY, BOOLEAN } from '../../adapters/DAOSequelizeManager';
import Sequelize from 'sequelize';
import { appLogger } from '../../logger';

const Op = Sequelize.Op;

const AlertConditionExpression = () => {
  const alertConditionExpressionAttributes = {
    id: {
      type: INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    code: STRING,
    type: STRING,
  };

  const alertConditionExpressionOptions = {
    freezeTableName: true,
  };

  const _model = daoSequelizeManager.define(
    'alert_condition_expressions',
    alertConditionExpressionAttributes,
    alertConditionExpressionOptions
  );
  _model.sync(); //must be just after model definition

  const syncFixtures = async () => {
    let alertConditionExpressionCount = await _model.count();
    appLogger.info(`There is ${alertConditionExpressionCount} alertConditionExpression`);
    if (alertConditionExpressionCount === 0) {
      appLogger.info(`Adding alertConditionExpression ... `);
      const alertConditionExpressionFixtures = require('../../fixtures/alertConditionExpressions.json');
      appLogger.info('alertConditionExpressionFixtures', alertConditionExpressionFixtures);
      await _model.bulkCreate(alertConditionExpressionFixtures, { validate: true });
      alertConditionExpressionCount = await _model.count();
      appLogger.info(`There is ${alertConditionExpressionCount} alertConditionExpression`);
    } else {
      appLogger.info(`No needs to add alertConditionExpressions`);
    }
  };

  const getAlertConditionExpressions = async (res, { offset, limit } = {}, where = {}) => {
    const alertConditionExpressions = await _model.findAll({
      offset: offset,
      limit: limit,
      where: where,
    });
    return alertConditionExpressions;
  };

  return {
    model: _model,
    syncFixtures,
    getAlertConditionExpressions,
  };
};

export default AlertConditionExpression;
