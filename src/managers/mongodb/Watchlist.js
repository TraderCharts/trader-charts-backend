import { ObjectId } from "mongodb";
import MongodbManager from "../../adapters/DAOMongodbManager";

const DEFAULT_WATCHLIST_NAME = "favorites";

export const syncFixtures = async () => {
    const db = await MongodbManager();
    const collection = await db.collection("watchlists");

    await collection.createIndex({
        userId: 1,
    });
};

export const getWatchlists = async (userId) => {
    const db = await MongodbManager();
    const collection = await db.collection("watchlists");

    return collection
        .find({
            userId: new ObjectId(userId),
        })
        .toArray();
};

export const addTicker = async (userId, ticker) => {
    const db = await MongodbManager();
    const collection = await db.collection("watchlists");

    return collection.findOneAndUpdate(
        {
            userId: new ObjectId(userId),
        },
        {
            $setOnInsert: {
                name: DEFAULT_WATCHLIST_NAME,
                created_at: new Date(),
            },
            $set: {
                updated_at: new Date(),
            },
            $addToSet: {
                tickers: ticker,
            },
        },
        {
            upsert: true,
            returnDocument: "after",
        }
    );
};

export const removeTicker = async (userId, ticker) => {
    const db = await MongodbManager();
    const collection = await db.collection("watchlists");

    return collection.findOneAndUpdate(
        {
            userId: new ObjectId(userId),
        },
        {
            $pull: {
                tickers: ticker,
            },
            $set: {
                updated_at: new Date(),
            },
        },
        {
            returnDocument: "after",
        }
    );
};
