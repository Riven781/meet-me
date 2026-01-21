import { AppError } from "../errors/AppError.js";

export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof AppError) {
    const response = { code: err.code };

    if (err.details) {
      response.details = err.details;
    }

    res.status(err.statusCode).json(response);

  }


  return res.status(500).json({
    code: "INTERNAL_SERVER_ERROR"
  });
}
