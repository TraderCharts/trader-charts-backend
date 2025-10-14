import daoSequelizeManager from '../../adapters/DAOSequelizeManager';
import { INTEGER, STRING, DATE, DATEONLY } from '../../adapters/DAOSequelizeManager';
import Sequelize from 'sequelize';
import { appLogger } from '../../logger';

const Op = Sequelize.Op;

const User = () => {
  const userAttributes = {
    id: {
      type: INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    sub: STRING,
    given_name: STRING,
    family_name: STRING,
    middle_name: STRING,
    nickname: STRING,
    name: STRING,
    picture: STRING,
  };

  const userOptions = {
    freezeTableName: true,
  };

  const _model = daoSequelizeManager.define('users', userAttributes, userOptions);
  _model.sync(); //must be just after model definition

  const syncFixtures = async () => {
    let userCount = await _model.count();
    appLogger.info(`There is ${userCount} users`);
    if (userCount === 0) {
      appLogger.info(`Adding users ... `);
      const usersFixtures = require('../../fixtures/users.json');
      await _model.bulkCreate(usersFixtures, { validate: true });
      let userConditionOperationCount = await _model.count();
      appLogger.info(`There is ${userConditionOperationCount} users`);
    } else {
      appLogger.info(`No needs to add users`);
    }
  };

  const getUsers = async (res, { offset, limit } = {}, where = {}) => {
    const users = await _model.findAll({
      offset: offset,
      limit: limit,
      where: where,
    });
    return users;
  };

  const getUser = async (sub) => {
    const aUser = await _model.findAll({
      where: {
        sub: sub,
      },
    });
    return aUser;
  };

  const createUser = async (data) => {
    const aNewUser = await _model.create(data);
    return aNewUser;
  };

  const updateUser = async (id, data) => {
    const aNewUser = await _model.update(data, {
      where: {
        sub: id,
      },
    });
    return aNewUser;
  };

  return {
    model: _model,
    syncFixtures,
    getUsers,
    getUser,
    createUser,
    updateUser,
  };
};

export default User;
