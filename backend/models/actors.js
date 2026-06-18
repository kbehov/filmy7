// create movie actors model in mongoDB
// Require mongoose
const mongoose = require('mongoose')
const slugify = require('slugify')
// Create movie actors schema
const ActorsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      index: true,
    },
    description: String,
    avatar: String,
    moviesCount: Number,
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    oscares: Number,
    born: {
      type: Date,
      default: null,
    },
    awards: Number,
    nominations: Number,
    movies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true, getters: true },
  },
)

ActorsSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true, strict: true, trim: true, strict: 'throw' })
  next()
})

module.exports = mongoose.model('Actors', ActorsSchema)
