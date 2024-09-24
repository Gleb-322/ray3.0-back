const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const adminSchema = new mongoose.Schema({
	login: {
		type: String,
		required: true,
	},
	password: {
		type: String,
		required: true,
	},
	tokens: [
		{
			token: {
				type: String,
				required: true,
			},
		},
	],
})

adminSchema.methods.generateAuthToken = async function () {
	const admin = this
	const token = jwt.sign({ _id: admin._id.toString() }, process.env.JWT_SECRET)
	admin.tokens = admin.tokens.concat({ token })
	await admin.save()
	return token
}

const Admin = new mongoose.model('Admin', adminSchema)

module.exports = Admin
