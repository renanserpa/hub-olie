
import React, { useState, useEffect } from 'react';
import { Product, ProductStatus } from '../../types';
import { productService } from '../../services/productService';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../ui/Button';
import { Loader2 } from 'lucide-react';
import { toast } from '../../hooks/use-toast';

interface ProductFormProps {
  productToEdit?: Product | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ productToEdit, onSuccess, onCancel }) => {
  const { user } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    status: ProductStatus;
    base_price: number | string;
    base_sku: string;
  }>({
    name: '',
    description: '',
    status: 'Rascunho',
    base_price: '',
    base_sku: '',
  });

  useEffect(() => {
    if (productToEdit) {
      // Nota: Em modo de edição, base_price e base_sku podem vir de variantes existentes.
      // Por simplicidade de MVP, carregamos do objeto produto se disponível, ou deixamos em branco para não sobrescrever incorretamente.
      setFormData({
        name: productToEdit.name,
        description: productToEdit.description || '',
        status: productToEdit.status,
        base_price: 0, // Em edição real, buscaríamos isso das variantes
        base_sku: '',  // Em edição real, buscaríamos isso das variantes
      });
    }
  }, [productToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validação básica
    if (!productToEdit && (!formData.base_sku || !formData.base_price)) {
       toast({ title: 'Erro', description: 'SKU e Preço são obrigatórios para novos produtos.', variant: 'destructive' });
       return;
    }

    setIsSubmitting(true);
    try {
      if (productToEdit) {
        await productService.updateProduct(productToEdit.id, formData as any);
        toast({ title: 'Sucesso', description: 'Produto atualizado com sucesso.' });
      } else {
        // O serviço agora lida com a criação do Produto E da Variação Padrão
        await productService.createProduct(formData, user.id);
        toast({ title: 'Sucesso', description: 'Produto e variação padrão criados.' });
      }
      onSuccess();
    } catch (error: any) {
      console.error(error);
      toast({ title: 'Erro', description: error.message || 'Falha ao salvar produto.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = "w-full px-3 py-2 border border-border rounded-md bg-background text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary/50";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-1">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-textSecondary mb-1">Nome do Produto</label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          required
          className={inputStyle}
        />
      </div>

      {/* Exibe campos de SKU e Preço apenas na criação para garantir a variação padrão */}
      {!productToEdit && (
        <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="base_sku" className="block text-sm font-medium text-textSecondary mb-1">SKU Base</label>
              <input
                id="base_sku"
                name="base_sku"
                type="text"
                value={formData.base_sku}
                onChange={handleChange}
                required
                className={inputStyle}
                placeholder="EX: CAM-001"
              />
            </div>
            <div>
              <label htmlFor="base_price" className="block text-sm font-medium text-textSecondary mb-1">Preço Base (R$)</label>
              <input
                id="base_price"
                name="base_price"
                type="number"
                step="0.01"
                value={formData.base_price}
                onChange={handleChange}
                required
                className={inputStyle}
                placeholder="0.00"
              />
            </div>
        </div>
      )}

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-textSecondary mb-1">Descrição</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className={inputStyle}
        />
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-textSecondary mb-1">Status</label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          className={inputStyle}
        >
          <option value="Rascunho">Rascunho</option>
          <option value="Homologado Qualidade">Homologado Qualidade</option>
          <option value="Ativo">Ativo</option>
          <option value="Suspenso">Suspenso</option>
          <option value="Descontinuado">Descontinuado</option>
        </select>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
