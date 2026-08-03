import ReleaseCalendarService from '../service/releaseCalendarService.js';
const list = async (req, res) =>
  res.status(200).json({ releases: await ReleaseCalendarService.list(req.userId, req.query) });
export default { list };
