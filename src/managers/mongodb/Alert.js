import { ObjectId } from "mongodb";
import MongodbManager from "../../adapters/DAOMongodbManager";
import { appLogger } from "../../logger";
import { formatAlertToBackend } from "../_helpersDb/parseToBackend";
import { formatAlertToFrontend } from "../_helpersDb/parseToFrontend";

export const syncFixtures = async () => {
    const db = await MongodbManager();
    const collection = await db.collection("alerts");
    const alertCount = await collection.count();
    appLogger.info(`There is ${alertCount} alerts`);
    if (alertCount === 0) {
        appLogger.info(`Adding alerts ... `);
        let alertsFixtures = require("../../fixtures/alerts.json");
        alertsFixtures = alertsFixtures.map(async (elem) => {
            const aceCollection = await db.collection("alert_condition_expressions");
            const acoCollection = await db.collection("alert_condition_operations");
            const uCollection = await db.collection("users");
            const niCollection = await db.collection("negotiable_instruments");
            const aceQuery1 = { id: elem.parameter1 };
            const aceQuery2 = { id: elem.parameter2 };
            const acoQuery = { id: elem.condition };
            const uQuery = { id: elem.userId };
            const niQuery = { id: elem.userId };
            const ace1 = await aceCollection.findOne(aceQuery1);
            const ace2 = await aceCollection.findOne(aceQuery2);
            const aco = await acoCollection.findOne(acoQuery);
            const u = await uCollection.findOne(uQuery);
            const ni = await niCollection.findOne(niQuery);
            const newElem = {
                ...elem,
                _id: new ObjectId(elem.id),
                parameter1: ace1._id,
                parameter2: ace2._id,
                condition: aco._id,
                userId: u._id,
                sourceNegotiableInstrumentId: ni._id,
            };
            return newElem;
        });
        alertsFixtures = await Promise.all(alertsFixtures);
        await collection.insertMany(alertsFixtures.map((elem) => formatAlertToBackend(elem)));
        const alertConditionOperationCount = await collection.count();
        appLogger.info(`There is ${alertConditionOperationCount} alerts`);
    } else {
        appLogger.info(`No needs to add alerts`);
    }
};

export const getAlerts = async (res, { offset = 0, limit = 1000 }, sort = { description: 1 }) => {
    const db = await MongodbManager();
    const collection = await db.collection("alerts");
    let alerts = await collection.aggregate([
        { $sort: sort },
        { $skip: offset },
        { $limit: limit },
        {
            $lookup: {
                from: "alerts_target_negotiable_instruments",
                localField: "_id",
                foreignField: "alertId",
                as: "negotiable_instruments",
            },
        },
        {
            $addFields: {
                id: "$_id",
            },
        },
        { $unset: "_id" },
    ]);
    alerts = await alerts.toArray();
    alerts = alerts.map((alert) => formatAlertToFrontend(alert));
    return alerts;
};
export const getAlert = async (id) => {
    const db = await MongodbManager();
    const collection = await db.collection("alerts");
    const query = { _id: new ObjectId(id) };
    let foundAlert = await collection.aggregate([
        { $match: query },
        {
            $lookup: {
                from: "alerts_target_negotiable_instruments",
                localField: "_id",
                foreignField: "alertId",
                as: "negotiable_instruments",
            },
        },
        {
            $addFields: {
                id: "$_id",
            },
        },
        { $unset: "_id" },
    ]);
    if (!foundAlert.hasNext()) return null;
    foundAlert = await foundAlert.next();
    foundAlert = formatAlertToFrontend(foundAlert);
    return foundAlert;
};
export const createAlert = async (data) => {
    const db = await MongodbManager();
    const collection = await db.collection("alerts");
    const newDocument = {
        ...formatAlertToBackend(data),
        created_at: new Date(),
    };
    const createdAlert = await collection.insertOne(newDocument);
    return createdAlert;
};
export const updateAlert = async (id, data) => {
    const db = await MongodbManager();
    const collection = await db.collection("alerts");
    const query = { _id: new ObjectId(id) };
    const newDocument = {
        ...formatAlertToBackend(data),
        created_at: new Date(),
    };
    const update = {
        $set: newDocument,
    };
    const updatedAlert = await collection.updateOne(query, update);
    return updatedAlert;
};
export const deleteAlert = async (id) => {
    const db = await MongodbManager();
    const collection = await db.collection("alerts");
    const query = { _id: new ObjectId(id) };
    const deletedAlert = await collection.deleteOne(query);
    return deletedAlert;
};
