import React, { useState, useMemo } from 'react';
import { ArrowUpDown, ChevronsUpDown, Plus } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { Button } from '@/components/ui/button';
import { SortableTableRow } from '@/components/SortableTableRow';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { Product, SortOrder } from '@/types/product';
import { useProducts, useCategories, useDeleteProduct } from '@/hooks/useProducts';
import { useQueryClient } from '@tanstack/react-query';
import { ProductForm } from './ProductForm';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';

export const ProductTable: React.FC = () => {
  const { data: products = [], isLoading, error } = useProducts();
  const { data: categories = [] } = useCategories();
  const deleteProduct = useDeleteProduct();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const [sortOrder, setSortOrder] = useState<SortOrder>('none');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [openCategorySelection, setOpenCategorySelection] = useState(false);


  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  const toggleSelectedCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };
  
  const clearAllSelectedCategories = () => {
    setSelectedCategories([]);
  };

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);
      return matchesSearch && matchesCategory;
    });

    if (sortOrder !== 'none') {
      filtered = [...filtered].sort((a, b) => {
        if (sortOrder === 'asc') {
          return a.price - b.price;
        } else {
          return b.price - a.price;
        }
      });
    }

    return filtered;
  }, [products, searchTerm, selectedCategories, sortOrder]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
  
    if (over && active.id !== over.id) {
      // TODO: Implementar a lógica de ordenação por DND
      // const oldIndex = filteredAndSortedProducts.findIndex((item) => item.id === active.id);
      // const newIndex = filteredAndSortedProducts.findIndex((item) => item.id === over.id);

  
      // queryClient.setQueryData(['products'], updatedProducts);
    }
  };

  const handleSort = () => {
    if (sortOrder === 'none') {
      setSortOrder('asc');
    } else if (sortOrder === 'asc') {
      setSortOrder('desc');
    } else {
      setSortOrder('none');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteProduct.mutateAsync(id);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const getSortIcon = () => {
    if (sortOrder === 'asc') return '↑';
    if (sortOrder === 'desc') return '↓';
    return '';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando produtos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-destructive">Erro ao carregar produtos</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Produtos</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Criar Produto
            </Button>
          </DialogTrigger>
          <ProductForm onClose={() => setIsCreateDialogOpen(false)} />
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <Popover open={openCategorySelection} onOpenChange={setOpenCategorySelection}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openCategorySelection}
              className="w-[300px] justify-between"
            >
              {selectedCategories.length === 0
                ? "Selecionar categorias..."
                : `${selectedCategories.length} categoria${selectedCategories.length > 1 ? 's' : ''} selecionada${selectedCategories.length > 1 ? 's' : ''}`
              }
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Categorias</span>
                {selectedCategories.length > 0 && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={clearAllSelectedCategories}
                    className="h-auto p-0 text-xs"
                  >
                    Limpar tudo
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={category}
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={() => toggleSelectedCategory(category)}
                    />
                    <label
                      htmlFor={category}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {category}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Table DND */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Imagem</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={handleSort}
                    className="h-auto p-0 font-medium"
                  >
                    Preço {getSortIcon()}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Nenhum produto encontrado
                  </TableCell>
                </TableRow>
              ) : (
                <SortableContext
                  items={filteredAndSortedProducts.map(p => p.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {filteredAndSortedProducts.map((product) => (
                    <SortableTableRow
                      key={product.id}
                      product={product}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </SortableContext>
              )}
            </TableBody>
          </Table>
        </div>
      </DndContext>


      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        {editingProduct && (
          <ProductForm
            product={editingProduct}
            onClose={() => {
              setIsEditDialogOpen(false);
              setEditingProduct(null);
            }}
          />
        )}
      </Dialog>
    </div>
  );
};
