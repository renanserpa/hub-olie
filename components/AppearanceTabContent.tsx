import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { MediaUploadCard } from './media/MediaUploadCard';
import { MediaGallery } from './media/MediaGallery';

const AppearanceTabContent: React.FC = () => {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Identidade Visual</CardTitle>
                    <p className="text-sm text-textSecondary">Gerencie o logo e outros elementos visuais da plataforma.</p>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6 items-start">
                    <MediaUploadCard module="system" category="logo" />
                    <MediaGallery module="system" category="logo" />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Banners Promocionais</CardTitle>
                     <p className="text-sm text-textSecondary">Imagens para campanhas de marketing e promoções.</p>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6 items-start">
                    <MediaUploadCard module="marketing" category="banner" />
                    <MediaGallery module="marketing" category="banner" />
                </CardContent>
            </Card>
        </div>
    );
};

export default AppearanceTabContent;
