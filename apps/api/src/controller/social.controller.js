import SocialService from '../service/socialService.js';

const follow = async (req, res) => {
  await SocialService.follow(req.userId, req.params.username);
  res.status(204).end();
};

const unfollow = async (req, res) => {
  await SocialService.unfollow(req.userId, req.params.username);
  res.status(204).end();
};

const getProfile = async (req, res) => {
  res.status(200).json(await SocialService.getPublicProfile(req.params.username, req.userId));
};

const listFollowers = async (req, res) => {
  res.status(200).json({ followers: await SocialService.listFollowers(req.params.username) });
};

const listFollowing = async (req, res) => {
  res.status(200).json({ following: await SocialService.listFollowing(req.params.username) });
};

const like = async (req, res) => {
  await SocialService.like(req.userId, req.params.id);
  res.status(204).end();
};

const unlike = async (req, res) => {
  await SocialService.unlike(req.userId, req.params.id);
  res.status(204).end();
};

const discoverCollections = async (req, res) => {
  res.status(200).json({ collections: await SocialService.discoverCollections(req.query) });
};

const getCollection = async (req, res) => {
  res.status(200).json(await SocialService.getPublicCollection(req.params.id, req.userId));
};

const SocialController = {
  follow,
  unfollow,
  getProfile,
  listFollowers,
  listFollowing,
  like,
  unlike,
  discoverCollections,
  getCollection,
};

export default SocialController;
