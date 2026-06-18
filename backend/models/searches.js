const mongoose = require('mongoose')

const SearchQueries = new mongoose.Schema({
  query: String,
  count: Number,
  resultsFound: Number,
})
module.exports = mongoose.model('SearchQueries', SearchQueries)
