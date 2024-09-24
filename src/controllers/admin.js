const Patients = require('../models/patient')
const Admin = require('../models/admin')
const bcrypt = require('bcryptjs')
const DisabledDates = require('../models/disabledDates')
const { sendEmail } = require('../emails/email')

// login admin page
const loginAdmin = async (req, res) => {
	try {
		const { login, password } = req.body
		const admin = await Admin.findOne({
			login,
		})

		if (!admin) {
			return res.status(200).send({
				token: null,
				errorMessage: 'Неверный логин или пароль!',
				errorCode: 2,
			})
		}

		const isMatch = await bcrypt.compare(password, admin.password)

		if (!isMatch) {
			return res.status(200).send({
				token: null,
				errorMessage: 'Неверный логин или пароль!',
				errorCode: 2,
			})
		}

		const token = await admin.generateAuthToken()
		res.send({
			token,
			errorMessage: null,
			errorCode: 0,
		})
	} catch (e) {
		res.status(200).send({
			token: null,
			errorMessage: e.message,
			errorCode: 1,
		})
	}
}

// logout admin page
const logoutAdmin = async (req, res) => {
	try {
		req.admin.tokens = req.admin.tokens.filter(
			token => token.token !== req.token
		)

		await req.admin.save()
		res.send({
			message: 'Успех',
			errorCode: 0,
		})
	} catch (e) {
		res.send({
			message: e.message,
			errorCode: 1,
		})
	}
}

// CRUD in admin page
// get all patients from db to admin page
const getPatients = async (req, res) => {
	try {
		const patients = await req.patientsPerPage
		const countPatients = await req.count

		res.send({
			body: patients,
			count: countPatients,
			errorMessage: null,
			errorCode: 0,
		})
	} catch (e) {
		res.status(200).send({
			body: null,
			count: null,
			errorMessage: e.message,
			errorCode: 1,
		})
	}
}

// update data one patient in db
const updatePatients = async (req, res) => {
	try {
		const updatePatientBodyOnbject = {
			name: req.body.name,
			phone: req.body.phone,
			email: req.body.email,
			date: req.body.date,
			time: req.body.time,
			_id: req.body._id,
		}
		const patient = await Patients.findOneAndUpdate(
			{
				_id: req.body._id,
			},
			updatePatientBodyOnbject,
			{
				returnDocument: 'after',
			}
		)

		if (!patient) {
			return res.send({
				body: null,
				errorMessage: 'Такой пациент не найден!',
				errorCode: 2,
			})
		}

		if (req.body.previousEmail === '' && req.body.email !== '') {
			const result = sendEmail(req.body.email, req.body.date, req.body.time)
			result
				.then(res => {})
				.catch(e => {
					return res.send({
						body: null,
						errorMessage: e.error,
						errorCode: 3,
					})
				})
		}

		if (req.body.previousEmail !== '' && req.body.email !== '') {
			if (
				req.body.previousEmail !== req.body.email ||
				req.body.previousDate !== req.body.date ||
				req.body.previousTime !== req.body.time
			) {
				const result = sendEmail(req.body.email, req.body.date, req.body.time)
				result
					.then(res => {})
					.catch(e => {
						return res.send({
							body: null,
							errorMessage: e.error,
							errorCode: 3,
						})
					})
			}
		}

		const countOfNewDates = await Patients.find({ date: req.body.date })
		const countOfPrevDates = await Patients.find({
			date: req.body.previousDate,
		})

		if (countOfNewDates.length === 16) {
			if (req.body.date !== req.body.previousDate) {
				const newDisDate = await new DisabledDates({
					disabledDate: req.body.date,
					full: true,
				})
				await newDisDate.save()
			}
		} else {
			await DisabledDates.findOneAndDelete({
				disabledDate: req.body.date,
			})
		}

		if (countOfPrevDates.length === 16) {
			if (req.body.date !== req.body.previousDate) {
				const newDisDate = await new DisabledDates({
					disabledDate: req.body.previousDate,
					full: true,
				})
				await newDisDate.save()
			}
		} else {
			await DisabledDates.findOneAndDelete({
				disabledDate: req.body.previousDate,
			})
		}

		res.send({
			body: patient,
			errorMessage: null,
			errorCode: 0,
		})
	} catch (e) {
		res.status(200).send({
			body: null,
			errorMessage: e.message,
			errorCode: 1,
		})
	}
}

// delete one patient from db
const deletePatients = async (req, res) => {
	try {
		const patient = await Patients.findOneAndDelete({ _id: req.params.id })
		if (!patient) {
			return res.send({
				body: null,
				errorMessage: 'Такой пациент не найден!',
				errorCode: 2,
			})
		}

		const checkDisableDate = await DisabledDates.findOne({
			disabledDate: patient.date,
		})

		if (checkDisableDate) {
			await DisabledDates.findOneAndDelete({ disabledDate: patient.date })
		}

		res.send({
			body: patient,
			errorMessage: null,
			errorCode: 0,
		})
	} catch (e) {
		res.status(200).send({
			body: null,
			errorMessage: e.message,
			errorCode: 1,
		})
	}
}

module.exports = {
	getPatients,
	loginAdmin,
	updatePatients,
	deletePatients,
	logoutAdmin,
}
