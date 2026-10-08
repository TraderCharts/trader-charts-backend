import MongodbManager from "../../adapters/DAOMongodbManager";
/* 
export const syncFixtures = async () => {
  let db = await MongodbManager();
  let collection = await db.collection('rss_feeds_data');
  let rssFeedsDataCount = await collection.count();
  appLogger.info(`There is ${rssFeedsDataCount} rssFeedsData`);
  if (rssFeedsDataCount === 0) {
    appLogger.info(`Adding rssFeedsData ... `);
    const negotiableInstrumentsCollection = await db.collection('negotiable_instruments');
    const negotiableInstruments = await negotiableInstrumentsCollection.find({}).toArray();
    const rssFeedsDataFixtures = require('../../fixtures/rssFeedsData.json');
    await collection.insertMany(
      rssFeedsDataFixtures.map((elem) =>
        formatNegotiableInstrumentToBackend(elem, negotiableInstruments)
      ),
      { validate: true }
    );
    let rssFeedsDataConditionOperationCount = await collection.count();
    appLogger.info(`There is ${rssFeedsDataConditionOperationCount} rssFeedsData`);
  } else {
    appLogger.info(`No needs to add rssFeedsData`);
  }
}; */

export const getRssFeedsData = async ({ offset = 0, limit = 100 }, query = {}) => {
    const db = await MongodbManager();
    const collection = await db.collection("rss_feeds_data");
    let rssFeedsData = await collection.aggregate([
        { $match: query },
        {
            $lookup: {
                from: "feed_sentiment_analysis",
                localField: "_id",
                foreignField: "feedId",
                as: "sentiment_info",
            },
        },
        {
            $lookup: {
                from: "feed_topic_analysis",
                localField: "_id",
                foreignField: "feedId",
                as: "topic_info",
            },
        },
        {
            $lookup: {
                from: "rss_sources",
                localField: "sourceId",
                foreignField: "id",
                as: "source_info",
            },
        },
        {
            $addFields: {
                source_name: { $arrayElemAt: ["$source_info.name", 0] },
                category: { $arrayElemAt: ["$source_info.category", 0] },
            },
        },
        {
            $project: { source_info: 0 },
        },
        { $sort: { pubDate: -1 } },
        { $skip: offset },
        { $limit: limit },
        { $sort: { pubDate: 1 } },
        { $unset: "_id" },
        { $unset: "source_info" },
    ]);
    rssFeedsData = await rssFeedsData.toArray();
    return rssFeedsData;
};
