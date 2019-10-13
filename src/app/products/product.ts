export interface Product {
  id: number;
  productName: string;
  productCode?: string;
  description?: string;
  price?: number;
  categoryId?: number;
  category?: string;
  quantityInStock?: number;
  searchKey?: string[];
  supplierIds?: number[];
  status?: StatusCode;
}

export enum StatusCode {
  Unchanged,
  Added,
  Deleted,
  Updated
}
