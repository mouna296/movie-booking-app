const Dashboard = require('../models/dashboard');

exports.getOccupancyData = async (req, res) => {
  try {
    // Sample data (you might fetch data from MongoDB)
    const occupancyData = [
      { movie: 'Movie A', occupancy: 50 },
      { movie: 'Movie B', occupancy: 75 },
      // Add more sample data as needed
    ];

    res.status(200).json({ success: true, data: occupancyData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};