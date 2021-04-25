const express = require('express')
const router = express.Router()
const Cart = require('../models/Cart')
const Order = require("../models/Order")
const auth = require('../middleware/auth')

router.get("/", auth, async (req, res) => {
	try {
		const userId = req.user.id;
		const orders = await Order.find({userId: userId});
		console.log(orders);

		return res.json(orders);
	} catch (error) {
		res.status(400).json(error);
	}
})

// Creating an order
router.post("/", auth, async (req, res) => {
	try {
		const userId = req.user.id

		const cart = await Cart.findOne({userId})

		if (cart) {
			// proceed to checkout to create an order
			await Order.create({
				userId, 
				items: cart.items,
				total: cart.total
			})

			// Then empty the cart
			await Cart.findByIdAndDelete({_id: cart.id})
			return res.send("Checkout successfully my brotha")
		} else {
			return res.status(400)/send("Your cart is empty my brotha, you can't buy emptiness")
		}

	} catch (err) {
		return res.status(400).json(err)
	}
})

module.exports = router