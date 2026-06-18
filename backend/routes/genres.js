const router = require('express').Router()
const genresController = require('../controllers/genres')
router.get('/genres/', genresController.getAllGenres)
router.post('/api/v/1/genres/create', genresController.createGenre)
router.post('/api/v/1/genres/edit/:id', genresController.editGenre)
router.delete('/api/v/1/genres/delete/:id', genresController.deleteGenre)
router.get('/api/v/1/genres/get/:id', genresController.getGenre)
router.get('/genre/:slug', genresController.getGenreBySlug)
module.exports = router
