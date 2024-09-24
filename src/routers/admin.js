const express = require('express')
const {
	getPatients,
	loginAdmin,
	updatePatients,
	deletePatients,
	logoutAdmin,
} = require('../controllers/admin')
const auth = require('../middleware/auth')
const pagination = require('../middleware/pagination')

const router = new express.Router()

router.post('/admin/login', loginAdmin)
router.get('/admin/patients', [auth, pagination], getPatients)
router.patch('/admin/patients', auth, updatePatients)
router.delete('/admin/patients/:id', auth, deletePatients)
router.post('/admin/logout', auth, logoutAdmin)

module.exports = router
