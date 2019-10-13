import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";

import {
  throwError,
  combineLatest,
  BehaviorSubject,
  Subject,
  merge
} from "rxjs";
import {
  catchError,
  tap,
  map,
  scan,
  shareReplay,
  mergeMap,
  concatMap
} from "rxjs/operators";

import { Product, StatusCode } from "./product";
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
    )
    // tap(products => console.log("selectedProduct", JSON.stringify(products)))
  );

  selectedProductChanged(selectedProductId: number): void {
    this.selectedProductSubject.next(selectedProductId);
  }

  private productInsertedSubject = new Subject<Product>();
  productInsertedAction$ = this.productInsertedSubject.asObservable();

  headers = new HttpHeaders({ "Content-Type": "application/json" });

  productsWithAdd$ = merge(
    this.productsWithCategory$,
    this.productInsertedAction$.pipe(
      concatMap(newProduct => {
        newProduct.id = null;
        return this.http
          .post<Product>(this.productsUrl, newProduct, {
            headers: this.headers
          })
          .pipe(
            // tap(product =>
            //   console.log("Created product", JSON.stringify(product))
            // ),
            catchError(this.handleError)
          );
      })
    )
  ).pipe(
    scan((acc: Product[], value: Product) => [...acc, value]),
    shareReplay(1)
  );

  addNewProduct(product?: Product): void {
    const newProduct = product || this.fakeProduct();
    newProduct.status = StatusCode.Added;
    this.productModifiedSubject.next(newProduct);
  }

  deleteProduct(selectedProduct: Product) {
    // Update a copy of the selected product
    const deletedProduct = { ...selectedProduct };
    deletedProduct.status = StatusCode.Deleted;
    this.productModifiedSubject.next(deletedProduct);
  }

  updateProduct(selectedProduct: Product) {
    // Update a copy of the selected product
    const updatedProduct = { ...selectedProduct };
    updatedProduct.quantityInStock += 1;
    updatedProduct.status = StatusCode.Updated;
    this.productModifiedSubject.next(updatedProduct);
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

  private productModifiedSubject = new Subject<Product>();
  productModifiedAction$ = this.productModifiedSubject.asObservable();

  productsWithCRUD$ = merge(
    this.productsWithCategory$,
    this.productModifiedAction$.pipe(
      concatMap(product => this.saveProduct(product))
    )
  ).pipe(
    scan((products: Product[], product: Product) =>
      this.modifyProducts(products, product)
    ),
    shareReplay(1)
  );

  saveProduct(product: Product) {
    if (product.status === StatusCode.Added) {
      product.id = null;
      return this.http
        .post<Product>(this.productsUrl, product, { headers: this.headers })
        .pipe(
          // tap(data => console.log("Created product", JSON.stringify(data))),
          catchError(this.handleError)
        );
    }
    if (product.status === StatusCode.Deleted) {
      const url = `${this.productsUrl}/${product.id}`;
      return this.http.delete<Product>(url, { headers: this.headers }).pipe(
        // tap(data => console.log("Deleted product", product)),
        // Return the original product so it can be removed from the array
        map(() => product),
        catchError(this.handleError)
      );
    }
    if (product.status === StatusCode.Updated) {
      const url = `${this.productsUrl}/${product.id}`;
      return this.http
        .put<Product>(url, product, { headers: this.headers })
        .pipe(
          // tap(data =>
          //   console.log("Updated Product: " + JSON.stringify(product))
          // ),
          // return the original product
          map(() => product),
          catchError(this.handleError)
        );
    }
  }

  modifyProducts(products: Product[], product: Product) {
    if (product.status === StatusCode.Added) {
      // Return a new array from the array of products + new product
      return [...products, { ...product, status: StatusCode.Unchanged }];
    }
    if (product.status === StatusCode.Deleted) {
      // Filter out the deleted product
      return products.filter(p => p.id !== product.id);
    }
    if (product.status === StatusCode.Updated) {
      // Return a new array with the updated product replaced
      return products.map(p =>
        p.id === product.id ? { ...product, status: StatusCode.Unchanged } : p
      );
    }
  }

  constructor(
    private http: HttpClient,
    private productCategories: ProductCategoryService,
    private supplierService: SupplierService
  ) {}

  private fakeProduct(): Product {
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
