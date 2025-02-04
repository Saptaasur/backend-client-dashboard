// middleware/errorHandler.js

const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', details: err.errors });
    }
  
    res.status(500).json({ message: 'Internal server error' });
  };
  
  module.exports = errorHandler;
  