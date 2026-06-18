const MovieSchema = require('../models/movie')
const GenresSchema = require('../models/genres')
const ActorsSchema = require('../models/actors')
const { isValidObjectId } = require('mongoose')
const { ApiFeatures, AggregateFeatures } = require('mongoose-advanced-query-string')
const mongoose = require('mongoose')
const sanitize = require('mongo-sanitize')

module.exports = {
  importer: async (req, res) => {
    try {
      const {
        name,
        tmdb_id,
        description,
        poster,
        backdrop_image,
        imdb_id,
        imdb_rating,
        genres,
        original_title,
        duration,
        release_year,
        director,
        actors,
        video_url,
        trailer_url,
        budget,
        production_companies,
        countries_of_origin,
      } = req.body

      // check if the movie already exists
      const movie = await MovieSchema.findOne({ tmdb_id }).lean()
      if (movie) {
        return res.status(400).json({ message: 'Movie already exists' })
      }

      // Process actors more efficiently
      const actorsArray = []
      const actorsPromises = actors.map(async actor => {
        const existingActor = await ActorsSchema.findOne({
          name: { $regex: actor.name, $options: 'i' },
        }).lean()

        if (existingActor) {
          actorsArray.push(existingActor._id)
        } else {
          const newActor = await ActorsSchema.create({
            name: actor.name,
            avatar: actor.image,
          })
          actorsArray.push(newActor._id)
        }
      })

      // Process genres more efficiently
      const genresArray = []
      const genresPromises = genres.map(async genre => {
        const existingGenre = await GenresSchema.findOne({
          name: { $regex: genre, $options: 'i' },
        }).lean()

        if (existingGenre) {
          genresArray.push(existingGenre._id)
        } else {
          const newGenre = await GenresSchema.create({
            name: genre,
          })
          genresArray.push(newGenre._id)
        }
      })

      // Wait for all promises to resolve
      await Promise.all([...actorsPromises, ...genresPromises])

      const payload = {
        title: name,
        original_title,
        tmdb_id,
        description,
        movieImage: poster,
        coverPhoto: backdrop_image,
        imdb_id,
        rating: imdb_rating,
        genres: genresArray,
        actors: actorsArray,
        duration: duration,
        year: parseInt(release_year),
        director,
        production_companies,
        countries: countries_of_origin,
        video_url: video_url,
        trailer_url,
        budget,
        contentType: 'movie',
        videoType: 'iframe',
        videoUrl: video_url,
        tailerUrl: trailer_url,
        sources: [
          {
            name: 'VidRu',
            url: video_url,
          },
        ],
      }

      const newMovie = await MovieSchema.create(payload)
      await ActorsSchema.updateMany({ _id: { $in: actorsArray } }, { $inc: { moviesCount: 1 } })
      return res.status(200).json({ message: 'ok', id: newMovie._id })
    } catch (err) {
      console.error('Movie import error:', err)
      return res.status(500).json({ message: 'Internal server error', error: err.message })
    }
  },
  importTvSeries: async (req, res) => {
    try {
      const { genres, actors } = req.body

      // const token = req.header('x-token')
      // if (!token) {
      //   return res.status(401).json({ error: true, message: 'unauthozired' })
      // }
      // if (token !== process.env.TOKEN_SECRET) {
      //   return res.status(401).json({ error: true, message: 'unauthozired' })
      // }

      const actorsArray = []
      const actorsPromises = actors.map(async actor => {
        const existingActor = await ActorsSchema.findOne({
          name: { $regex: actor.name, $options: 'i' },
        }).lean()

        if (existingActor) {
          actorsArray.push(existingActor._id)
        } else {
          const newActor = await ActorsSchema.create({
            name: actor.name,
            avatar: actor.image,
          })
          actorsArray.push(newActor._id)
        }
      })

      // Process genres more efficiently
      const genresArray = []
      const genresPromises = genres.map(async genre => {
        const existingGenre = await GenresSchema.findOne({
          name: { $regex: genre, $options: 'i' },
        }).lean()

        if (existingGenre) {
          genresArray.push(existingGenre._id)
        } else {
          const newGenre = await GenresSchema.create({
            name: genre,
          })
          genresArray.push(newGenre._id)
        }
      })

      // Wait for all promises to resolve
      await Promise.all([...actorsPromises, ...genresPromises])

      const payload = {
        ...req.body,

        contentType: 'series',
        genres: genresArray,
        actors: actorsArray,
      }
      const newSeries = await MovieSchema.create(payload)
      return res.status(200).json({ message: 'ok', id: newSeries._id })
    } catch (err) {
      console.log('err', err.message)
      return res.status(500).json({ message: 'Internal server error', error: err.message })
    }
  },

  // increase views
  increaseViews: async (req, res) => {
    try {
      const sanitizedId = req.params.id
      const movie = await MovieSchema.findByIdAndUpdate(sanitizedId, {
        $inc: { views: 1 },
      })
      return res.status(200).json(movie)
    } catch (err) {
      return res.status(500).json({ message: err.message })
    }
  },
  // get all movies
  getAllMovies: async (req, res) => {
    try {
      const sanitizedQuery = sanitize(req.query)
      // const { genres, type, actors, isBgAudio, year, page = 1, limit = 20, sort = '-createdAt' } = sanitizedQuery
      const {
        genres,
        type,
        actors,
        isBgAudio,
        year,
        page = 1,
        limit = 20,
        contentType = 'movie',
        sort: sortParam = '-createdAt',
      } = sanitizedQuery
      // ✅ Safe parse — coerce to numbers
      const parsedPage = Math.max(1, parseInt(page, 10) || 1)
      const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20))

      // ✅ Guard — actors may not be provided
      //const filterActors = Array.isArray(actors) ? actors.filter(actor => isValidObjectId(actor)) : []
      const filterActors = Array.isArray(actors)
        ? actors.filter(actor => isValidObjectId(actor))
        : typeof actors === 'string'
          ? [actors]
          : []
      // ✅ Build filter
      const filter = {}
      if (genres) filter.genres = genres
      if (type) filter.type = type
      if (filterActors.length > 0) filter.actors = { $in: filterActors }
      if (year) filter.year = parseInt(year, 10)
      if (contentType) filter.contentType = contentType
      const sortObject = {}
      if (sortParam) {
        sortParam
          .split(',')
          .map(item => item.trim())
          .forEach(value => {
            if (value.startsWith('-')) {
              sortObject[value.slice(1)] = -1 // e.g. "-createdAt" → { createdAt: -1 }
            } else if (value.includes(':')) {
              const [field, direction] = value.split(':')
              sortObject[field] = direction === 'asc' ? 1 : -1 // e.g. "year:asc" → { year: 1 }
            } else {
              sortObject[value] = 1 // e.g. "createdAt" → { createdAt: 1 }
            }
          })
      }

      // ✅ isBgAudio — convert string to boolean
      if (isBgAudio !== undefined) {
        filter.isBgAudio = isBgAudio === 'true' || isBgAudio === true
      }
      const movies = MovieSchema.find().populate([
        {
          path: 'genres',
          select: 'name slug',
        },
        {
          path: 'actors',
          select: 'name slug avatar moviesCount',
        },
      ])
      const apiFeatures = new ApiFeatures(movies, req.query).filter()
      apiFeatures.query = apiFeatures.query.sort(Object.keys(sortObject).length > 0 ? sortObject : { createdAt: -1 })
      const query = apiFeatures.paginate()

      // ✅ Run count and query in parallel
      const [moviesCount, docs] = await Promise.all([MovieSchema.countDocuments(filter), query.query])

      const totalPages = Math.ceil(moviesCount / parsedLimit)

      return res.status(200).json({
        data: docs,
        moviesCount,
        totalPages,
        page: parsedPage,
        limit: parsedLimit,
      })
    } catch (err) {
      console.error('[getAllMovies]', err.message)
      return res.status(400).json({ message: err.message })
    }
  },
  // get movie by id
  getMovieById: async (req, res) => {
    try {
      const sanitizedId = sanitize(req.params.id)
      const movie = await MovieSchema.findById(sanitizedId)
      const availableActors = await ActorsSchema.find({
        _id: { $in: movie.actors },
      }).select('name _id')
      const data = {
        movie,
        availableActors,
      }
      res.status(200).json(data)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
  },

  getRecommendations: async (req, res) => {
    try {
      const sanitizedBody = sanitize(req.body)
      const { genres, year, rating } = sanitizedBody
      const sanitizedId = sanitize(req.params.id)
      const pageNum = Math.max(1, parseInt(req.query.page, 10) || 1)
      const limitNum = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100)
      const normalizedGenres = Array.isArray(genres) ? genres : []
      const genresId = normalizedGenres
        .map(genre => (typeof genre === 'string' ? genre : genre?._id))
        .filter(genreId => mongoose.Types.ObjectId.isValid(genreId))
        .map(genreId => mongoose.Types.ObjectId(genreId))

      const recommendations = MovieSchema.aggregate([
        {
          $match: {
            genres: { $in: genresId },
            _id: { $ne: mongoose.Types.ObjectId(sanitizedId) },
          },
        },
        {
          $lookup: {
            from: 'genres',
            as: 'genres',
            let: { movieGenres: '$genres' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: ['$_id', '$$movieGenres'],
                  },
                },
              },
              {
                $project: {
                  _id: 1,
                  name: 1,
                  slug: 1,
                },
              },
            ],
          },
        },
        {
          $project: {
            _id: 1,
            title: 1,
            year: 1,
            rating: 1,
            slug: 1,
            movieImage: 1,
            coverPhoto: 1,
            movieLength: 1,
            type: 1,
            distance: {
              $sqrt: {
                $add: [
                  { $pow: [{ $subtract: ['$year', Number(year)] }, 2] },
                  { $pow: [{ $subtract: ['$rating', Number(rating)] }, 2] },
                ],
              },
            },
            views: 1,
            likes: 1,
            genres: 1,
            tailerUrl: 1,
            createdAt: 1,
            episodesCount: 1,
            isBgAudio: 1,
            lastAddedEpisodeDate: 1,
          },
        },
        {
          // Stable tie-breaker prevents page boundary duplicates when distance is equal.
          $sort: { distance: 1, _id: 1 },
        },
      ])
      const features = new AggregateFeatures(recommendations, req.query).paginate(pageNum, limitNum)
      const docs = await features.aggregate

      return res.status(200).json(docs)
    } catch (err) {
      console.log(err.message)
      return res.status(400).json({ message: err.message })
    }
  },

  searchMovie: async (req, res) => {
    try {
      const { term, page = 1, limit = 10 } = req.query

      // Validate and sanitize term
      if (!term || typeof term !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Search term is required and must be a string',
        })
      }

      // Improved sanitation that handles special characters correctly
      const sanitizedTerm = term.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

      if (sanitizedTerm.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Search term must be at least 2 characters long',
        })
      }

      const regx = new RegExp(sanitizedTerm, 'i')

      // Use the same query for both count and aggregate to ensure consistency
      const searchQuery = {
        $or: [
          { title: regx },
          { original_title: regx },
          { description: regx },
          // Removing the problematic fields from the initial query
          // We'll handle actors and directors in the aggregation pipeline instead
        ],
      }

      // Run count in parallel with the main query for better performance
      const countPromise = MovieSchema.countDocuments(searchQuery)

      const movies = MovieSchema.aggregate([
        { $match: searchQuery },
        // Add text score if you have text indexes
        {
          $addFields: {
            score: {
              $add: [
                {
                  $cond: {
                    if: { $regexMatch: { input: { $toString: '$title' }, regex: regx } },
                    then: 10,
                    else: 0,
                  },
                },
                {
                  $cond: {
                    if: {
                      $regexMatch: {
                        input: { $toString: { $ifNull: ['$description', ''] } },
                        regex: regx,
                      },
                    },
                    then: 5,
                    else: 0,
                  },
                },
                // Removed actors/directors regex checks since they're causing issues
                // Add points if the movie has matching actors or directors (using $in instead of regex)
                {
                  $cond: {
                    if: {
                      $gt: [
                        {
                          $size: {
                            $filter: {
                              input: { $ifNull: ['$actors', []] },
                              as: 'actor',
                              cond: {
                                $regexMatch: {
                                  input: { $toString: { $ifNull: ['$actor.name', ''] } },
                                  regex: regx,
                                },
                              },
                            },
                          },
                        },
                        0,
                      ],
                    },
                    then: 3,
                    else: 0,
                  },
                },
                {
                  $cond: {
                    if: {
                      $gt: [
                        {
                          $size: {
                            $filter: {
                              input: { $ifNull: ['$directors', []] },
                              as: 'director',
                              cond: {
                                $regexMatch: {
                                  input: {
                                    $toString: { $ifNull: ['$director.name', ''] },
                                  },
                                  regex: regx,
                                },
                              },
                            },
                          },
                        },
                        0,
                      ],
                    },
                    then: 3,
                    else: 0,
                  },
                },
                // Boost newer movies slightly (with null check)
                {
                  $cond: {
                    if: { $ifNull: ['$createdAt', null] },
                    then: {
                      $multiply: [
                        {
                          $divide: [
                            {
                              $subtract: [{ $year: { $ifNull: ['$createdAt', new Date()] } }, 2000],
                            },
                            23,
                          ],
                        },
                        2,
                      ],
                    },
                    else: 0,
                  },
                },
              ],
            },
          },
        },
        {
          $lookup: {
            from: 'genres',
            as: 'genres',
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: ['$_id', '$$parentId'],
                  },
                },
              },
              {
                $project: {
                  _id: 1,
                  name: 1,
                  slug: 1,
                },
              },
            ],
            let: { parentId: '$genres' },
          },
        },
        {
          $project: {
            _id: 1,
            title: 1,
            year: 1,
            rating: 1,
            slug: 1,
            movieImage: 1,
            coverPhoto: 1,
            movieLength: 1,
            type: 1,
            seasson: 1,
            episodesCount: 1,
            lastAddedEpisodeDate: 1,
            views: 1,
            likes: 1,
            genres: 1,

            tailerUrl: 1, // Fixed typo in field name from 'tailerUrl'
            createdAt: 1,
            score: 1, // Use the calculated score
          },
        },
        { $sort: { score: -1, views: -1, _id: -1 } }, // Add a stable sort with _id
      ])

      // Apply pagination with proper parsing of page and limit
      const pageNum = parseInt(page, 10) || 1
      const limitNum = parseInt(limit, 10) || 10

      // Apply reasonable limits to prevent DoS
      const safeLimitNum = Math.min(Math.max(limitNum, 1), 100)

      const aggregator = new AggregateFeatures(movies, req.query).paginate(pageNum, safeLimitNum)

      // Execute both promises concurrently
      const [countResults, docs] = await Promise.all([countPromise, aggregator.aggregate])

      // Include pagination metadata in response
      return res.status(200).json({
        success: true,
        pagination: {
          total: countResults,
          page: pageNum,
          limit: safeLimitNum,
          pages: Math.ceil(countResults / safeLimitNum),
        },
        results: docs,
      })
    } catch (err) {
      console.error('Search movie error:', err)
      return res.status(500).json({
        success: false,
        message: 'An error occurred while searching movies',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined,
      })
    }
  },
  getMovieBySlug: async (req, res) => {
    try {
      const sanitizedSlug = sanitize(req.params.slug)
      const movie = await MovieSchema.findOne({ slug: sanitizedSlug })
        .select(
          'title year rating slug movieImage coverPhoto movieLength views likes genres tailerUrl actors videoUrl sources description director contentType original_title videoType createdAt episodes createdAt episodesCount production_companies countries revenue budget seasson tmdb_id imdb_id',
        )
        .populate([
          {
            path: 'genres',
            select: 'name slug',
          },
          {
            path: 'actors',
            select: 'name slug avatar moviesCount',
          },
        ])
        .lean()
      return res.status(200).json(movie)
    } catch (err) {
      console.log(err.message)
      return res.status(400).json({ message: err.message })
    }
  },
  countMovies: async (req, res) => {
    try {
      const count = await MovieSchema.find().count()
      res.status(200).json({ totalMovies: count })
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
  },

  getSiteMap: async (req, res) => {
    try {
      const movies = await MovieSchema.find({ contentType: 'movie' })
        .select('slug updatedAt createdAt')
        .limit(9000)
        .sort({ createdAt: -1 })
        .lean()
      return res.status(200).json(movies)
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  },
  getSeriesSiteMap: async (req, res) => {
    try {
      const series = await MovieSchema.find({ contentType: 'series' })
        .select('slug updatedAt createdAt')
        .limit(6000)
        .sort({ createdAt: -1 })
      res.status(200).json(series)
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  },
  getSeriesSeasons: async (req, res) => {
    try {
      const { id } = req.params
      const currentSeries = await MovieSchema.findById(id).select('tmdb_id')
      const series = await MovieSchema.find({
        contentType: 'series',
        tmdb_id: currentSeries.tmdb_id,
        _id: { $ne: new mongoose.Types.ObjectId(id) },
      })
        .select('title seasson slug')
        .sort({ seasson: 1 })
        .limit(30)
        .lean()

      return res.status(200).json({
        data: series,
      })
    } catch (err) {
      console.log(err.message)
      res.status(500).json({ message: err.message })
    }
  },
}
