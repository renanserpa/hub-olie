import { useState, useEffect, useMemo, useCallback } from 'react';
import { Product, ProductCategory, AnyProduct, AppData, ProductStatus, ProductVariant, InventoryBalance } from '../types';
import { dataService } from '../services/dataService';
import { toast } from './use-toast';

export type ViewMode = 'list' | 'kanban';

export function useProducts() {
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [allVariants, setAllVariants] = useState<ProductVariant[]>([]);
    const [inventoryBalances, setInventoryBalances] = useState<InventoryBalance[]>([]);
    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const [settingsData, setSettingsData] = useState<AppData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
    
    const [viewMode, setViewModeInternal] = useState<ViewMode>('list');

    useEffect(() => {
        const savedViewMode = sessionStorage.getItem('productsViewMode') as ViewMode;
        if (savedViewMode) {
            setViewModeInternal(savedViewMode);
        }
    }, []);

    const setViewMode = (mode: ViewMode) => {
        sessionStorage.setItem('productsViewMode', mode);
        setViewModeInternal(mode);
    };

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [productsData, categoriesData, settings, variantsData, balancesData] = await Promise.all([
                dataService.getProducts(),
                dataService.getProductCategories(),
                dataService.getSettings(),
                dataService.getCollection<ProductVariant>('product_variants'),
                dataService.getCollection<InventoryBalance>('inventory_balances', '*, material:config_materials(*)'),
            ]);
            setAllProducts(productsData);
            setCategories(categoriesData);
            setSettingsData(settings);
            setAllVariants(variantsData);
            setInventoryBalances(balancesData);
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
                await dataService.updateDocument('products', productData.id, productData);
                toast({ title: "Sucesso!", description: "Produto atualizado." });
            } else {
                await dataService.addDocument('products', { ...(productData as AnyProduct), status: 'Rascunho' });
                toast({ title: "Sucesso!", description: "Novo produto criado." });
            }
            loadData();
            closeDialog();
        } catch (error) {
            toast({ title: "Erro!", description: "Não foi possível salvar o produto.", variant: "destructive" });
            throw error;
        } finally {
            setIsSaving(false);
        }
    };
    
    const updateProductStatus = useCallback(async (productId: string, newStatus: ProductStatus) => {
        // Optimistic update
        setAllProducts(prev => prev.map(p => p.id === productId ? { ...p, status: newStatus } : p));
        try {
            await dataService.updateDocument<Product>('products', productId, { status: newStatus });
            toast({ title: "Status Atualizado!", description: `O produto foi movido para "${newStatus}".`});
        } catch (error) {
            toast({ title: "Erro!", description: "Não foi possível atualizar o status do produto.", variant: "destructive" });
            loadData(); // Revert on failure
        }
    }, [loadData]);

    return {
        isLoading,
        isSaving,
        filteredProducts,
        allVariants,
        inventoryBalances,
        categories,
        settingsData,
        searchQuery,
        setSearchQuery,
        isDialogOpen,
        editingProduct,
        openDialog,
        closeDialog,
        saveProduct,
        viewMode,
        setViewMode,
        updateProductStatus,
        selectedProductId,
        setSelectedProductId,
        // FIX: Expose the loadData function as 'refresh' so it can be used by components.
        refresh: loadData,
    };
}