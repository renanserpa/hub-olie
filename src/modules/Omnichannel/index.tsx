
import React from 'react';
import OmnichannelPanel from './OmnichannelPanel';
import { User } from '../../types';

interface OmnichannelProps {
    user: User;
}

const Omnichannel: React.FC<OmnichannelProps> = ({ user }) => {
    return <OmnichannelPanel user={user} />;
};

export default Omnichannel;
