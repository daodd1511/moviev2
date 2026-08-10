import { memo } from 'react';

import { CatalogByDiscover } from '@/shared/components/Catalog/CatalogByDiscover';

const TvByDiscoverComponent = () => <CatalogByDiscover mediaType="tv" />;

export const TvByDiscover = memo(TvByDiscoverComponent);
