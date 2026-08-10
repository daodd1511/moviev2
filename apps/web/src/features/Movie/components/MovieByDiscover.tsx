import { memo } from 'react';

import { CatalogByDiscover } from '@/shared/components/Catalog/CatalogByDiscover';

const MovieByDiscoverComponent = () => <CatalogByDiscover mediaType="movie" />;

export const MovieByDiscover = memo(MovieByDiscoverComponent);
