const RateLimit = require('express-rate-limit');

// Create and use the rate limiter
const limiter = RateLimit({
	// Rate limiter configuration
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: 'draft-8',
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
	ipv6Subnet: 56,
})

module.exports = {limiter};