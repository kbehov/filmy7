// create movie genres model in mongoDB
// Require mongoose
const mongoose = require('mongoose')
const slugify = require('slugify')
// Create movie genres schema
const GenresSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      index: true,
    },
    description: String,
    coverPhoto: String,
    moviesCount: {
      type: Number,
      default: 0,
    },
    movies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
      },
    ],
    slug: {
      type: String,
      unique: true,
      index: true,
    },
  },
  { timestamps: true }
)
GenresSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true, strict: true, trim: true })
  next()
})
module.exports = mongoose.model('Genres', GenresSchema)
