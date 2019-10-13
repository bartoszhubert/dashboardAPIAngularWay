import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import {
  throwError,
  combineLatest,
  BehaviorSubject,
  Subject,
  merge
} from "rxjs";
import { catchError, tap, map, scan, shareReplay } from "rxjs/operators";

import { Product } from "./product";
import { Supplier } from "../suppliers/supplier";
import { SupplierService } from "../suppliers/supplier.service";
import { ProductCategoryService } from "../product-categories/product-category.service";

@Injectable({
  providedIn: "root"
})
export class ProductService {
  private productsUrl = "api/products";
  private suppliersUrl = this.supplierService.suppliersUrl;

  products$ = this.http.get<Product[]>(this.productsUrl).pipe(
    // tap(data => console.log("Products: ", JSON.stringify(data))),
    catchError(this.handleError)
  );

  productsWithCategory$ = combineLatest([
    this.products$,
    this.productCategories.productCategories$
  ]).pipe(
    map(([products, categories]) =>
      products.map(product => ({
        ...product,
        price: product.price * 1.5,
        category: categories.find(
          category => product.categoryId === category.id
        ).name,
        searchKey: [product.productName]
      }))
    ),
    shareReplay(1)
  );

  private selectedProductSubject = new BehaviorSubject<number>(1);
  selectedProductAction$ = this.selectedProductSubject.asObservable();

  selectedProduct$ = combineLatest([
    this.productsWithCategory$,
    this.selectedProductAction$
  ]).pipe(
    map(([products, selectedCategoryId]) =>
      products.find(product => product.id === selectedCategoryId)
    ),
    // tap(products => console.log("selectedProduct", JSON.stringify(products)))
  );

  selectedProductChanged(selectedProductId: number): void {
    this.selectedProductSubject.next(selectedProductId);
  }

  private productInsertedSubject = new Subject<Product>();
  productInsertedAction$ = this.productInsertedSubject.asObservable();

  productsWithAdd$ = merge(
    this.productsWithCategory$,
    this.productInsertedAction$
  ).pipe(scan((acc: Product[], value: Product) => [...acc, value]));

  addNewProduct(product?: Product): void {
    const newProduct = product || this.fakeProduct();
    this.productInsertedSubject.next(newProduct);
  }

  selectedProductSuppliers$ = combineLatest([
    this.selectedProduct$,
    this.supplierService.suppliers$
  ]).pipe(
    map(([selectedProduct, suppliers]) =>
      suppliers.filter(supplier =>
        selectedProduct.supplierIds.includes(supplier.id)
      )
    )
  );

  constructor(
    private http: HttpClient,
    private productCategories: ProductCategoryService,
    private supplierService: SupplierService
  ) {}

  private fakeProduct() {
    return {
      id: 42,
      productName: "Another One",
      productCode: "TBX-0042",
      description: "Our new product",
      price: 8.9,
      categoryId: 3,
      category: "Toolbox",
      quantityInStock: 30
    };
  }

  private handleError(err: any) {
    let errorMessage: string;
    if (err.error instanceof ErrorEvent) {
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      errorMessage = `Backend returned code ${err.status}: ${err.body.error}`;
    }
    console.error(err);
    return throwError(errorMessage);
  }
}
