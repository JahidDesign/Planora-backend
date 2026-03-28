import { validationResult } from 'express-validator';

export const validate = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const fields = {};
  result.array().forEach(e => {
    if (!fields[e.path]) fields[e.path] = e.msg; // first error per field wins
  });

  return res.status(422).json({ error: 'Validation failed', fields });
};