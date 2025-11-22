
import React from 'react';
import Omnichannel from '../modules/Omnichannel';
import { User } from '../types';

interface OmnichannelPageProps {
    user: User;
}

const OmnichannelPage: React.FC<OmnichannelPageProps> = ({ user }) => {
    return <Omnichannel user={user} />;
};

export default OmnichannelPage;
