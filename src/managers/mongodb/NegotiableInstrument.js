import { ObjectId } from "mongodb";
import MongodbManager from "../../adapters/DAOMongodbManager";
import { appLogger } from "../../logger";
import { formatNegotiableInstrumentToFrontend } from "../_helpersDb/parseToFrontend";

export const syncFixtures = async () => {
    const db = await MongodbManager();
    const collection = await db.collection("negotiable_instruments");
    let negotiableInstrumentCount = await collection.count();

    appLogger.info(`There is ${negotiableInstrumentCount} negotiableInstruments`);

    if (negotiableInstrumentCount === 0) {
        appLogger.info(`Adding negotiableInstruments ... `);

        let negotiableInstrumentFixtures = require("../../fixtures/negotiableInstruments.json");

        negotiableInstrumentFixtures = negotiableInstrumentFixtures.map(async (elem) => {
            const negotiableInstrumentTypesCollection = await db.collection(
                "negotiable_instrument_types"
            );

            const negotiableInstrumentTypesQuery = { id: elem.typeId };

            const negotiableInstrumentType = await negotiableInstrumentTypesCollection.findOne(
                negotiableInstrumentTypesQuery
            );

            appLogger.info("negotiableInstrumentType", negotiableInstrumentType);

            const newElem = {
                ...elem,
                _id: new ObjectId(elem.id),
                typeId: negotiableInstrumentType._id,
            };

            if (elem.bondTermsId) {
                newElem.bondTermsId = new ObjectId(elem.bondTermsId);
            }

            return newElem;
        });

        negotiableInstrumentFixtures = await Promise.all(negotiableInstrumentFixtures);

        appLogger.info("negotiableInstrumentFixtures", negotiableInstrumentFixtures);

        await collection.insertMany(negotiableInstrumentFixtures);

        negotiableInstrumentCount = await collection.count();

        appLogger.info(`There is ${negotiableInstrumentCount} negotiableInstruments`);
    } else {
        appLogger.info(`No needs to add negotiableInstruments`);
    }
};

export const getNegotiableInstruments = async (
    { offset = 0, limit = 1000 },
    sort = { name: 1 },
    query = {}
) => {
    const db = await MongodbManager();
    const collection = await db.collection("negotiable_instruments");

    const match = query.code ? { code: query.code } : {};

    let negotiableInstruments = await collection.aggregate([
        { $match: match },
        { $sort: sort },
        { $skip: offset },
        { $limit: limit },
        {
            $lookup: {
                from: "negotiable_instrument_types",
                localField: "typeId",
                foreignField: "_id",
                pipeline: [
                    {
                        $project: {
                            _id: 0,
                            id: 1,
                            name: 1,
                        },
                    },
                ],
                as: "type",
            },
        },
        {
            $unwind: {
                path: "$type",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $addFields: {
                id: "$_id",
            },
        },
        { $unset: "_id" },
    ]);

    negotiableInstruments = await negotiableInstruments.toArray();

    negotiableInstruments = negotiableInstruments.map((elem) =>
        formatNegotiableInstrumentToFrontend(elem)
    );

    return negotiableInstruments;
};

export const getBondTermsByTickers = async (tickers = []) => {
    const db = await MongodbManager();

    if (!Array.isArray(tickers) || tickers.length === 0) {
        return [];
    }

    const symbols = tickers.map((ticker) => ticker.trim().toUpperCase()).filter(Boolean);

    return db
        .collection("negotiable_instruments")
        .aggregate([
            {
                $match: {
                    code: { $in: [...new Set(symbols)] },
                },
            },
            {
                $lookup: {
                    from: "bond_terms",
                    localField: "bondTermsId",
                    foreignField: "_id",
                    as: "bondTerms",
                },
            },
            {
                $unwind: {
                    path: "$bondTerms",
                    preserveNullAndEmptyArrays: false,
                },
            },
            {
                $replaceWith: "$bondTerms",
            },
        ])
        .toArray();
};
