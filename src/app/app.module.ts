import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

//Imports
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MenuComponent } from './components/menu/menu.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { LayoutModule } from '@angular/cdk/layout';
import { MatDividerModule } from '@angular/material/divider';
import { HttpClientModule } from '@angular/common/http';
import { LoginComponent } from './components/login/login.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { INgxSelectOptions, NgxSelectModule } from 'ngx-select-ex';

//import { GeolocationService } from './services/geolocation.service';
import { MatSortModule } from '@angular/material/sort';
import { MatSelectModule } from '@angular/material/select';
import { ServiceWorkerModule } from '@angular/service-worker';
import { EmpleadosComponent } from './components/empleados/empleados.component';
import {
  FixedSizeVirtualScrollStrategy,
  ScrollingModule,
  VIRTUAL_SCROLL_STRATEGY,
} from '@angular/cdk/scrolling';
import { interceptorProvider } from './services/interceptor.service';
import { LogsComponent } from './components/logs/logs.component';
import { ErrorPermisoComponent } from './components/error-permiso/error-permiso.component';
import { DatePipe } from '@angular/common';
import { EnvasesComponent } from './components/envases/envases.component';
import { TipoEnvasesComponent } from './components/tipo-envases/tipo-envases.component';
import { QuimicosComponent } from './components/quimicos/quimicos.component';
import { TapasComponent } from './components/tapas/tapas.component';
import { CombosComponent } from './components/combos/combos.component';
import { VentasComponent } from './components/ventas/ventas.component';
import { SubirExcelComponent } from './components/subir-excel/subir-excel.component';
import { ExtractosComponent } from './components/extractos/extractos.component';



const CustomSelectOptions: INgxSelectOptions = { // Check the interface for more options
  optionValueField: 'id',
  optionTextField: 'nombre'
};

export class CustomVirtualScrollStrategy extends FixedSizeVirtualScrollStrategy {
  constructor() {
    super(50, 250, 500);
  }
}

@NgModule({
  declarations: [
    AppComponent,
    MenuComponent,
    LoginComponent,
    EmpleadosComponent,
    LogsComponent,
    ErrorPermisoComponent,
    EnvasesComponent,
    TipoEnvasesComponent,
    QuimicosComponent,
    TapasComponent,
    CombosComponent,
    VentasComponent,
    SubirExcelComponent,
    ExtractosComponent,
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatIconModule,
    MatSidenavModule,
    LayoutModule,
    MatDividerModule,
    ModalModule.forRoot(),
    MatCardModule,
    MatFormFieldModule,
    MatDialogModule,
    FormsModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatPaginatorModule,
    MatTableModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatProgressBarModule,
    MatSortModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    NgxSelectModule.forRoot(CustomSelectOptions),
    MatCheckboxModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
    ScrollingModule,
  ],
  providers: [
    DatePipe,
    interceptorProvider,
    {provide: VIRTUAL_SCROLL_STRATEGY, useClass: CustomVirtualScrollStrategy}],
  bootstrap: [AppComponent]
})
export class AppModule { }
