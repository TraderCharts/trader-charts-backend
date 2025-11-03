import MongodbManager from "../../adapters/DAOMongodbManager";
import { ObjectId } from "mongodb";
import { appLogger } from "../../logger";

export const syncFixtures = async () => {
    const db = await MongodbManager();
    const collection = await db.collection("indicators");
    let negotiableInstrumentTypeCount = await collection.count();
    appLogger.info(`There is ${negotiableInstrumentTypeCount} indicators`);
    if (negotiableInstrumentTypeCount === 0) {
        appLogger.info(`Adding indicators ... `);
        let indicatorsFixtures = require("../../fixtures/indicators.json");
        indicatorsFixtures = indicatorsFixtures.map((elem) => {
            const newElem = { ...elem, _id: new ObjectId(elem.id) };
            return newElem;
        });
        await collection.insertMany(indicatorsFixtures);
        negotiableInstrumentTypeCount = await collection.count();
        appLogger.info(`There is ${negotiableInstrumentTypeCount} indicators`);
    } else {
        appLogger.info(`No needs to add indicators`);
    }
};
export const getIndicators = async () => {
    const db = await MongodbManager();
    const collection = await db.collection("indicators");
    let indicators = await collection.aggregate([
        {
            $addFields: {
                id: "$_id",
            },
        },
        { $unset: "_id" },
    ]);
    indicators = await indicators.toArray();
    return indicators;
};
