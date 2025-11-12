
import morgan from 'morgan';

// Structured log format with correlation ID
const format = (tokens, req, res) => {
	return JSON.stringify({
		time: new Date().toISOString(),
		id: req.id,
		method: tokens.method(req, res),
		url: tokens.url(req, res),
		status: tokens.status(req, res),
		contentLength: tokens.res(req, res, 'content-length'),
		responseTime: tokens['response-time'](req, res),
	});
};

export const requestLogger = morgan(format);
