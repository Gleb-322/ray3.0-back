module.exports = io => {
	io.on('connection', socket => {
		console.log('patient connected:', socket.id)

		global.getCreatedPatient = date => {
			io.emit('registratedPatient', date)
		}

		global.getDisableDateWhenCreatedPatient = disDate => {
			console.log(disDate)
			io.emit('disabledDate', disDate)
		}

		socket.on('disconnect', () => {
			console.log('patient disconnected:', socket.id)
		})
	})
}
