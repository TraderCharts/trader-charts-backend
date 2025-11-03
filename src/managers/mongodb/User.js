import { ObjectId } from "mongodb";
import MongodbManager from "../../adapters/DAOMongodbManager";
import { appLogger } from "../../logger";
import { formatObjectIdToFrontend } from "../_helpersDb/parseToFrontend";

export const syncFixtures = async () => {
    appLogger.info("\nSyncing users fixtures start ...");
    const db = await MongodbManager();
    appLogger.info("\nSyncing users fixtures end ...");
    const collection = await db.collection("users");
    const userCount = await collection.count();
    appLogger.info(`There is ${userCount} users`);
    if (userCount === 0) {
        appLogger.info(`Adding users ... `);
        collection.createIndex({ nickname: 1 });
        const usersFixtures = require("../../fixtures/users.json");
        await collection.insertMany(usersFixtures, { validate: true });
        const userConditionOperationCount = await collection.count();
        appLogger.info(`There is ${userConditionOperationCount} users`);
    } else {
        appLogger.info(`No needs to add users`);
    }
};

export const getUsers = async (_, { offset = 0, limit = 1000 }, sort = { nickname: 1 }) => {
    const db = await MongodbManager();
    const collection = await db.collection("users");
    const users = await collection
        .aggregate([
            { $sort: sort },
            { $skip: offset },
            { $limit: limit },
            {
                $addFields: {
                    id: "$_id",
                },
            },
            { $unset: "_id" },
        ])
        .toArray();
    return users;
};
export const getUser = async (id) => {
    const db = await MongodbManager();
    const collection = await db.collection("users");
    const query = { _id: new ObjectId(id) };
    let aUser = await collection.findOne(query);
    aUser = formatObjectIdToFrontend(aUser);
    return aUser;
};
export const createUser = async (data) => {
    const db = await MongodbManager();
    const collection = await db.collection("users");
    const newDocument = {
        ...data,
        created_at: new Date(),
    };
    const createdUser = await collection.insertOne(newDocument);
    return createdUser;
};
export const updateUser = async (id, data) => {
    const db = await MongodbManager();
    const collection = await db.collection("users");
    const query = { _id: new ObjectId(id) };
    const update = {
        $set: data,
    };
    const updatedUser = await collection.updateOne(query, update);
    return updatedUser;
};
export const deleteUser = async (id) => {
    const db = await MongodbManager();
    const collection = await db.collection("users");
    const query = { _id: new ObjectId(id) };
    const deletedUser = await collection.deleteOne(query);
    return deletedUser;
};
