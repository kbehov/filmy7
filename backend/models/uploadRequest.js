const mongoose = require('mongoose')

const UploadRequests = new mongoose.Schema(
  {
    movieName: String,
    email: String,
    status: {
      type: String,
      enum: ['pending', 'completed'],
    },
  },
  {
    timestamps: true,
  },
)
module.exports = mongoose.model('UploadRequest', UploadRequests)
