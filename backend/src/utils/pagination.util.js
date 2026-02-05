/**
 * Pagination Utility
 * Formats standardized pagination metadata.
 */
class PaginationUtil {
    /**
     * Format pagination data
     * @param {number} totalItems - Total records in DB
     * @param {number} page - Current page
     * @param {number} limit - Items per page
     * @returns {Object} Pagination metadata
     */
    static format(totalItems, page, limit) {
        const totalPages = Math.ceil(totalItems / limit);
        return {
            totalItems,
            totalPages,
            currentPage: parseInt(page),
            pageSize: parseInt(limit),
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        };
    }
}

export default PaginationUtil;
