import CatalogSyncService from '../service/catalogSyncService.js';
const args = process.argv.slice(2);
const value = flag => {
  const index = args.indexOf(flag);
  return index === -1 ? undefined : args[index + 1];
};
const result = await CatalogSyncService.run({
  cursor: value('--cursor') ?? null,
  limit: Number(value('--limit') ?? 100),
  dryRun: !args.includes('--execute'),
});
console.log(JSON.stringify(result));
