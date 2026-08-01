import express from 'express';

const ROUTE_METHODS = ['get', 'post', 'put', 'patch', 'delete'];

const wrapAsync = handler => (req, res, forwardError) => {
  Promise.resolve(handler(req, res, forwardError)).catch(err => forwardError(err));
};

/**
 * Creates an `express.Router()` whose `get`/`post`/`put`/`patch`/`delete` handlers auto-
 * forward rejected promises to `next(error)`. Route files use this instead of
 * `express.Router()` so a controller that throws or rejects reaches `errorHandler`
 * instead of leaking an unhandled rejection or hanging the request.
 */
export const createRouter = () => {
  const instance = express.Router();
  for (const method of ROUTE_METHODS) {
    const original = instance[method].bind(instance);
    instance[method] = (path, ...handlers) => original(path, ...handlers.map(wrapAsync));
  }
  return instance;
};
