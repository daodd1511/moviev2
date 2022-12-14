import { memo } from 'react';

import { CreateNew } from '../components/CreateNew/CreateNew';

const NewComponent = () => (
  <div className="px-8 py-12">
    <h1>Create new list</h1>
    <CreateNew />
  </div>
);

export const NewPage = memo(NewComponent);
