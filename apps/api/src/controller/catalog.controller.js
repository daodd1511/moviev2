import CatalogService from '../service/catalogService.js';

const search = async (req, res) => res.status(200).json(await CatalogService.search(req.query));
const discover = async (req, res) => res.status(200).json(await CatalogService.discover(req.query));
const getMedia = async (req, res) =>
  res.status(200).json(await CatalogService.getMedia(req.params));
const getReleaseSchedule = async (req, res) =>
  res.status(200).json(await CatalogService.getReleaseSchedule(req.query));
const getGenres = async (req, res) =>
  res.status(200).json(await CatalogService.getGenres(req.query));

export default { search, discover, getMedia, getReleaseSchedule, getGenres };
