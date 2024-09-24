const express = require('express')
const {
	getDisabledDates,
	postDisabledDates,
	postUndisabledDates,
} = require('../controllers/disabledDates')

const router = new express.Router()
router.post('/postDisabledDates', postDisabledDates)
router.post('/undisabledDates', postUndisabledDates)
router.get('/getDisabledDates', getDisabledDates)
module.exports = router
