export const validatePhotoRequestMiddleware = (req, res, next) => {
    if (!req.file) {
        res.statusCode = 400;
        return res.json({
            errors: ['File failed to upload']
        });
    }

    req.checkBody('description', 'Invalid description').notEmpty();
    req.checkBody('album_id', 'Invalid album_id').isNumeric();

    const errors = req.validationErrors();
    if (errors) {
        const response = {errors: []};
        errors.forEach(function (err) {
            response.errors.push(err.msg);
        });

        res.statusCode = 400;
        return res.json(response);
    }
    return next();
};
