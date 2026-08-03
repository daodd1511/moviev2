import { toCollectionDto } from '../dto/collection.dto.js';
import CollectionCompatibilityService from '../service/collectionCompatibilityService.js';
import CollectionService from '../service/collectionService.js';

const list = async (req, res) => {
  const collections = await CollectionService.listForUser(req.userId);
  res.status(200).json({ collections: collections.map(toCollectionDto) });
};

const get = async (req, res) => {
  const collection = await CollectionService.getAccessible(req.userId, req.params.id);
  res.status(200).json(toCollectionDto(collection));
};

const create = async (req, res) => {
  const collection = await CollectionService.create(req.userId, req.body);
  res.status(201).json(toCollectionDto(collection));
};

const update = async (req, res) => {
  const { version, ...input } = req.body;
  const collection = await CollectionService.update(req.userId, req.params.id, input, version);
  res.status(200).json(toCollectionDto(collection));
};

const addItem = async (req, res) => {
  const collection = await CollectionService.addItem(
    req.userId,
    req.params.id,
    req.body.item,
    req.body.version,
  );
  res.status(200).json(toCollectionDto(collection));
};

const removeItem = async (req, res) => {
  const { version } = req.body;
  const collection = await CollectionService.removeItem(
    req.userId,
    req.params.id,
    req.params,
    version,
  );
  res.status(200).json(toCollectionDto(collection));
};

const reorderItems = async (req, res) => {
  const collection = await CollectionService.reorderItems(
    req.userId,
    req.params.id,
    req.body.items,
    req.body.version,
  );
  res.status(200).json(toCollectionDto(collection));
};

const duplicate = async (req, res) => {
  const collection = await CollectionService.duplicate(req.userId, req.params.id);
  res.status(201).json(toCollectionDto(collection));
};

const remove = async (req, res) => {
  await CollectionService.remove(req.userId, req.params.id, req.body.version);
  res.status(204).end();
};

const getLegacyPublic = async (req, res) => {
  const result = await CollectionCompatibilityService.getLegacyPublic(
    req.params.username,
    req.params.listId,
  );
  if (result === null)
    return res.status(404).json({ error: { code: 'list_not_found', message: 'List not found.' } });
  res
    .status(200)
    .json(result.source === 'collection' ? toCollectionDto(result.value) : result.value);
};

const CollectionController = {
  list,
  get,
  create,
  update,
  addItem,
  removeItem,
  reorderItems,
  duplicate,
  remove,
  getLegacyPublic,
};

export default CollectionController;
