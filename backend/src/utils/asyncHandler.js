/** Envolve o handler e joga o erro pro errorHandler, evitando repetir try/catch em cada controller. */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
