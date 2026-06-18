const { check, validationResult } = require('express-validator')

// Middleware for sanitizing query and body
const sanitizeInputs = [
  // Sanitize query parameters
  (req, res, next) => {
    for (const key in req.query) {
      req.query[key] = sanitizeString(req.query[key])
    }
    next()
  },

  [
    check('*').escape().trim() // Escape and trim all inputs
  ],

  // Handle validation errors
  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    next()
  }
]

// Helper function to sanitize strings
const sanitizeString = (str) => {
  if (typeof str === 'string') {
    return str.replace(/<[^>]*>?/gm, '') // Remove HTML tags
  }
  return str
}

module.exports = sanitizeInputs
