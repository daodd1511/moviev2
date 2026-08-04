import ShareService from '../service/shareService.js';
import { AppError } from '../errors/app-error.js';

const getCollectionCard = async (req, res) => {
  const origin = `${req.protocol}://${req.get('host')}`;
  const html = await ShareService.renderCollectionCard(req.params.id, origin);
  if (html === null)
    throw new AppError({
      status: 404,
      code: 'collection_not_found',
      message: 'Collection not found.',
    });
  res.status(200).type('html').send(html);
};

const ShareController = { getCollectionCard };

export default ShareController;
