import moment from "moment";

export const logger = (req, res, next) => {
  console.log(`Request: ${req.method} ${req.protocol}://${req.get('host')}${req.originalUrl}: ${moment().format()}`);
  next();
}
