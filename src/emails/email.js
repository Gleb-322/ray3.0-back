const sgMail = require('@sendgrid/mail')

const sendgridAPIKey = process.env.SENDGRID_API_KEY

sgMail.setApiKey(sendgridAPIKey)

const sendEmail = async (adress, date, time) => {
	const messageData = {
		from: {
			email: 'raycheva.org@gmail.com',
		},
		personalizations: [
			{
				to: [
					{
						email: adress,
					},
				],
				dynamic_template_data: {
					date,
					time,
				},
			},
		],
		template_id: 'd-a7e37655f7ff4639b320de11e956e357',
	}
	try {
		const response = await sgMail.send(messageData)
		console.log('send email')
		console.log('status code email', response[0].statusCode)
		return response[0].statusCode
	} catch (e) {
		return { error: e.message, code: e.code }
	}
}

module.exports = {
	sendEmail,
}
