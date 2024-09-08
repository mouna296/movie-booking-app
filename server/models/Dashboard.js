const mongoose = require('mongoose')

const DashboardSchema = new mongoose.Schema(
	{
		movie: {
			type: String,
			required: [true, 'Please add a name']
		},
		occupancy: {
			type: Number,
			required: [true, 'Please add a number']
		},
        date: {
            type: Date,
            default: Date.now,
          },
	}
)



module.exports = mongoose.model('Dashboard', DashboardSchema)