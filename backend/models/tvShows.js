// Require mongoose
const mongoose = require('mongoose')
const slugify = require('slugify')
// Create tv shows schema
const TvShowsSchema = new mongoose.Schema({
  title: String,
  year: Number,
  slug: String,
  rating: String,
  coverPhoto: String,
  description: String,
  genres: [],
  actors: [],
  videoUrl: String,
  tailerUrl: String,
  sources: [
    {
      name: String,
      url: String,
    },
  ],
  seasons: [
    {
      title: String,
      episodes: [
        {
          title: String,
          description: String,
          coverPhoto: String,
          videoUrl: String,
          tailerUrl: String,
          sources: [
            {
              name: String,
              url: String,
            },
          ],
        },
      ],
    },
  ],
})

TvShowsSchema.pre('save', function (next) {
  this.slug = slugify(this.title, { lower: true })
  next()
})

module.exports = mongoose.model('TvShows', TvShowsSchema)
