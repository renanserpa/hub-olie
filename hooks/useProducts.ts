
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Product, ProductVariant, ProductCategory, Collection, AppData, InventoryBalance, ProductStatus, AnyProduct } from '../types';
import { dataService } from '../services/dataService';
import { toast } from './use-toast';
import { useOlie } from '../contexts/OlieContext';

export type ViewMode = 'kanban' | 'list' | 'gallery';
export type ProductColumn = 'category' | 'collection_ids' | 'available_sizes' | 'variants' | 'status';

export interface ProductAdvancedFilters {
    category: string;
    collection: string;
    status: ProductStatus[];
    minPrice: number | '';
    maxPrice: number | '';
}

export function useProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [allVariants, setAllVariants] = useState<ProductVariant[]>([]);
    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const [collections, setCollections] = useState<Collection[]>([]);
    const [inventoryBalances, setInventoryBalances] = useState<InventoryBalance[]>([]);
    const [settingsData, setSettingsData] = useState<AppData | null>(null);
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { can } = useOlie();
    
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [advancedFilters, setAdvancedFilters] = useState<ProductAdvancedFilters>({
        category: '',
        collection: '',
        status: [],
        minPrice: '',
        maxPrice: '',
    });
    const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
    
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    
    const [visibleColumns, setVisibleColumns] = useState<Set<ProductColumn>>(new Set(['category', 'collection_ids', 'status', 'variants']));

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [productsData, variantsData, categoriesData, collectionsData, balancesData, settings] = await Promise.all([
                dataService.getProducts(),
                dataService.getCollection<ProductVariant>('product_variants'),
                dataService.getCollection<ProductCategory>('product_categories'),
                dataService.getCollection<Collection>('collections'),
                dataService.getCollection<InventoryBalance>('inventory_balances'),
                dataService.getSettings(),
            ]);
            
            setProducts(productsData);
            setAllVariants(variantsData);
            setCategories(categoriesData);
            setCollections(collectionsData);
            setInventoryBalances(balancesData);
            setSettingsData(settings);
        } catch (error) {
            toast({ title: "Erro!", description: "Não foi possível carregar os produtos.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
        
        const productsListener = dataService.listenToCollection<Product>('products', undefined, setProducts);
        const variantsListener = dataService.listenToCollection<ProductVariant>('product_variants', undefined, setAllVariants);

        return () => {
            productsListener.unsubscribe();
            variantsListener.unsubscribe();
        }
    }, [loadData]);

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const searchMatch = searchQuery === '' || 
                product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                product.base_sku?.toLowerCase().includes(searchQuery.toLowerCase());
            
            const categoryMatch = advancedFilters.category === '' || product.category === advancedFilters.category;
            const collectionMatch = advancedFilters.collection === '' || (product.collection_ids && product.collection_ids.includes(advancedFilters.collection));
            const statusMatch = advancedFilters.status.length === 0 || advancedFilters.status.includes(product.status);
            const minPriceMatch = advancedFilters.minPrice === '' || (product.base_price || 0) >= advancedFilters.minPrice;
            const maxPriceMatch = advancedFilters.maxPrice === '' || (product.base_price || 0) <= advancedFilters.maxPrice;
            
            return searchMatch && categoryMatch && collectionMatch && statusMatch && minPriceMatch && maxPriceMatch;
        }).map(p => ({
            ...p,
            collections: p.collection_ids?.map(id => collections.find(c => c.id === id)).filter(Boolean) as Collection[]
        }));
    }, [products, searchQuery, advancedFilters, collections]);

    const openDialog = (product: Product | null = null) => {
        setEditingProduct(product);
        setIsDialogOpen(true);
    };

    const closeDialog = () => {
        setEditingProduct(null);
        setIsDialogOpen(false);
        setSelectedProductId(null);
    };
    
    const saveProduct = async (productData: AnyProduct | Product) => {
        if (!can('Products', 'write')) {
            toast({ title: 'Acesso Negado', description: 'Você não tem permissão para editar produtos.', variant: 'destructive' });
            return;
        }
        
        setIsSaving(true);
        try {
            if ('id' in productData && productData.id) {
                await dataService.updateDocument('products', productData.id, productData);
                toast({ title: "Sucesso!", description: "Produto atualizado." });
            } else {
                await dataService.addDocument('products', productData as AnyProduct);
                toast({ title: "Sucesso!", description: "Produto criado." });
            }
            closeDialog();
        } catch (error) {
            toast({ title: "Erro!", description: "Não foi possível salvar o produto.", variant: "destructive" });
            throw error;
        } finally {
            setIsSaving(false);
        }
    };

    const updateProductStatus = async (productId: string, newStatus: ProductStatus) => {
        if (!can('Products', 'update')) return;
        try {
            await dataService.updateDocument<Product>('products', productId, { status: newStatus });
            toast({ title: "Status Atualizado", description: `Produto movido para ${newStatus}` });
        } catch (error) {
             toast({ title: "Erro", description: "Falha ao atualizar status.", variant: "destructive" });
        }
    };
    
    const generateVariantsForProduct = async (product: Product, appData: AppData) => {
        if (!can('Products', 'write')) return;
        setIsSaving(true);
        try {
             // 1. Delete existing variants
            await dataService.deleteVariantsForProduct(product.id);

            // 2. Generate combinations logic placeholder
            // In a real implementation, this would perform the Cartesian product of sizes and configurable parts
            // filtering by combination rules.
            // For now, we'll just create a single variant per size as a PoC or one default variant if no sizes.
            
            const variantsToCreate: any[] = [];
            const sizes = product.available_sizes?.length ? product.available_sizes : [{ id: 'default', name: 'Único' }];

            sizes.forEach(size => {
                 variantsToCreate.push({
                    product_base_id: product.id,
                    sku: `${product.base_sku}-${size.name.toUpperCase()}-${Date.now().toString().slice(-4)}`,
                    name: `${product.name} - ${size.name}`,
                    sales_price: product.base_price,
                    final_price: product.base_price,
                    unit_of_measure: 'un',
                    configuration: { size: size.id },
                    stock_quantity: 0,
                 });
            });

            await dataService.addManyDocuments('product_variants', variantsToCreate);
            
            toast({ title: "Sucesso!", description: `${variantsToCreate.length} variantes geradas.` });
            // Realtime update will handle state refresh
        } catch (error) {
            toast({ title: "Erro", description: "Falha ao gerar variantes.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    const clearFilters = () => {
        setAdvancedFilters({ category: '', collection: '', status: [], minPrice: '', maxPrice: '' });
        setSearchQuery('');
    };
    
    const toggleColumnVisibility = (column: ProductColumn) => {
        setVisibleColumns(prev => {
            const next = new Set(prev);
            if (next.has(column)) next.delete(column);
            else next.add(column);
            return next;
        });
    };

    return {
        // Data
        products,
        filteredProducts,
        allVariants,
        inventoryBalances,
        categories,
        collections,
        settingsData,
        
        // Loading States
        isLoading,
        isSaving,
        
        // Search & Filters
        searchQuery,
        setSearchQuery,
        advancedFilters,
        setAdvancedFilters,
        isAdvancedFilterOpen,
        setIsAdvancedFilterOpen,
        clearFilters,
        
        // UI State
        viewMode,
        setViewMode,
        visibleColumns,
        toggleColumnVisibility,
        
        // Dialogs & Selection
        isDialogOpen,
        editingProduct,
        selectedProductId,
        setSelectedProductId,
        openDialog,
        closeDialog,
        
        // Actions
        saveProduct,
        updateProductStatus,
        generateVariantsForProduct,
        refresh: loadData,
        
        // Legacy compatibility (if needed by other components, though ideally updated)
        loading: isLoading,
        error: null,
        refetchProducts: loadData
    };
}
