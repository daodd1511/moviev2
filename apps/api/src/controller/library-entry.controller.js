import { toLibraryEntryDto } from '../dto/library-entry.dto.js';
import LibraryEntryService from '../service/libraryEntryService.js';

const list = async (req, res) => {
  const entries = await LibraryEntryService.list(req.userId, req.query);
  res.status(200).json({ entries: entries.map(toLibraryEntryDto) });
};

const upsert = async (req, res) => {
  const entry = await LibraryEntryService.upsert(req.userId, req.body);
  res.status(200).json(toLibraryEntryDto(entry));
};

const remove = async (req, res) => {
  await LibraryEntryService.remove(req.userId, req.params.mediaType, req.params.tmdbId);
  res.status(204).send();
};

const LibraryEntryController = { list, upsert, remove };

export default LibraryEntryController;
