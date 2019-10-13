import { Component, ChangeDetectionStrategy } from "@angular/core";

import { Observable, EMPTY, Subject, combineLatest } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { Product } from "../product";
import { ProductService } from "../product.service";

@Component({
  selector: "pm-product-list",
  templateUrl: "./product-list-alt.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListAltComponent {
  pageTitle = "Products";
  errorMessage = "";

  private errorMessageSubject = new Subject<string>();
  errorMessage$ = this.errorMessageSubject.asObservable();

  products$ = this.productService.productsWithCategory$.pipe(
    catchError(err => {
      this.errorMessageSubject.next(err);
      return EMPTY;
    })
  );

  selectedProduct$ = this.productService.selectedProduct$;

  vm$ = combineLatest([this.products$, this.selectedProduct$]).pipe(
    map(([products, product]: [Product[], Product]) => ({
      products,
      productId: product ? product.id : 0
    }))
  );

  constructor(private productService: ProductService) {}

  onSelected(productId: number): void {
    this.productService.selectedProductChanged(productId);
  }
}
