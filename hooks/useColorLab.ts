import { useState, useEffect, useCallback } from 'react';
import { Product, FabricColor, FabricTexture } from '../types';
import { dataService } from '../services/dataService';
import { toast } from './use-toast';

export function useColorLab() {
    const [products, setProducts] = useState<Product[]>([]);
    const [fabricColors, setFabricColors] = useState<FabricColor[]>([]);
    const [fabricTextures, setFabricTextures] = useState<FabricTexture[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [selectedProductId, setSelectedProductId] = useState<string>('');
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [selectedTexture, setSelectedTexture] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [productsData, settingsData] = await Promise.all([
                dataService.getProducts(),
                dataService.getSettings()
            ]);
            
            const customizableProducts = productsData.filter(p => p.hasVariants);
            setProducts(customizableProducts);
            setFabricColors(settingsData.catalogs.cores_texturas.tecido);
            setFabricTextures(settingsData.catalogs.cores_texturas.texturas);
            
            if (customizableProducts.length > 0 && !selectedProductId) {
                setSelectedProductId(customizableProducts[0].id);
            }
        } catch (error) {
            toast({ title: "Erro no ColorLab", description: "Não foi possível carregar os dados de personalização.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [selectedProductId]);

    useEffect(() => {
        loadData();
    }, [loadData]);
    
    const selectedProduct = products.find(p => p.id === selectedProductId);

    return {
        isLoading,
        products,
        fabricColors,
        fabricTextures,
        selectedProduct,
        selectedProductId,
        setSelectedProductId,
        selectedColor,
        setSelectedColor,
        selectedTexture,
        setSelectedTexture,
    };
}
