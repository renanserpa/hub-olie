import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';
import { Product, ProductCategory, AnyProduct, AppData, ProductPart, ProductSize, BOMComponent, CombinationRule } from '../../types';
import { Loader2, Package, Ruler, Settings, Share2, List, Plus, Trash2 } from 'lucide-react';
import TabLayout from '../ui/TabLayout';
import { IconButton } from '../ui/IconButton';

interface ProductDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: AnyProduct | Product) => Promise<void>;
    product: Product | null;
    categories: ProductCategory[];
    appData: AppData;
}

const SectionCard: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
    <div className="p-4 border rounded-lg bg-secondary/50 dark:bg-dark-secondary/50">
        <h4 className="font-semibold text-textPrimary dark:text-dark-textPrimary mb-3 flex items-center gap-2">
            <Icon size={16} />
            {title}
        </h4>
        <div className="space-y-3">{children}</div>
    </div>
);


const getOptionsForSource = (source: ProductPart['options_source'] | undefined, appData: AppData) => {
    if (!source || !appData) return [];
    const mapping = {
        fabric_colors: appData.catalogs.cores_texturas.tecido,
        zipper_colors: appData.catalogs.cores_texturas.ziper,
        lining_colors: appData.catalogs.cores_texturas.forro,
        puller_colors: appData.catalogs.cores_texturas.puxador,
        bias_colors: appData.catalogs.cores_texturas.vies,
        embroidery_colors: appData.catalogs.cores_texturas.bordado,
        config_materials: appData.config_materials
    };
    