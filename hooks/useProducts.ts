

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Product, ProductCategory, AnyProduct, AppData } from '../../types';
import { supabaseService } from '../services/firestoreService';
import { toast } from './use-toast';

export function useProducts() {
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const [settingsData, setSettingsData] = useState<AppData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [productsData, categoriesData, settings] = await Promise.all([
                supabaseService.getProducts(),
                supabaseService.getProductCategories(),
                supabaseService.getSettings(), // For catalogs needed in ProductDialog
            ]);
            setAllProducts(productsData);
            setCategories(categoriesData);
            setSettingsData(settings);
        } catch (error) {
             toast({ title: "Erro!", description: "Não foi possível carregar os produtos.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);


    const filteredProducts = useMemo(() => {
        let products = allProducts;

        if (searchQuery) {
            const lowercasedQuery = searchQuery.toLowerCase();
            products = products.filter(p =>
                p.name.toLowerCase().includes(lowercasedQuery) ||
                // FIX: Property 'sku' does not exist on type 'Product'. Use 'base_sku'.
                p.base_sku.toLowerCase().includes(lowercasedQuery)
            );
        }
        
        return products;
    }, [allProducts, searchQuery]);
    
    const openDialog = (product: Product | null = null) => {
        setEditingProduct(product);
        setIsDialogOpen(true);
    };

    const closeDialog = () => {
        setEditingProduct(null);
        setIsDialogOpen(false);
    };
    
    const saveProduct = async (productData: AnyProduct | Product) => {
        setIsSaving(true);
        try {
            if ('id' in productData && productData.id) {
                await supabaseService.updateProduct(productData.id, productData);
                toast({ title: "Sucesso!", description: "Produto atualizado." });
            } else {
                await supabaseService.addProduct(productData as AnyProduct);
                toast({ title: "Sucesso!", description: "Novo produto criado." });
            }
            loadData(); // Reload data
            closeDialog();
        } catch (error) {
            toast({ title: "Erro!", description: "Não foi possível salvar o produto.", variant: "destructive" });
            throw error;
        } finally {
            setIsSaving(false);
        }
    };

    return {
        isLoading,
        isSaving,
        filteredProducts,
        categories,
        settingsData,
        searchQuery,
        setSearchQuery,
        isDialogOpen,
        editingProduct,
        openDialog,
        closeDialog,
        saveProduct,
    };
}