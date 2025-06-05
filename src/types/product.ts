export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating?: {
    rate: number;
    count: number;
  };
}

export interface ProductFormData {
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
}

export type SortOrder = 'asc' | 'desc' | 'none';