import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';

export const notFound = (req, res, next) => {
  const error = new ApiError(404, `Not Found - ${req.originalUrl}`);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;
  
  if (!(err instanceof ApiError)) {
    statusCode = err.statusCode || 500;
    message = err.message || "Internal Server Error";
    logger.error(`[${statusCode}] ${message}`, { stack: err.stack, url: req.originalUrl, method: req.method });
  } else {
    logger.warn(`[${statusCode}] ${message}`, { url: req.originalUrl, method: req.method });
  }

  const response = {
    success: false,
    message,
    ...(err.errors && err.errors.length > 0 && { errors: err.errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  res.status(statusCode || 500).json(response);
};
