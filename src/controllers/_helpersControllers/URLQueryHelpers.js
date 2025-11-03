export function getOffsetByQuery(query) {
    const defaultOffset = 0;
    let offset = parseInt(query.offset, defaultOffset);
    if (isNaN(offset) || offset < 1) {
        offset = defaultOffset;
    }
    return offset;
}
export function getOffset(page = 0, perPage = 20) {
    return page > 0 ? (page - 1) * perPage : page;
}
export function getLimit(query) {
    const defaultLimit = 10000;
    let limit = parseInt(query.limit, defaultLimit);
    if (isNaN(limit)) {
        limit = defaultLimit;
    } else if (limit > defaultLimit) {
        limit = defaultLimit;
    } else if (limit < 1) {
        limit = 1;
    }
    return limit;
}
