import { useState, useEffect, useMemo, useCallback } from 'react';
import { Product, ProductCategory, AnyProduct, AppData, ProductStatus, ProductVariant, InventoryBalance, Collection } from '../types';
import { dataService } from '../services/dataService';
import { toast } from './use-toast';

export type ViewMode = 'list' | 'kanban' | 'gallery';

export interface ProductAdvancedFilters {
    category: string;
    collection: string;
    status: ProductStatus[];
    minPrice: number | '';
    maxPrice: number | '';
}

export type ProductColumn = 'category' | 'collection_ids' | 'available_sizes' | 'variants' | 'status';

const getOptionsForSource = (source: string | undefined, appData: AppData): { value: string, label: string }[] => {
    if (!source || !appData) return [];
    
    const sourceMap: Record<string, any[] | undefined> = {
        'fabric_colors': appData.catalogs.cores_texturas.tecido,
        'zipper_colors': appData.catalogs.cores_texturas.ziper,
        'lining_colors': appData.catalogs.cores_texturas.forro,
        'puller_colors': appData.catalogs.cores_texturas.puxador,
        'bias_colors': appData.catalogs.cores_texturas.vies,
        'embroidery_colors': appData.catalogs.cores_texturas.bordado,
        'config_materials': appData.config_materials
    };

    const options = sourceMap[source];
    return options ? options.map(item => ({ value: item.id, label: item.name })) : [];
};


export function useProducts() {
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [allVariants, setAllVariants] = useState<ProductVariant[]>([]);
    const [inventoryBalances, setInventoryBalances] = useState<InventoryBalance[]>([]);
    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const [collections, setCollections] = useState<Collection[]>([]);
    const [settingsData, setSettingsData] = useState<AppData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    // UI State
    const [searchQuery, setSearchQuery] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
    
    // New Features State
    const [viewMode, setViewModeInternal] = useState<ViewMode>('list');
    const [advancedFilters, setAdvancedFilters] = useState<ProductAdvancedFilters>({
        category: '', collection: '', status: [], minPrice: '', maxPrice: ''
    });
    const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState<Set<ProductColumn>>(
      new Set(['category', 'available_sizes', 'variants', 'status'])
    );


    useEffect(() => {
        const savedViewMode = sessionStorage.getItem('productsViewMode') as ViewMode;
        if (savedViewMode) setViewModeInternal(savedViewMode);

        const savedColumns = sessionStorage.getItem('productsVisibleColumns');
        if (savedColumns) {
            try {
                setVisibleColumns(new Set(JSON.parse(savedColumns)));
            } catch (e) {
                console.error("Failed to parse visible columns from session storage", e);
            }
        }
    }, []);

    const setViewMode = (mode: ViewMode) => {
        sessionStorage.setItem('productsViewMode', mode);
        setViewModeInternal(mode);
    };

    const toggleColumnVisibility = (column: ProductColumn) => {
        const newColumns = new Set(visibleColumns);
        if (newColumns.has(column)) {
            newColumns.delete(column);
        } else {
            newColumns.add(column);
        }
        setVisibleColumns(newColumns);
        sessionStorage.setItem('productsVisibleColumns', JSON.stringify(Array.from(newColumns)));
    };


    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [settings, variantsData, balancesData] = await Promise.all([
                dataService.getSettings(),
                dataService.getCollection<ProductVariant>('product_variants'),
                dataService.getCollection<InventoryBalance>('inventory_balances', '*, material:config_materials(*)'),
            ]);
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
        const productsListener = dataService.listenToCollection('products', undefined, setAllProducts);
        const categoriesListener = dataService.listenToCollection('product_categories', undefined, setCategories);
        const collectionsListener = dataService.listenToCollection('collections', undefined, setCollections);
        
        return () => {
            productsListener.unsubscribe();
            categoriesListener.unsubscribe();
            collectionsListener.unsubscribe();
        };
    }, [loadData]);


    const filteredProducts = useMemo(() => {
        return allProducts.filter(p => {
            // Basic search
            const searchMatch = searchQuery.length === 0 ||
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.base_sku.toLowerCase().includes(searchQuery.toLowerCase());

            // Advanced filters
            const categoryMatch = !advancedFilters.category || p.category === advancedFilters.category;
            const collectionMatch = !advancedFilters.collection || (p.collection_ids || []).includes(advancedFilters.collection);
            const statusMatch = advancedFilters.status.length === 0 || advancedFilters.status.includes(p.status);
            const minPriceMatch = advancedFilters.minPrice === '' || p.base_price >= advancedFilters.minPrice;
            const maxPriceMatch = advancedFilters.maxPrice === '' || p.base_price <= advancedFilters.maxPrice;

            return searchMatch && categoryMatch && collectionMatch && statusMatch && minPriceMatch && maxPriceMatch;
        });
    }, [allProducts, searchQuery, advancedFilters]);
    
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
        setIsSaving(true);
        try {
            if ('id' in productData && productData.id) {
                await dataService.updateDocument('products', productData.id, productData);
                toast({ title: "Sucesso!", description: "Produto atualizado." });
            } else {
                await dataService.addDocument('products', { ...(productData as AnyProduct), status: 'Rascunho' });
                toast({ title: "Sucesso!", description: "Novo produto criado." });
            }
            // Real-time listener handles refresh
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

    const generateVariantsForProduct = useCallback(async (product: Product, appData: AppData) => {
        setIsSaving(true);
        try {
            if (!product.configurable_parts?.length && (!product.available_sizes || product.available_sizes.length === 0)) {
                toast({ title: "Atenção", description: "O produto não tem partes configuráveis ou tamanhos definidos.", variant: "destructive"});
                return;
            }

            const optionSets: Record<string, { value: string, label: string }[]> = {};
            
            if (product.configurable_parts) {
                for (const part of product.configurable_parts) {
                    const options = getOptionsForSource(part.options_source, appData);
                    if (options.length > 0) {
                        optionSets[part.key] = options;
                    }
                }
            }
            if (product.available_sizes && product.available_sizes.length > 0) {
                optionSets['size'] = product.available_sizes.map(s => ({ value: s.id, label: s.name }));
            }

            const keys = Object.keys(optionSets);
            let combinations: Record<string, { value: string; label: string; }>[] = [{}];

            for (const key of keys) {
                if (!optionSets[key] || optionSets[key].length === 0) continue;
                const newCombinations: Record<string, { value: string; label: string; }>[] = [];
                for (const combo of combinations) {
                    for (const option of optionSets[key]) {
                        newCombinations.push({ ...combo, [key]: option });
                    }
                }
                combinations = newCombinations;
            }

            const validCombinations = combinations.filter(combo => {
                if (!product.combination_rules || product.combination_rules.length === 0) return true;
                let isValid = true;
                for (const rule of product.combination_rules) {
                    const conditionMet = combo[rule.condition.part_key]?.value === rule.condition.option_id;
                    if (conditionMet) {
                        const consequencePartKey = rule.consequence.part_key;
                        const allowedIds = rule.consequence.allowed_option_ids;
                        const selectedOptionId = combo[consequencePartKey]?.value;
                        if (selectedOptionId && !allowedIds.includes(selectedOptionId)) {
                            isValid = false;
                            break;
                        }
                    }
                }
                return isValid;
            });
            
            if (validCombinations.length === 0) {
                 toast({ title: "Nenhuma Variante Válida", description: "Nenhuma combinação válida foi encontrada com as regras e opções atuais.", variant: "destructive"});
                 return;
            }

            const newVariants = validCombinations.map(combo => {
                const config: Record<string, string> = {};
                const nameParts: string[] = [];
                const skuParts: string[] = [];

                Object.entries(combo).forEach(([key, option]) => {
                    config[key] = option.label;
                    nameParts.push(option.label);
                    skuParts.push(option.label.substring(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, ''));
                });

                return {
                    product_base_id: product.id,
                    sku: `${product.base_sku}-${skuParts.join('-')}`,
                    name: `${product.name} - ${nameParts.join(' / ')}`,
                    configuration: config,
                    price_modifier: 0,
                    final_price: product.base_price,
                    bom: product.base_bom || [],
                };
            });
            
            await dataService.deleteVariantsForProduct(product.id);
            await dataService.addManyDocuments('product_variants', newVariants);

            toast({ title: "Sucesso!", description: `${newVariants.length} variantes geradas e salvas.` });
            // FIX: Replaced undefined 'refresh' with 'loadData' to correctly reload data after generating variants.
            loadData();

        } catch (error) {
            toast({ title: "Erro ao Gerar Variantes", description: (error as Error).message, variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    // FIX: Replaced undefined 'refresh' with 'loadData' in the dependency array.
    }, [loadData]);

    const clearFilters = () => {
        setAdvancedFilters({ category: '', collection: '', status: [], minPrice: '', maxPrice: '' });
        setSearchQuery('');
    };

    return {
        isLoading,
        isSaving,
        filteredProducts,
        allVariants,
        inventoryBalances,
        categories,
        collections,
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
        refresh: loadData,
        generateVariantsForProduct,
        // New features
        advancedFilters,
        setAdvancedFilters,
        isAdvancedFilterOpen,
        setIsAdvancedFilterOpen,
        clearFilters,
        visibleColumns,
        toggleColumnVisibility,
    };
}