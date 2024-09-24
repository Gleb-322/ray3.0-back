const Patients = require('../models/patient')
const DisabledDates = require('../models/disabledDates')
const { sendEmail } = require('../emails/email')
const cron = require('node-cron')
const moment = require('moment')

const deleteAllPastPatients = async () => {
	const yesterday = moment().subtract(1, 'days').format('DD-MM-YYYY')

	await Patients.deleteMany({ date: yesterday })
}

cron.schedule('0 0 * * * *', () => {
	deleteAllPastPatients()
})

const createPatient = async (req, res) => {
	try {
		const { email, date, time } = req.body

		const existPatient = await Patients.findOne({ date, time })

		if (existPatient) {
			return res.send({
				body: existPatient,
				errorMessage: null,
				errorCode: 3,
			})
		}

		const patient = new Patients(req.body)
		await patient.save()

		if (email !== '') {
			const result = sendEmail(email, date, time)
			result
				.then(res => {})
				.catch(e => {
					return res.send({
						body: null,
						errorMessage: e.error,
						errorCode: 2,
					})
				})
		}

		const dates = await Patients.find({ date })

		if (dates.length === 16) {
			const disDate = new DisabledDates({
				disabledDate: date,
				full: true,
			})
			await disDate.save()
			getDisableDateWhenCreatedPatient(disDate.disabledDate)
		}
		res.status(201).send({
			body: patient,
			errorMessage: null,
			errorCode: 0,
		})
		getCreatedPatient(patient.date)
	} catch (e) {
		res.send({
			body: null,
			errorMessage: e.message,
			errorCode: 1,
		})
	}
}

const getTimeByDate = async (req, res) => {
	const { date } = req.body
	const timeArr = [
		'09-00',
		'09-30',
		'10-00',
		'10-30',
		'11-00',
		'11-30',
		'12-00',
		'12-30',
		'13-00',
		'13-30',
		'14-00',
		'14-30',
		'15-00',
		'15-30',
		'16-00',
		'16-30',
	]
	try {
		const dates = await Patients.find({ date })
		if (!dates) {
			return res.send({
				body: timeArr,
				errorMessage: null,
				errorCode: 0,
			})
		}
		const timesPatients = dates.map(el => el.time)

		const timeByDates = timeArr.filter(t => !timesPatients.includes(t))
		res.send({
			body: timeByDates,
			errorMessage: null,
			errorCode: 0,
		})
	} catch (e) {
		res.send({
			body: null,
			errorMessage: e.message,
			errorCode: 1,
		})
	}
}

const validatePhone = async (req, res) => {
	try {
		const adminPhone = '+373(777)-24-634'
		const { phone } = req.body

		const patient = await Patients.findOne({ phone })

		if (patient && patient.phone !== adminPhone) {
			return res.status(200).send({
				isValid: false,
				message: `Запись уже оформлена: ${patient.date} на ${patient.time}`,
			})
		} else {
			return res.status(200).send({
				isValid: true,
				message: null,
			})
		}
	} catch (e) {
		res.send({
			errorMessage: 'Ошибка сервера, попробуйте снова',
		})
	}
}

const getPatientByPhone = async (req, res) => {
	try {
		const adminPhoneNumber = '+373(777)-24-634'
		const { phone } = req.body

		const patient = await Patients.findOne({ phone })

		if (phone === adminPhoneNumber) {
			return res.status(200).send({
				body: null,
				adminPhone: true,
				errorMessage: null,
				errorCode: 0,
			})
		}

		if (!patient) {
			return res.status(200).send({
				body: null,
				adminPhone: false,
				errorMessage: null,
				errorCode: 0,
			})
		}

		if (patient && patient.phone !== adminPhoneNumber) {
			return res.status(200).send({
				body: patient,
				adminPhone: false,
				errorMessage: null,
				errorCode: 0,
			})
		}
	} catch (e) {
		res.send({
			body: null,
			adminPhone: false,
			errorMessage: e.message,
			errorCode: 1,
		})
	}
}

module.exports = {
	createPatient,
	getTimeByDate,
	getPatientByPhone,
	validatePhone,
}
