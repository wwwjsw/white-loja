import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Product, ProductFormData } from '@/types/product';
import { useCategories, useCreateProduct, useUpdateProduct } from '@/hooks/useProducts';

interface ProductFormProps {
  product?: Product;
  onClose: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({ product, onClose }) => {
  const { data: categories = [] } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<ProductFormData>({
    defaultValues: {
      title: '',
      price: 0,
      description: '',
      category: '',
      image: '',
    },
  });

  const selectedCategory = watch('category');

  useEffect(() => {
    if (product) {
      reset({
        title: product.title,
        price: product.price,
        description: product.description,
        category: product.category,
        image: product.image,
      });
    }
  }, [product, reset]);

  const onSubmit = async (data: ProductFormData) => {
    try {
      if (product) {
        await updateProduct.mutateAsync({ id: product.id, product: data });
      } else {
        await createProduct.mutateAsync(data);
      }
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const isLoading = createProduct.isPending || updateProduct.isPending;

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{product ? 'Editar Produto' : 'Criar Produto'}</DialogTitle>
        <DialogDescription>
          {product ? 'Edite as informações do produto.' : 'Adicione um novo produto ao catálogo.'}
        </DialogDescription>
      </DialogHeader>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            {...register('title', { required: 'Título é obrigatório' })}
            placeholder="Nome do produto"
          />
          {errors.title && (
            <p className="text-sm text-destructive">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Preço</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            {...register('price', { 
              required: 'Preço é obrigatório',
              min: { value: 0, message: 'Preço deve ser maior que 0' }
            })}
            placeholder="0.00"
          />
          {errors.price && (
            <p className="text-sm text-destructive">{errors.price.message}</p>
          )}
        </div>
        {/* TODO: implementar multicategoria */}
        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <Select
            value={selectedCategory}
            onValueChange={(value) => setValue('category', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-sm text-destructive">{errors.category.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <textarea
            id="description"
            {...register('description', { required: 'Descrição é obrigatória' })}
            placeholder="Descrição do produto"
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          {errors.description && (
            <p className="text-sm text-destructive">{errors.description.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="image">URL da Imagem</Label>
          <Input
            id="image"
            {...register('image', { required: 'URL da imagem é obrigatória' })}
            placeholder="https://exemplo.com/imagem.jpg"
          />
          {errors.image && (
            <p className="text-sm text-destructive">{errors.image.message}</p>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Salvando...' : product ? 'Atualizar' : 'Criar'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};