import React, { useState } from 'react';
import TabLayout from '../ui/TabLayout';
import { MarketingSegment, MarketingTemplate } from '../../types';
import SegmentManager from './SegmentManager';
import TemplateEditor from './TemplateEditor';
import { Users, LayoutTemplate } from 'lucide-react';

const SETTINGS_TABS = [
    { id: 'segments', label: 'Segmentos', icon: Users },
    { id: 'templates', label: 'Templates', icon: LayoutTemplate },
];

interface MarketingSettingsTabProps {
    segments: MarketingSegment[];
    templates: MarketingTemplate[];
    isLoading: boolean;
    onNewSegment: () => void;
    onEditSegment: (segment: MarketingSegment) => void;
}

const MarketingSettingsTab: React.FC<MarketingSettingsTabProps> = ({ segments, templates, isLoading, onNewSegment, onEditSegment }) => {
    const [activeTab, setActiveTab] = useState('segments');

    const renderContent = () => {
        switch (activeTab) {
            case 'segments':
                return <SegmentManager segments={segments} isLoading={isLoading} onNew={onNewSegment} onEdit={onEditSegment} />;
            case 'templates':
                return <TemplateEditor templates={templates} isLoading={isLoading} />;
            default:
                return null;
        }
    };
    
    return (
        <div>
            <TabLayout tabs={SETTINGS_TABS} activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="mt-6">
                {renderContent()}
            </div>
        </div>
    );
};

export default MarketingSettingsTab;
