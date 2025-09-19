import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject, takeUntil } from 'rxjs';
import { HistorialVentasModel } from 'src/app/models/historial-ventas-model';
import { TokenService } from 'src/app/services/token/token.service';
import { VentaService } from 'src/app/services/venta.service';

@Component({
  selector: 'app-historial-ventas',
  templateUrl: './historial-ventas.component.html',
  styleUrls: ['./historial-ventas.component.css']
})
export class HistorialVentasComponent implements OnInit, OnDestroy {

  tituloTemple: string = ''
  displayedColumns: string[] = ['clientName', 'clientEmail', 'clientPhone', 'fecha', 'totalPrice', 'detalle', 'sellerName'];
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  //pagination rest api

  page: number = 0;
  size: number = 5;
  totalItems: number = 5;
  totalPages: number;
  currentPage: number;
  pageSizeOptions = [10, 25, 50, 100];
  pageEvent: PageEvent;

  modalRef: BsModalRef;

  private destroy$: Subject<void> = new Subject<void>();

  filtroFechaInicio: FormControl = new FormControl('', [Validators.required]);
  filtroFechaFin: FormControl = new FormControl('', [Validators.required]);
  filtroEmpleado: FormControl = new FormControl('', [Validators.required]);

  public ventaModel: HistorialVentasModel = new HistorialVentasModel();

  constructor(public modalservice: BsModalService,
    private ventaService: VentaService,
    private router: Router,
    public tokenservice: TokenService,

  ) { }


  ngOnInit(): void {
    this.limpiarFormulario();
    this.verifyAdminRole();
    this.listar();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private verifyAdminRole(): void {
    if (!this.tokenservice.validarRol('admin')) {
      this.router.navigate(['/error']);
    }

  }

  /**
     * Lista los envases registrados
     * 
  */
  public listar(): void {
    this.ventaService.listarPagination(this.size, this.page, this.filtroFechaInicio.value, this.filtroFechaFin.value, this.filtroEmpleado.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: value => {
          this.dataSource = new MatTableDataSource(value.content);
          this.totalItems = value.totalElements;
          this.totalPages = value.totalPages;
          this.currentPage = value.number;
        }
      })
  }


  /**
   * Obtiene los cambios realizados por el usuario en la pagination en la tabla
   * @param e PageEvent
   */
  handlePageEvent(e: PageEvent) {
    this.pageEvent = e;
    this.totalItems = e.length;
    this.size = e.pageSize;
    this.page = e.pageIndex;
    this.listar();
  }

  /*
  * Centra el modal
  */
  configs = {
    class: 'modal-dialog-centered modal-lg'
  };


  openModal(template: TemplateRef<any>, ventaModel: HistorialVentasModel): void {
    this.modalRef = this.modalservice.show(template, this.configs);
    this.ventaModel = ventaModel;
    this.tituloTemple = 'Detalle de la venta';
  }

  limpiarFormulario() {
    const hoy = new Date();
    const hoyStr = hoy.toISOString().substring(0, 10);

    this.filtroFechaInicio.setValue(hoyStr);
    this.filtroFechaFin.setValue(hoyStr);
    this.filtroEmpleado.reset();     // Reset the employee input
  }

}