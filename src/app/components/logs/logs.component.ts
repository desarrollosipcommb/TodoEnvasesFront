import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { LogModel } from 'src/app/models/log-model';
import { LogService } from 'src/app/services/log.service';
import { TokenService } from 'src/app/services/token/token.service';

function obtenerFechaActual(): string {
  return new Date().toISOString().split('T')[0];
}

@Component({
  selector: 'app-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.css']
})
export class LogsComponent implements OnInit, OnDestroy {
  MODULO: string = 'LOGS';
  titulo: string = 'Lista de registros'

  listaHoraLaboral: LogModel[] = [];


  //Columnas de la tabla
  displayedColumns: string[] = ['usuario', 'fecha', 'operacion', 'observacion'];
  //paginator
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  private destroy$: Subject<void> = new Subject<void>();

  //filtros
  maxDate: string
  filtroFechaInicio: FormControl = new FormControl(obtenerFechaActual(), [Validators.required])
  filtroFechaFin: FormControl = new FormControl(obtenerFechaActual(), [Validators.required])
  filtrobusqueda: FormControl = new FormControl(null)


  //pagination rest api
  page: number = 0;
  size: number = 5;
  buscarLogs: string;
  totalItems: number = 100;
  totalPages: number;
  currentPage: number;
  pageSizeOptions = [5, 20, 100];
  hidePageSize = false;
  showPageSizeOptions = true;
  showFirstLastButtons = true;
  disabled = false;
  pageEvent: PageEvent;

  constructor(
    private router: Router,
    public tokenservice: TokenService,
    private logService: LogService,
  ) {
    this.maxDate = obtenerFechaActual()
  }

  ngOnInit(): void {
    if (!this.tokenservice.validarRol('Administrador')) {
      this.router.navigate(['/error']);
    }
    this.listar();
  }



  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onFechaSeleccionada(): void {
    this.listar()
  }

  /**
   * Busca dinamicamente los Logs
   * @param event obtiene dinamicamente el valor ingresado
   */
  applyFilter(event: Event) {
    this.buscarLogs = (event.target as HTMLInputElement).value;
    if (this.buscarLogs != null) {
      this.listar();
    }
  }

  /**
   * Lista en el mat-table los log que recibe del servicio listarPagination
   */
  public listar(): void {
    this.logService.listarPagination(this.page, this.size, this.filtroFechaInicio.value,
      this.filtroFechaFin.value, this.filtrobusqueda.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: value => {
          this.dataSource = new MatTableDataSource(value.data);
          this.totalItems = value.totalItems;
          this.totalPages = value.totalPages;
          this.currentPage = value.currentPage;
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

  setPageSizeOptions(setPageSizeOptionsInput: string) {
    if (setPageSizeOptionsInput) {
      this.pageSizeOptions = setPageSizeOptionsInput.split(',').map(str => +str);
    }
  }


  public limpiarFormulario(): void {
    this.filtroFechaInicio.setValue(obtenerFechaActual());
    this.filtroFechaFin.setValue(obtenerFechaActual());
    this.filtrobusqueda.setValue(null);
    this.listar();
  }
}
