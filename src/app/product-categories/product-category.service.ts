import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { throwError, Observable } from "rxjs";

import { ProductCategory } from "./product-category";
import { catchError, tap, shareReplay } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class ProductCategoryService {
  private productCategoriesUrl = "api/productCategories";

  productCategories$ = this.http
    .get<ProductCategory[]>(this.productCategoriesUrl)
    .pipe(
      // tap(data => console.log("Categories: ", JSON.stringify(data))),
      shareReplay(1),
      catchError(this.handleError)
    );

  constructor(private http: HttpClient) {}

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
