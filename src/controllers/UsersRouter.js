import express from 'express';
import { getLimit, getOffset } from './_helpersControllers/URLQueryHelpers';
import { appLogger } from '../logger';

class UsersRouter {
  constructor(app) {
    this._router = express.Router();
    this._user;
    if (process.env.DB_DIALECT === 'mongodb') {
      this._user = require('../managers/mongodb/User');
      appLogger.info('Loading Mongodb...');
    } else {
      this._user = require('../managers/sequelizeSQL/User').default();
      appLogger.info('Loading Sequelize...');
    }
    app.use('/users', this._router);
    appLogger.info('UsersRouter Loaded!');
  }

  getRouter() {
    return this._router;
  }

  getUsers = async (req, res) => {
    appLogger.info('getUsers');
    const offset = getOffset(req.query.page, req.query.perPage);
    const limit = getLimit(req.query);
    const sort = req.query.sort;
    let query = {};
    const sub = req.query.sub; // sub is the Id for Facebook
    if (sub) {
      query.sub = sub;
    }

    let users = await this._user.getUsers(res, { offset, limit }, sort, query);
    return res.json(users);
  };

  getUser = async (req, res) => {
    const id = req.params.id;
    const aUser = await this._user.getUser(id);
    return res.json(aUser);
  };

  postUser = async (req, res) => {
    const body = req.body;
    appLogger.info('postUser');
    let createdUser = await this._user.createUser(body);
    return res.json(createdUser);
  };

  patchUser = async (req, res) => {
    appLogger.info('patchUser');
    const id = req.params.id;
    const body = req.body;
    let updatedUser = await this._user.updateUser(id, body);
    return res.json(updatedUser);
  };

  deleteUser = async (req, res) => {
    appLogger.info('deleteUser');
    const id = req.params.id;
    let deletedUser = await this._user.deleteUser(id);
    return res.json(deletedUser);
  };
}

export default UsersRouter;
