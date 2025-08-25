class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  // Handle filtering
  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Special handling for createdAt ranges
    if (queryObj.createdAt) {
      const now = new Date();
      let fromDate;

      switch (queryObj.createdAt) {
        case '6_hours':
          fromDate = new Date(now.getTime() - 6 * 60 * 60 * 1000);
          break;
        case '12_hours':
          fromDate = new Date(now.getTime() - 12 * 60 * 60 * 1000);
          break;
        case '24_hours':
          fromDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7_days':
          fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '14_days':
          fromDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
          break;
        case '30_days':
          fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90_days':
          fromDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case 'all_time':
        default:
          fromDate = null;
      }

      if (fromDate) {
        queryObj.createdAt = { $gte: fromDate };
      } else {
        delete queryObj.createdAt;
      }
    }

    // Support advanced filtering like ?price[gte]=500
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  // Handle sorting
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt'); // default: newest first
    }

    return this;
  }

  // Handle field limiting
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  // Handle pagination
  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
