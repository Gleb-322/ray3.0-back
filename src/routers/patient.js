const express = require('express')
const {
	createPatient,
	getTimeByDate,
	getPatientByPhone,
	validatePhone,
} = require('../controllers/patients')

const router = new express.Router()

router.post('/patients', createPatient)
router.post('/patients/time', getTimeByDate)
router.post('/patients/check', getPatientByPhone)
router.post('/patients/phone', validatePhone)

module.exports = router
