import daoSequelizeManager from '../../adapters/DAOSequelizeManager';
import { INTEGER, STRING, DATE, DATEONLY } from '../../adapters/DAOSequelizeManager';
import Sequelize from 'sequelize';
import UserToken from './UserToken';
import AlertsTargetNegotiableInstruments from './AlertsTargetNegotiableInstruments';
import { appLogger } from '../../logger';

const Op = Sequelize.Op;

function formatUserAuthToBackend(newUserTokenId, { idTokenPayload, ...restOfUserAuthData }) {
  appLogger.info('formatUserAuthToBackend', newUserTokenId, restOfUserAuthData);
  return {
    userTokenId: newUserTokenId,
    ...restOfUserAuthData,
  };
}

const UserAuth = () => {
  const userAttributes = {
    id: {
      type: INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    accessToken: STRING(2000),
    idToken: STRING(2000),
    appState: STRING,
    refreshToken: STRING,
    state: STRING,
    expiresIn: INTEGER,
    tokenType: STRING,
    scope: STRING,
  };

  const userOptions = {
    freezeTableName: true,
  };

  const _model = daoSequelizeManager.define('user_auth', userAttributes, userOptions);
  _model.belongsTo(new UserToken().model, {
    as: 'userToken',
    foreignKey: { allowNull: false },
  });
  _model.sync(); //must be just after model definition

  const getUserAuths = async (res, offset, limit) => {
    const userAuths = await _model.findAll({
      offset: offset,
      limit: limit,
      include: [{ model: new UserToken().model, as: 'userToken' }],
    });
    return userAuths;
  };

  const getUserAuth = async (sub) => {
    const aUserToken = await new UserToken().model.findOne({
      where: {
        sub: sub,
      },
    });
    const aUserAuth = _model.findAll({
      where: {
        userTokenId: aUserToken.id,
      },
    });
    return aUserAuth;
  };
  const postUserAuth = async (res, data) => {
    const aNewUserToken = await new UserToken().model.create(data.idTokenPayload);
    const formattedUserAuth = formatUserAuthToBackend(aNewUserToken.id, data);
    const aNewUserAuth = await _model.create(formattedUserAuth);
    return aNewUserAuth;
  };
  const putUserAuth = async (res, data) => {
    const UserTokenModel = new UserToken().model;
    await UserTokenModel.update(data.idTokenPayload, {
      where: {
        sub: data.idTokenPayload.sub,
      },
    });
    const formattedUserAuth = formatUserAuthToBackend(undefined, data);
    let aNewUserAuth = await _model.update(formattedUserAuth, {
      where: {
        id: data.id,
      },
    });
    aNewUserAuth = await _model.findByPk(data.id, { include: UserTokenModel });
    return aNewUserAuth;
  };

  return {
    model: _model,
    getUserAuths,
    getUserAuth,
    postUserAuth,
    putUserAuth,
  };
};

export default UserAuth;
