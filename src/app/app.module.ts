import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { HttpClientModule } from "@angular/common/http";

import { InMemoryWebApiModule } from "angular-in-memory-web-api";
import { AppData } from "./app-data";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { PageNotFoundComponent } from "./page-not-found.component";

@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
    InMemoryWebApiModule.forRoot(AppData, { delay: 500 }),
    AppRoutingModule
  ],
  declarations: [AppComponent, PageNotFoundComponent],
  bootstrap: [AppComponent]
})
export class AppModule {}
