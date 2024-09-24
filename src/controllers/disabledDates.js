const DisabledDates = require('../models/disabledDates')

const postDisabledDates = async (req, res) => {
	try {
		const promises = req.body.map(async date => {
			const checkAlreadyDisabledDate = await DisabledDates.findOne({
				disabledDate: date.disabledDate,
			})

			if (!checkAlreadyDisabledDate) {
				const disabledDates = new DisabledDates(date)
				await disabledDates.save()
			}
		})
		await Promise.all(promises).then(result => {
			return res.status(201).send({
				body: 'Даты успешно заблокировались!',
				errorMessage: null,
				errorCode: 0,
			})
		})
	} catch (e) {
		res.status(200).send({
			body: null,
			errorMessage: e.message,
			errorCode: 1,
		})
	}
}

const postUndisabledDates = async (req, res) => {
	try {
		const promises = req.body.map(async date => {
			const checkDisabledDate = await DisabledDates.findOne({
				disabledDate: date.disabledDate,
			})

			if (checkDisabledDate) {
				await DisabledDates.findOneAndDelete({
					disabledDate: date.disabledDate,
				})
			}
		})

		await Promise.all(promises).then(result => {
			return res.status(201).send({
				body: 'Даты успешно разблокировались!',
				errorMessage: null,
				errorCode: 0,
			})
		})
	} catch (e) {
		res.status(200).send({
			body: null,
			errorMessage: e.message,
			errorCode: 1,
		})
	}
}

const getDisabledDates = async (req, res) => {
	try {
		const disDates = await DisabledDates.find({})

		res.send({
			body: disDates,
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

module.exports = {
	getDisabledDates,
	postDisabledDates,
	postUndisabledDates,
}
