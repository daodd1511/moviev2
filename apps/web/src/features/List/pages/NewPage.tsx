import { memo } from 'react';

import { CreateNew } from '../components/CreateNew/CreateNew';

const NewComponent = () => (
  <div className="px-4 py-8 md:px-8 md:py-12">
    <h1 className="text-2xl font-semibold md:text-3xl">Create new list</h1>
    <CreateNew />
  </div>
);

export const NewPage = memo(NewComponent);
