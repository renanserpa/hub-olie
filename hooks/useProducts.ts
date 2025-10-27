


import { useState, useEffect, useMemo, useCallback } from 'react';
import { Product, ProductCategory, AnyProduct } from '../types';
import { firebaseService } from '../services/firestoreService';
import { toast } from './use-toast';

export function useProducts(onDataChange: () => void) {
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const loadProducts = useCallback(async () => {
        setIsLoading(true);
        try {
            const [productsData, categoriesData] = await Promise.all([
                firebaseService.getProducts(),
                firebaseService.getProductCategories()
            ]);
            setAllProducts(productsData);
            setCategories(categoriesData);
        } catch (error) {
            toast({ title: "Erro!", description: "Não foi possível carregar os produtos.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadProducts();
    }, [loadProducts, onDataChange]);

    const filteredProducts = useMemo(() => {
        let products = allProducts;

        if (searchQuery) {
            const lowercasedQuery = searchQuery.toLowerCase();
            products = products.filter(p =>
                p.name.toLowerCase().includes(lowercasedQuery) ||
                p.sku.toLowerCase().includes(lowercasedQuery)
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
        try {
            if ('id' in productData) {
                await firebaseService.updateProduct(productData.id, productData);
                toast({ title: "Sucesso!", description: "Produto atualizado." });
            } else {
                await firebaseService.addProduct(productData as AnyProduct);
                toast({ title: "Sucesso!", description: "Novo produto criado." });
            }
            onDataChange();
            closeDialog();
        } catch (error) {
            toast({ title: "Erro!", description: "Não foi possível salvar o produto.", variant: "destructive" });
            throw error;
        }
    };

    return {
        isLoading,
        filteredProducts,
        categories,
        searchQuery,
        setSearchQuery,
        isDialogOpen,
        editingProduct,
        openDialog,
        closeDialog,
        saveProduct,
    };
}