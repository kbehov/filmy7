const ActorsSchema = require('../models/actors')
const { ApiFeatures } = require('mongoose-advanced-query-string')
const sanitize = require('mongo-sanitize')
module.exports = {
  // create actor
  createActor: async (req, res) => {
    try {
      const token = req.header('x-token')
      if (!token) {
        return res.status(401).json({ error: true, message: 'unauthozired' })
      }
      if (token !== process.env.TOKEN_SECRET) {
        return res.status(401).json({ error: true, message: 'unauthozired' })
      }

      const actor = await ActorsSchema.create(req.body)
      await actor.save()
      res.status(201).json(actor)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
  },
  // edit actor
  editActor: async (req, res) => {
    try {
      const token = req.header('x-token')
      if (!token) {
        return res.status(401).json({ error: true, message: 'unauthozired' })
      }
      if (token !== process.env.TOKEN_SECRET) {
        return res.status(401).json({ error: true, message: 'unauthozired' })
      }

      const actor = await ActorsSchema.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      })
      res.status(200).json(actor)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
  },
  // delete actor
  deleteActor: async (req, res) => {
    try {
      const token = req.header('x-token')
      if (!token) {
        return res.status(401).json({ error: true, message: 'unauthozired' })
      }
      if (token !== process.env.TOKEN_SECRET) {
        return res.status(401).json({ error: true, message: 'unauthozired' })
      }
      await ActorsSchema.findByIdAndDelete(req.params.id)
      res.status(200).json({ message: 'Actor deleted successfully' })
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
  },
  // get all actors
  getAllActors: async (req, res) => {
    try {
      // get all actors with movies count greater than 1
      const actors = ActorsSchema.find().select('name slug avatar moviesCount _id').lean()

      const apiFeatures = new ApiFeatures(actors, req.query).filter().sort('-moviesCount').paginate()
      const [count, docs] = await Promise.all([ActorsSchema.countDocuments(), apiFeatures.query])
      const totalPages = Math.ceil(count / 20)
      const page = apiFeatures.page || 1
      console.log(docs)
      return res.status(200).json({ data: docs, count, totalPages, page })
    } catch (err) {
      console.log('Err Mesage Get Actors', err.message)
      res.status(400).json({ message: err.message })
    }
  },
  // get actor by id
  getActor: async (req, res) => {
    try {
      const sanitizedId = sanitize(req.params.id)
      const actor = await ActorsSchema.findById(sanitizedId)
      res.status(200).json(actor)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
  },
  getActorBySlug: async (req, res) => {
    try {
      const { slug } = req.params
      const sanitizedSlug = sanitize(slug)
      const actor = await ActorsSchema.findOne({ slug: sanitizedSlug })
      return res.status(200).json(actor)
    } catch (err) {
      return res.status(500).json({ error: true, message: err.message })
    }
  },
  searchActor: async (req, res) => {
    try {
      const { term } = req.query
      const sanitizedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const lower = RegExp(sanitizedTerm, 'i')
      const actor = await ActorsSchema.find({
        name: lower,
      }).limit(10)
      res.status(200).json(actor)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
  },
  actorsCount: async (req, res) => {
    try {
      const count = await ActorsSchema.countDocuments()
      res.status(200).json({ count })
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
  },
  // match actors with movies
  matchActors: async (req, res) => {
    try {
      await ActorsSchema.deleteMany({ moviesCount: 0 })

      return res.status(200).json({ msg: 'Actors Deleted!' })
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
  },
}
