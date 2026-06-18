const mongoose = require('mongoose')
const slugify = require('slugify')

const { Schema } = mongoose

const MovieSchema = new Schema(
  {
    title: {
      type: String,
      index: true,
    },
    original_title: {
      type: String,
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
      index: true,
    },
    movieImage: String,
    coverPhoto: String,
    year: Number,
    rating: Number,
    tmdb_id: Number,
    imdb_id: String,
    production_companies: [],
    countries: [],
    revenue: Number,
    budget: Number,
    videoType: {
      type: String,
      enum: ['video', 'iframe'],
      default: 'video',
    },

    quality: {
      type: String,
      enum: ['hd', 'cam', 'ts', 'sd'],
    },

    duration: Number,

    contentType: {
      type: String,
      enum: ['movie', 'series'],
      default: 'movie',
    },
    episodes: [
      {
        episodeNumber: Number,
        videoUrl: String,
        sources: [],
        subtitles: [],
      },
    ],
    seasson: Number,
    description: String,

    director: String,

    genres: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Genres',
      },
    ],
    actors: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Actors',
      },
    ],

    views: {
      type: Number,
      default: 0,
    },
    sources: [
      {
        name: String,
        url: String,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true, getters: true },
  },
)

MovieSchema.pre('save', async function (next) {
  const slug = slugify(this.title, {
    lower: true,
    strict: true,
    trim: true,
    strict: 'throw',
  })
  // check if slug is already taken
  const existingMovie = await this.model('Movie').findOne({ slug })
  if (existingMovie) {
    this.slug = `${slug}-${Math.random().toString(36).substring(2, 15)}`
  } else {
    this.slug = slug
  }

  next()
})

// Add compound indexes for search optimization
MovieSchema.index({ title: 1, rating: -1, views: -1 })
MovieSchema.index({ createdAt: -1 })

module.exports = mongoose.model('Movie', MovieSchema)
