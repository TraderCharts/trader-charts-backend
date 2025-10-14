import daoSequelizeManager from '../../adapters/DAOSequelizeManager';
import { INTEGER, STRING, DATE, DATEONLY } from '../../adapters/DAOSequelizeManager';
import Sequelize from 'sequelize';
import NegotiableInstrumentType from './NegotiableInstrumentType';
import { appLogger } from '../../logger';

const Op = Sequelize.Op;

function formatNegotiableInstrument(negotiableInstrumentData) {
  return {
    id: negotiableInstrumentData.id,
    ticker: negotiableInstrumentData.code,
    name: negotiableInstrumentData.name,
  };
}

const NegotiableInstrument = () => {
  const negotiableInstrumentAttributes = {
    id: {
      type: INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    code: STRING,
    name: STRING,
  };

  const negotiableInstrumentOptions = {
    freezeTableName: true,
  };

  const _model = daoSequelizeManager.define(
    'negotiable_instruments',
    negotiableInstrumentAttributes,
    negotiableInstrumentOptions
  );
  _model.sync(); //must be just after model definition

  _model.belongsTo(new NegotiableInstrumentType().model, {
    as: 'type',
    foreignKey: { allowNull: false },
  });

  const syncFixtures = async () => {
    let negotiableInstrumentCount = await _model.count();
    appLogger.info(`There is ${negotiableInstrumentCount} negotiableInstruments`);
    if (negotiableInstrumentCount === 0) {
      appLogger.info(`Adding negotiableInstruments ... `);
      const negotiableInstrumentsFixtures = require('../../fixtures/negotiableInstruments.json');
      await _model.bulkCreate(negotiableInstrumentsFixtures, { validate: true });
      negotiableInstrumentCount = await _model.count();
      appLogger.info(`There is ${negotiableInstrumentCount} negotiableInstruments`);
    } else {
      appLogger.info(`No needs to add negotiableInstruments`);
    }
  };

  const getNegotiableInstruments = async (
    { offset = 0, limit = 1000 } = {},
    sort = { name: 1 },
    where = {}
  ) => {
    appLogger.info('1654312412412412');
    const negotiableInstruments = await _model.findAll({
      offset: offset,
      limit: limit,
      where: where,
    });
    return negotiableInstruments;
  };

  return {
    model: _model,
    syncFixtures,
    getNegotiableInstruments,
  };
};

export default NegotiableInstrument;
