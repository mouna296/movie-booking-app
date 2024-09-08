const express = require('express')
const dashboardController = require('../controllers/dashboardController')
const router = express.Router()
const Showtime = require('../models/Showtime');

const { protect, authorize } = require('../middleware/auth')

router.get('/occupancy', protect, authorize('admin'), async (req, res) => {
    const { period } = req.query; 
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(period));

    try {
        const occupancyData = await Showtime.aggregate([
            { $match: { showtime: { $gte: startDate, $lte: endDate } } },
            { $unwind: "$seats" },
            { $group: { _id: { movie: "$movie", theater: "$theater" }, totalSeatsSold: { $sum: 1 } } },
            { $lookup: { from: "theaters", localField: "_id.theater", foreignField: "_id", as: "theaterData" } },
            { $unwind: "$theaterData" },
            { $lookup: { from: "cinemas", localField: "theaterData.cinema", foreignField: "_id", as: "cinemaData" } },
            { $unwind: "$cinemaData" },
            { $lookup: { from: "movies", localField: "_id.movie", foreignField: "_id", as: "movieData" } },
            { $unwind: "$movieData" },
            { $project: { _id: 0, movie: "$movieData.name", theater: "$theaterData.name", location: "$cinemaData.location", totalSeatsSold: 1 } }
        ]);

        res.json({ success: true, data: occupancyData });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});


module.exports = router