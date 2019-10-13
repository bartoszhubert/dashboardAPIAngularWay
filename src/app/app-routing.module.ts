import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";

import { PageNotFoundComponent } from "./page-not-found.component";

@NgModule({
  imports: [
    RouterModule.forRoot([
      {
        path: "products",
        loadChildren: () =>
          import("./products/product.module").then(m => m.ProductModule)
      },
      { path: "", redirectTo: "products", pathMatch: "full" },
      { path: "**", component: PageNotFoundComponent }
    ])
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
