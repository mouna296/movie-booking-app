const Movie = require('../models/Movie')
const Showtime = require('../models/Showtime')
const Theater = require('../models/Theater')
const User = require('../models/User')
const SEAT_PRICE = 20;
const SERVICE_FEE=1.50;

//@desc     GET showtimes
//@route    GET /showtime
//@access   Public
exports.getShowtimes = async (req, res, next) => {
	try {
		const showtimes = await Showtime.find({ isRelease: true })
			.populate([
				'movie',
				{ path: 'theater', populate: { path: 'cinema', select: 'name' }, select: 'number cinema seatPlan' }
			])
			.select('-seats.user -seats.row -seats.number')

		res.status(200).json({ success: true, count: showtimes.length, data: showtimes })
	} catch (err) {
		console.log(err)
		res.status(400).json({ success: false, message: err })
	}
}

//@desc     GET showtimes with all unreleased showtime
//@route    GET /showtime/unreleased
//@access   Private admin
exports.getUnreleasedShowtimes = async (req, res, next) => {
	try {
		const showtimes = await Showtime.find()
			.populate([
				'movie',
				{ path: 'theater', populate: { path: 'cinema', select: 'name' }, select: 'number cinema seatPlan' }
			])
			.select('-seats.user -seats.row -seats.number')

		res.status(200).json({ success: true, count: showtimes.length, data: showtimes })
	} catch (err) {
		console.log(err)
		res.status(400).json({ success: false, message: err })
	}
}

//@desc     GET single showtime
//@route    GET /showtime/:id
//@access   Public
exports.getShowtime = async (req, res, next) => {
	try {
		const showtime = await Showtime.findById(req.params.id)
			.populate([
				'movie',
				{ path: 'theater', populate: { path: 'cinema', select: 'name' }, select: 'number cinema seatPlan' }
			])
			.select('-seats.user')

		if (!showtime) {
			return res.status(400).json({ success: false, message: `Showtime not found with id of ${req.params.id}` })
		}

		if (!showtime.isRelease) {
			return res.status(400).json({ success: false, message: `Showtime is not released` })
		}

		res.status(200).json({ success: true, data: showtime })
	} catch (err) {
		console.log(err)
		res.status(400).json({ success: false, message: err })
	}
}

//@desc     GET single showtime with user
//@route    GET /showtime/user/:id
//@access   Private Admin
exports.getShowtimeWithUser = async (req, res, next) => {
	try {
		const showtime = await Showtime.findById(req.params.id).populate([
			'movie',
			{ path: 'theater', populate: { path: 'cinema', select: 'name' }, select: 'number cinema seatPlan' },
			{ path: 'seats', populate: { path: 'user', select: 'username email role' } }
		])

		if (!showtime) {
			return res.status(400).json({ success: false, message: `Showtime not found with id of ${req.params.id}` })
		}

		res.status(200).json({ success: true, data: showtime })
	} catch (err) {
		console.log(err)
		res.status(400).json({ success: false, message: err })
	}
}

//@desc     Add Showtime
//@route    POST /showtime
//@access   Private
exports.addShowtime = async (req, res, next) => {
	try {
		const { movie: movieId, showtime: showtimeString, theater: theaterId, repeat = 1, isRelease } = req.body

		if (repeat > 31 || repeat < 1) {
			return res.status(400).json({ success: false, message: `Repeat is not a valid number between 1 to 31` })
		}

		let showtime = new Date(showtimeString)
		let showtimes = []
		let showtimeIds = []

		const theater = await Theater.findById(theaterId)

		if (!theater) {
			return res.status(400).json({ success: false, message: `Theater not found with id of ${req.params.id}` })
		}

		const movie = await Movie.findById(movieId)

		if (!movie) {
			return res.status(400).json({ success: false, message: `Movie not found with id of ${movieId}` })
		}

		for (let i = 0; i < repeat; i++) {
			const showtimeDoc = await Showtime.create({ theater, movie: movie._id, showtime, isRelease })

			showtimeIds.push(showtimeDoc._id)
			showtimes.push(new Date(showtime))
			showtime.setDate(showtime.getDate() + 1)
		}
		theater.showtimes = theater.showtimes.concat(showtimeIds)

		await theater.save()

		res.status(200).json({
			success: true,
			showtimes: showtimes
		})
	} catch (err) {
		console.log(err)
		res.status(400).json({ success: false, message: err })
	}
}

function calculateTicketPrice(isPremiumUser, seats, isTuesday, isBefore6PM,discount) {
	console.log('discounted ?',discount)
	const basePrice = isPremiumUser ? SEAT_PRICE : SEAT_PRICE + SERVICE_FEE;
	const specialPrice = 10;
  
	if (discount&&(isTuesday || isBefore6PM)) {
	  return specialPrice * seats.length;
	}
  
	return basePrice * seats.length;
  }
  


//@desc     Purchase seats
//@route    POST /showtime/:id
//@access   Private

exports.purchase = async (req, res, next) => {
    try {
      const { seats, useRewardPoints, discount } = req.body;
	  console.log('request in purchase api', req.body)
      const user = req.user;
	  const isPremiumUser = user.membership === 'Premium';
  
      const showtime = await Showtime.findById(req.params.id).populate({
        path: 'theater',
        select: 'seatPlan'
      })
  
      if (!showtime) {
        return res
          .status(400)
          .json({ success: false, message: `Showtime not found with id of ${req.params.id}` })
      }
	  
      const isSeatValid = seats.every((seatNumber) => {
        const [row, number] = seatNumber.match(/([A-Za-z]+)(\d+)/).slice(1)
        const maxRow = showtime.theater.seatPlan.row
        const maxCol = showtime.theater.seatPlan.column
  
        if (maxRow.length !== row.length) {
          return maxRow.length > row.length
        }
  
        return maxRow.localeCompare(row) >= 0 && number <= maxCol
      })
  
      if (!isSeatValid) {
        return res.status(400).json({ success: false, message: 'Seat is not valid' })
      }
  
      const isSeatAvailable = seats.every((seatNumber) => {
        const [row, number] = seatNumber.match(/([A-Za-z]+)(\d+)/).slice(1)
        return !showtime.seats.some((seat) => seat.row === row && seat.number === parseInt(number, 10))
      })
  
      if (!isSeatAvailable) {
        return res.status(400).json({ success: false, message: 'Seat not available' })
      }
	  const currentDate = new Date();
    const isTuesday = currentDate.getDay() === 2; // 2 corresponds to Tuesday
    const isBefore6PM = currentDate.getHours() < 18; // Assuming 24-hour format

    const purchaseAmount = calculateTicketPrice(isPremiumUser, seats, isTuesday, isBefore6PM,discount);
	console.log('purchase amount',purchaseAmount)
	  let rewardPointsEarned;

      if (useRewardPoints) {
         const rewardPointsRequired = purchaseAmount
  
        if (user.rewardPoints < rewardPointsRequired) {
          return res
            .status(400)
            .json({ success: false, message: 'Not enough reward points to make the purchase' })
        }
  
		user.rewardPoints -= rewardPointsRequired;
  		rewardPointsEarned = -rewardPointsRequired;
		console.log('payment by points',user.rewardPoints)

      } else {
         const rewardPointsFetched= purchaseAmount
  
        user.rewardPoints += rewardPointsFetched
		rewardPointsEarned = +rewardPointsFetched;

		console.log('payment by cash',user.rewardPoints)
      }
	  //await user.save()
	  //console.log('reward points',rewardPointsRequired)
	  //console.log('rewardPointsEarned',rewardPointsEarned)
      const seatUpdates = seats.map((seatNumber) => {
        const [row, number] = seatNumber.match(/([A-Za-z]+)(\d+)/).slice(1)
        return { row, number: parseInt(number, 10), user: user._id }
      })
  
      showtime.seats.push(...seatUpdates)
      const updatedShowtime = await showtime.save()
  
      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        {
          $push: { tickets: { showtime : showtime._id, seats: seatUpdates } },
		  $inc: { rewardPoints: rewardPointsEarned }

        },
        { new: true }
      )
  
      res.status(200).json({ success: true, data: updatedShowtime, updatedUser })
      console.log('user rewards', updatedUser.rewardPoints)
    } catch (err) {
      console.log(err)
      res.status(400).json({ success: false, message: err.message })
    }
  }



//@desc     Update showtime
//@route    PUT /showtime/:id
//@access   Private Admin
exports.updateShowtime = async (req, res, next) => {
	try {
		const showtime = await Showtime.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true
		})

		if (!showtime) {
			return res.status(400).json({ success: false, message: `Showtime not found with id of ${req.params.id}` })
		}
		res.status(200).json({ success: true, data: showtime })
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}

//@desc     Delete single showtime
//@route    DELETE /showtime/:id
//@access   Private Admin
exports.deleteShowtime = async (req, res, next) => {
	try {
		const showtime = await Showtime.findById(req.params.id)

		if (!showtime) {
			return res.status(400).json({ success: false, message: `Showtime not found with id of ${req.params.id}` })
		}

		await showtime.deleteOne()

		res.status(200).json({ success: true })
	} catch (err) {
		console.log(err)
		res.status(400).json({ success: false, message: err })
	}
}

//@desc     Delete showtimes
//@route    DELETE /showtime
//@access   Private Admin
exports.deleteShowtimes = async (req, res, next) => {
	try {
		const { ids } = req.body

		let showtimesIds

		if (!ids) {
			// Delete all showtimes
			showtimesIds = await Showtime.find({}, '_id')
		} else {
			// Find showtimes based on the provided IDs
			showtimesIds = await Showtime.find({ _id: { $in: ids } }, '_id')
		}

		for (const showtimeId of showtimesIds) {
			await showtimeId.deleteOne()
		}

		res.status(200).json({ success: true, count: showtimesIds.length })
	} catch (err) {
		console.log(err)
		res.status(400).json({ success: false, message: err })
	}
}

//@desc     Delete previous day showtime
//@route    DELETE /showtime/previous
//@access   Private Admin
exports.deletePreviousShowtime = async (req, res, next) => {
	try {
		const currentDate = new Date()
		currentDate.setHours(0, 0, 0, 0)

		const showtimesIds = await Showtime.find({ showtime: { $lt: currentDate } }, '_id')

		for (const showtimeId of showtimesIds) {
			await showtimeId.deleteOne()
		}

		res.status(200).json({ success: true, count: showtimesIds.length })
	} catch (err) {
		console.log(err)
		res.status(400).json({ success: false, message: err })
	}
}

//@desc     cancel tickets 
//@route    DELETE /showtime/cancel/:id
//@access   public 
exports.cancelTicket = async (req, res,next) => {
	try {
  
	  const ticketId = req.params.id;
	  console.log('Request ID', ticketId);
  
	  // Find the user who owns the ticket
	  const user = await User.findOne({ 'tickets._id': ticketId });
	  console.log('user:',user)
	  if (!user) {
		return res.status(404).json({ success: false, message: 'Ticket not found.' });
	  }
  
	  // Find the ticket within the user's tickets
	  const ticket = user.tickets.id(ticketId);
	  console.log('ticket retrieved',ticket)
	  if (!ticket) {
		return res.status(404).json({ success: false, message: 'Ticket not found.' });
	  }
  
	  // Assuming that the showtime ID is stored in the ticket
	  // and you have a separate Showtime model
  
	  const showtime = await Showtime.findById(ticket.showtime._id);
	  console.log('trying to find showtime',showtime)
	  if (!showtime) {
		return res.status(404).json({ success: false, message: 'Showtime not found.' });
	  }
  
	  console.log('dateTime in showtime', showtime.showtime)
	  // Check if showtime is in the past
	  if (new Date(showtime.showtime) < new Date()) {
		return res.status(400).json({ success: false, message: 'Cannot cancel past showtimes.' });
	  }
	  const refundAmount = calculateRefundAmount(ticket.seats.length);

  
	  // Proceed with ticket cancellation
	   const result = await User.updateOne(
		  { 'tickets._id': ticketId },
		  { $pull: { tickets: { _id: ticketId } },
		  $inc: { rewardPoints: refundAmount }
		}
		);
	
		if (result.modifiedCount === 0) {
		  return res.status(404).json({ success: false, message: 'Ticket not found.' });
		}
	  res.json({ success: true, message: 'Ticket cancelled successfully.' });
  
  
	} catch (error) {
	  console.error('Cancellation error:', error);
	  res.status(500).json({ success: false, message: 'Error cancelling ticket.' });
	}
  }
  function calculateRefundAmount(canceledSeats ) {
	// Your logic to calculate the refund amount based on the number of canceled seats and discount status
	//const baseTicketPrice = isDiscounted ? 10 : 20;
	const refundAmount = canceledSeats * SEAT_PRICE;
  
	return refundAmount;
  }