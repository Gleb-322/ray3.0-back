const mongoose = require('mongoose')

const disabledDatesSchema = new mongoose.Schema({
	disabledDate: {
		type: String,
	},
	full: {
		type: Boolean,
		default: false,
	},
})

const DisabledDates = new mongoose.model('DisabledDates', disabledDatesSchema)

module.exports = DisabledDates
