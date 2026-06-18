const GenresSchema = require('../models/genres')
const { ApiFeatures } = require('mongoose-advanced-query-string') // for Find() queries
const sanitize = require('mongo-sanitize')
module.exports = {
  createGenre: async (req, res) => {
    try {
      const token = req.header('x-token')
      if (!token) {
        return res.status(401).json({ error: true, message: 'unauthozired' })
      }
      if (token !== process.env.TOKEN_SECRET) {
        return res.status(401).json({ error: true, message: 'unauthozired' })
      }
      const genre = await GenresSchema.create(req.body)
      await genre.save()
      res.status(201).json(genre)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
  },
  editGenre: async (req, res) => {
    try {
      const token = req.header('x-token')
      if (!token) {
        return res.status(401).json({ error: true, message: 'unauthozired' })
      }
      if (token !== process.env.TOKEN_SECRET) {
        return res.status(401).json({ error: true, message: 'unauthozired' })
      }

      const genre = await GenresSchema.findByIdAndUpdate(req.params.id, {
        $set: req.body
      })
      res.status(200).json(genre)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
  },
  deleteGenre: async (req, res) => {
    const token = req.header('x-token')
    if (!token) {
      return res.status(401).json({ error: true, message: 'unauthozired' })
    }
    if (token !== process.env.TOKEN_SECRET) {
      return res.status(401).json({ error: true, message: 'unauthozired' })
    }
    try {
      await GenresSchema.findByIdAndDelete(req.params.id)
      res.status(200).json({ message: 'Genre deleted successfully' })
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
  },
  getAllGenres: async (req, res) => {
    try {
      const genres = GenresSchema.find()
        .select('name slug moviesCount _id coverPhoto')
        .lean()
      const sanitizedQuery = sanitize(req.query)
      const apiFeatures = new ApiFeatures(genres, sanitizedQuery)
        .filter()
        .sort('-moviesCount')
        .paginate()
      const docs = await apiFeatures.query
      res.status(200).json(docs)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
  },
  getGenre: async (req, res) => {
    try {
      const sanitizedId = sanitize(req.params.id)
      const genre = await GenresSchema.findById(sanitizedId)
      res.status(200).json(genre)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
  },
  getGenreBySlug: async (req, res) => {
    try {
      const sanitizedSlug = sanitize(req.params.slug)
      const genre = await GenresSchema.findOne({
        slug: sanitizedSlug
      })
        .select('name slug moviesCount description _id coverPhoto')
        .lean()

      res.status(200).json(genre)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
  }
}
