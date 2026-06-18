const router = require('express').Router()
const actorsController = require('../controllers/actors')

router.post('/api/v/1/actors/create', actorsController.createActor)
router.post('/api/v/1/actors/edit/:id', actorsController.editActor)
router.post('/api/v/1/actors/delete/:id', actorsController.deleteActor)
router.get('/api/v/1/actors/get-actor/:id', actorsController.getActor)
router.get('/actors/', actorsController.getAllActors)
router.get('/actors/search', actorsController.searchActor)
router.get('/actor/:slug', actorsController.getActorBySlug)
router.get('/api/v/1/actors/count', actorsController.actorsCount)
router.get('/api/v1/actros/fix', actorsController.matchActors)
module.exports = router
