export const buildDataQuery = (query, interval, offset, limit) => {
    const shouldGroupByWeekOrMonth = interval === "W" || interval === "M";
    const dataQuery = [
        { $match: query },
        { $addFields: { dateObj: { $toDate: "$date" } } },
        { $sort: { dateObj: 1 } },
    ];

    if (shouldGroupByWeekOrMonth) {
        const groupingCriteria =
            interval === "W"
                ? { isoYear: { $isoWeekYear: "$dateObj" }, isoWeek: { $isoWeek: "$dateObj" } }
                : { year: { $year: "$dateObj" }, month: { $month: "$dateObj" } };
        dataQuery.push({
            $group: {
                _id: groupingCriteria,
                open: { $first: "$open" },
                close: { $last: "$close" },
                high: { $max: "$high" },
                low: { $min: "$low" },
                volume: { $sum: "$volume" },
                ticker: { $first: "$ticker" },
                source: { $first: "$source" },
                negotiableInstrumentId: { $first: "$negotiableInstrumentId" },
                date: { $last: "$dateObj" },
            },
        });
    } else {
        dataQuery.push({ $addFields: { date: "$dateObj" } });
    }

    dataQuery.push(
        { $sort: { date: -1 } },
        { $skip: offset },
        { $limit: limit },
        { $sort: { date: 1 } },
        {
            $lookup: {
                from: "negotiable_instruments",
                localField: "negotiableInstrumentId",
                foreignField: "id",
                as: "negotiableInstrument",
            },
        },
        { $unwind: { path: "$negotiableInstrument", preserveNullAndEmptyArrays: true } }
    );

    return dataQuery;
};

export const buildLatestDataQuery = (tickers = []) => [
    {
        $match: {
            ticker: { $in: tickers },
        },
    },

    {
        $set: {
            dateObj: { $toDate: "$date" },
        },
    },

    {
        $group: {
            _id: "$ticker",

            latestDocuments: {
                $topN: {
                    n: 2,
                    sortBy: {
                        dateObj: -1,
                    },
                    output: "$$ROOT",
                },
            },
        },
    },

    {
        $set: {
            latest: {
                $arrayElemAt: ["$latestDocuments", 0],
            },

            previous: {
                $arrayElemAt: ["$latestDocuments", 1],
            },
        },
    },

    {
        $replaceRoot: {
            newRoot: {
                $mergeObjects: [
                    "$latest",
                    {
                        previousClose: "$previous.close",
                        previousDate: "$previous.date",
                    },
                ],
            },
        },
    },

    {
        $lookup: {
            from: "negotiable_instruments",
            localField: "negotiableInstrumentId",
            foreignField: "id",
            as: "negotiableInstrument",
        },
    },

    {
        $unwind: {
            path: "$negotiableInstrument",
            preserveNullAndEmptyArrays: true,
        },
    },
];
