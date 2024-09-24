const mongoose = require('mongoose')

const url = process.env.URL_RAY_DB
mongoose
	.connect(url)
	.then(res => console.log('connected to MongoDB'))
	.catch(err => console.log(`error to connection: ${err}`))
