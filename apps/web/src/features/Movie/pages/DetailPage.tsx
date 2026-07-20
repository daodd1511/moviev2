import { FC, memo } from 'react';

import { Detail } from '../components/Detail/Detail';

const DetailComponent: FC = () => <Detail />;

export const DetailPage = memo(DetailComponent);
