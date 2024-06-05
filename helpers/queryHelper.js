const { Op } = require('sequelize');

exports.buildWhereClause = (filters) => {
  const {
    category_id, vendor_id, gold_type, gem_type,
    min_price, max_price, ...otherFilters
  } = filters;

  return {
    ...(category_id && { category_id }),
    ...(vendor_id && { vendor_id }),
    ...(gold_type && { gold_type }),
    ...(gem_type && { gem_type }),
    ...(min_price && { selling_price: { [Op.gte]: min_price } }),
    ...(max_price && { selling_price: { [Op.lte]: max_price } }),
    ...Object.entries(otherFilters).reduce((acc, [key, value]) => {
      if (value) acc[key] = value;
      return acc;
    }, {})
  };
};

exports.applySorting = (query, sort, order) => {
  const validSorts = ['product_name', 'selling_price', 'ratings', 'created_at'];
  const safeSort = validSorts.includes(sort) ? sort : 'created_at';
  const safeOrder = order === 'DESC' ? 'DESC' : 'ASC';
  return query.order([[safeSort, safeOrder]]);
};

exports.applyPagination = (query, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  return query.limit(limit).offset(offset);
};