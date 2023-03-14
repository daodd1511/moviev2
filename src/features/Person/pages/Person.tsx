import { memo, FC } from 'react';
import { useParams } from 'react-router-dom';

import { PersonQueries } from '@/stores/queries/personQueries';

const Person: FC = () => {
    const { id } = useParams();
    const {
        data: personDetail,
    } = PersonQueries.useDetail(Number(id));
    return (
      <div>
        <h3><pre>{JSON.stringify(personDetail, null, 2)}</pre></h3>
      </div>
    );
};

export const PersonPage = memo(Person);
