import express from 'express';
import { getOffsetByQuery, getLimit } from './_helpersControllers/URLQueryHelpers';
import { appLogger } from '../logger';

class PhotoRouter {
  constructor(app) {
    this._router = express.Router();
    this._photo;
    if (process.env.DB_DIALECT === 'mongodb') {
      this._photo = require('../managers/mongodb/Photo');
      appLogger.info('Loading Mongodb...');
    } else {
      this._photo = require('../managers/sequelizeSQL/Photo').default();
      appLogger.info('Loading Sequelize...');
    }
    app.use('/photos', this._router);
    appLogger.info('PhotoRouter Loaded!');
  }

  getRouter() {
    return this._router;
  }

  saveFile = (req, res) => {
    this._photo.saveFile(req, res);
  };

  getPhoto = async (req, res) => {
    const id = req.params.id;
    const photoData = await this._photo.getPhoto(id);
    return res.json(photoData);
  };

  deleteFile = (req, res) => {};
}

export default PhotoRouter;
