import daoSequelizeManager from '../../adapters/DAOSequelizeManager';
import { INTEGER, STRING, DATE, DATEONLY } from '../../adapters/DAOSequelizeManager';
import Sequelize from 'sequelize';

const Op = Sequelize.Op;

const UserToken = () => {
  const userAttributes = {
    id: {
      type: INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    given_name: STRING,
    family_name: STRING,
    middle_name: STRING,
    nickname: STRING,
    name: STRING,
    picture: STRING,
    gender: STRING,
    locale: STRING,
    updated_at: STRING,
    iss: STRING,
    sub: STRING,
    aud: STRING,
    iat: INTEGER,
    exp: INTEGER,
    at_hash: STRING,
    nonce: STRING,
  };

  const userOptions = {
    freezeTableName: true,
  };

  const _model = daoSequelizeManager.define('user_tokens', userAttributes, userOptions);
  _model.sync(); //must be just after model definition

  return { model: _model };
};

export default UserToken;
