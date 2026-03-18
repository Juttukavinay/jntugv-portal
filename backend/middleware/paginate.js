// Pagination middleware — adds paginate() helper to req
// Usage in routes: const { data, pagination } = await req.paginate(Model, query, options);

const paginateMiddleware = (req, res, next) => {
    req.paginate = async (Model, query = {}, options = {}) => {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || options.defaultLimit || 50, 200);
        const skip = (page - 1) * limit;
        const sort = req.query.sort ? JSON.parse(req.query.sort) : (options.defaultSort || { createdAt: -1 });

        const [data, totalCount] = await Promise.all([
            Model.find(query)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .select(options.select || '')
                .populate(options.populate || '')
                .lean(),
            Model.countDocuments(query)
        ]);

        const totalPages = Math.ceil(totalCount / limit);

        return {
            data,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        };
    };
    next();
};

module.exports = paginateMiddleware;
