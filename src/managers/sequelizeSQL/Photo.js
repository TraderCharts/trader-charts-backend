import daoSequelizeManager, { INTEGER, STRING } from "../../adapters/DAOSequelizeManager";

const Photo = () => {
    const photoAttributes = {
        album_id: {
            type: INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        description: STRING,
        filepath: STRING,
    };

    const photoOptions = {
        freezeTableName: true,
    };

    const _model = daoSequelizeManager.define("photo", photoAttributes, photoOptions);
    _model.sync(); //must be just after model definition

    const getPhoto = (offset, limit, res) => {
        _model
            .findAll({
                offset: offset,
                limit: limit,
            })
            .then((photoData) => {
                res.json(photoData);
            });
    };

    const saveFile = (req, res) => {
        _model
            .sync()
            .then(() =>
                _model.create({
                    album_id: req.body.album_id,
                    description: req.body.description,
                    filepath: req.file.path,
                })
            )
            .then((task) => {
                const data = task.get({
                    plain: true,
                });
                res.statusCode = 201;
                res.json(data);
            })
            .catch(function (err) {
                res.json(err);
            });
    };

    return {
        model: _model,
        getPhoto,
        saveFile,
    };
};

export default Photo;
