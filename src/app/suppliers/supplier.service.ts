import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { throwError } from "rxjs";

import { Supplier } from "./supplier";
import { tap, shareReplay, catchError } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class SupplierService {
  suppliersUrl = "api/suppliers";

  suppliers$ = this.http.get<Supplier[]>(this.suppliersUrl).pipe(
    // tap(suppliers => console.log("Suppliers", JSON.stringify(suppliers))),
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
