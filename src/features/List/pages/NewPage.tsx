import { memo } from 'react';

const NewComponent = () => {
    const a = 1;
    return <div>add</div>;
    };

export const NewPage = memo(NewComponent);
