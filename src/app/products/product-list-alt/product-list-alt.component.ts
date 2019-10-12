import { Component, OnInit } from "@angular/core";

import { Observable } from "rxjs";

import { Product } from "../product";
import { ProductService } from "../product.service";

@Component({
  selector: "pm-product-list",
  templateUrl: "./product-list-alt.component.html"
})
export class ProductListAltComponent implements OnInit {
  pageTitle = "Products";
  errorMessage = "";
  selectedProductId;

  products$: Observable<Product[]>;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.products$ = this.productService.products$;
  }

  onSelected(productId: number): void {
    console.log("Not yet implemented");
  }
}
