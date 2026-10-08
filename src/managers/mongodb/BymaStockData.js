import MongodbManager from "../../adapters/DAOMongodbManager";
import { appLogger } from "../../logger";
import { formatNegotiableInstrumentToBackend } from "../_helpersDb/parseToBackend";
import { getBondTermsByInstrument, enrichWithBondMetrics } from "./helpers/bymaStockDataHelpers";
import { buildDataQuery, buildLatestDataQuery } from "./helpers/bymaStockDataQueryBuilder";
import {
    parseExpression,
    formatTickerDataForExpression,
    collectAllTradingDates,
    calculateForEachDate,
    processSingleTicker,
} from "./helpers/bymaStockDataExpressionProcessor";

export const syncFixtures = async () => {
    const db = await MongodbManager();
    const collection = await db.collection("byma_stock_data");
    const count = await collection.count();
    appLogger.info(`There is ${count} bymaStockData`);

    if (count === 0) {
        appLogger.info(`Adding bymaStockData ... `);
        const negotiableInstruments = await db
            .collection("negotiable_instruments")
            .find({})
            .toArray();
        const fixtures = require("../../fixtures/bymaStocksData.json");
        await collection.insertMany(
            fixtures.map((elem) =>
                formatNegotiableInstrumentToBackend(elem, negotiableInstruments)
            ),
            { validate: true }
        );
        appLogger.info(`There is ${await collection.count()} bymaStockData`);
    }
};

export const getBymaStocksData = async (
    { offset = 0, limit = 100, interval = "D" },
    query = {}
) => {
    const db = await MongodbManager();
    const collection = await db.collection("byma_stock_data");

    const dataQuery = buildDataQuery(query, interval, offset, limit);
    const bondTermsByInstrument = await getBondTermsByInstrument(db);
    const rawData = await collection.aggregate(dataQuery).toArray();

    return enrichWithBondMetrics(rawData, bondTermsByInstrument);
};

export const getBymaStocksDataByExpression = async (
    expression,
    { offset, limit, interval },
    query
) => {
    const components = parseExpression(expression);
    if (components.length === 0) {
        throw new Error("No valid tickers found in expression");
    }

    if (components.length === 1 && components[0].hasMultipleFields) {
        const tickerData = await getBymaStocksData(
            { offset, limit, interval },
            { ...query, ticker: components[0].ticker }
        );
        return processSingleTicker(expression, components[0], tickerData);
    }

    const tickerHistoricalData = {};
    for (const component of components) {
        if (tickerHistoricalData[component.ticker]) continue;

        const rawData = await getBymaStocksData(
            { offset, limit, interval },
            { ...query, ticker: component.ticker }
        );
        tickerHistoricalData[component.ticker] = formatTickerDataForExpression(rawData, component);
    }

    const allTradingDates = collectAllTradingDates(tickerHistoricalData);

    return calculateForEachDate(expression, allTradingDates, tickerHistoricalData, components);
};

export const getLatestBymaStocksData = async (tickers = []) => {
    if (!tickers.length) {
        return [];
    }

    const db = await MongodbManager();
    const collection = await db.collection("byma_stock_data");

    const dataQuery = buildLatestDataQuery(tickers);

    const bondTermsByInstrument = await getBondTermsByInstrument(db);
    const rawData = await collection.aggregate(dataQuery).toArray();

    return enrichWithBondMetrics(rawData, bondTermsByInstrument);
};
