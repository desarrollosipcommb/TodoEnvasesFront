import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Data, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { finalize, Subject, takeUntil } from 'rxjs';
import { AlertaService } from 'src/app/services/alerta.service';
import { AreaService } from 'src/app/services/area.service';
import { ReporteService } from 'src/app/services/reporte.service';
import { TokenService } from 'src/app/services/token/token.service';

@Component({
  selector: 'app-reporte',
  templateUrl: './reporte.component.html',
  styleUrls: ['./reporte.component.css']
})
export class ReporteComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['empleado', 'fechaHoraInicio', 'imagenInicio', 'ubicacionInicio', 'fechaHoraSalida', 'imagenSalida',
    'ubicacionSalida', 'tiempoTotal', 'area'];
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  //pagination rest api
  page: number = 0;
  size: number = 5;
  totalItems: number = 5;
  totalPages: number;
  currentPage: number;
  pageSizeOptions = [5, 10, 50];
  hidePageSize = false;
  showPageSizeOptions = true;
  showFirstLastButtons = true;
  disabled = false;
  pageEvent: PageEvent;

  imageData: any;

  modalRef: BsModalRef;

  //Lista para los select
  listaAreas: Data[] = []

  //Filtros
  filtroArea: FormControl = new FormControl('', [Validators.required]);
  filtroEmpleado: FormControl = new FormControl('', [Validators.required]);
  filtroFechaInicio: FormControl = new FormControl('', [Validators.required]);
  filtroFechaFin: FormControl = new FormControl('', [Validators.required]);

  IsWait: boolean = false;

  @ViewChild('templateLoading', { static: true }) loadingTemplate!: TemplateRef<any>;


  private destroy$: Subject<void> = new Subject<void>();

  constructor(public modalservice: BsModalService,
    private reporteService: ReporteService,
    private areService: AreaService,
    private alerta: AlertaService,
    private router: Router,
    public tokenservice: TokenService
  ) { }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.limpiarFormulario()
    if (!this.tokenservice.validarRol('Administrador') && !this.tokenservice.validarRol('JEFE')) {
      this.router.navigate(['/error']);
    }
    this.listar();
    this.listarAreas();
  }


  public formatoFechaActual(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }


  /**
   * Metodo para listar los la programacion
   * @return void
   */
  public listar(): void {
    this.reporteService.filterProgramaciones(this.page, this.size, this.filtroFechaInicio.value,
      this.filtroFechaFin.value, this.filtroEmpleado.value, this.filtroArea.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.dataSource = new MatTableDataSource(data.data);
        this.totalItems = data.totalItems;
        this.totalPages = data.totalPages;
        this.currentPage = data.currentPage;

      });
  }

  /**
  * Filtra los datos de la tabla
  * @param event evento del filtro de la tabla
  */
  filtroNombre(event: Event) {
    this.listar();
  }

  public handlePageEvent(e: PageEvent) {
    this.pageEvent = e;
    this.totalItems = e.length;
    this.size = e.pageSize;
    this.page = e.pageIndex;
    this.listar();
  }

  /**
   * Abre el componte ImagenComponent como un dialog
   * Luego le pasa a ese componente el nombre de la imagen
   * la cual se va abrir
   * @param nombreImagen: nombre de la imagen guardada
   */
  openDialogoMostrarImagen(temple: TemplateRef<any>, nombreImagen: any) {
    try {
      this.imageData = null
    } catch {

    }
    this.modalRef = this.modalservice.show(temple, this.configs);
    this.reporteService.getImage(nombreImagen).subscribe({
      next: (data: Blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          this.imageData = reader.result;
        };
        reader.readAsDataURL(data);
      },
      error: (error) => {
        console.error('Error al obtener la imagen:', error);
        this.imageData = null;
      }
    });
  }


  /**
   * Centra el modal
   */
  configs = {
    class: 'modal-dialog-centered modal-lg'
  }


  private listarAreas(): void {
    this.areService.listarActivos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.listaAreas = res
        }, error: error => {
          this.alerta.error('error', error.error.mensaje)
        }
      })
  }

  public limpiarFormulario(): void {
    this.filtroFechaInicio = new FormControl(this.formatoFechaActual());
    this.filtroFechaFin = new FormControl(this.formatoFechaActual());
    this.filtroEmpleado.reset();     // Reset the employee input
    this.filtroArea.reset();        // Reset the area input
  }

  /**
    * Abre una ventana para revisar ubicaciones donde se marco la asistencia
    * @param lat numero de la latitud
    * @param lng numero de la longitud
    */
  public abrirMapa(lat: number, lng: number): void {
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
  }

  public descargarArchivoExcel(): void {
    this.abrirModal(this.loadingTemplate);
    this.reporteService.downloadFileExcel(this.filtroFechaInicio.value,
      this.filtroFechaFin.value, this.filtroEmpleado.value, this.filtroArea.value)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.cerrarModal())
      )
      .subscribe({
        next: (data: Blob) => {
          const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          document.body.appendChild(a);
          a.href = url;
          a.download = "reporte_" + this.filtroFechaInicio.value + "_Al_" + this.filtroFechaFin.value + ".xlsx"; // Cambia el nombre del archivo según tus necesidades
          a.click();
          window.URL.revokeObjectURL(url);
        },
        error: (error: HttpErrorResponse) => {
          if (error.error instanceof Blob && error.error.type === 'application/json') {
            // Leer el Blob como texto
            const reader = new FileReader();
            reader.onloadend = () => {
              try {
                const errorMessage = JSON.parse(reader.result as string).mensaje || 'Ha ocurrido un error inesperado';
                this.alerta.error(errorMessage, '');
              } catch (e) {
                // Si no se puede parsear como JSON, mostrar un mensaje genérico
                this.alerta.error('Error desconocido al procesar la respuesta.', '');
              }
            };
            reader.readAsText(error.error);
          } else {
            // Manejar otros errores que no sean Blobs
            const mensajeError = error?.error?.mensaje || 'Ha ocurrido un error inesperado';
            this.alerta.error(mensajeError, '');
          }
        }

      });
  }

  private abrirModal(temple: TemplateRef<any>): void {
    this.IsWait = true;
    this.modalRef = this.modalservice.show(temple, this.configs);
  }

  private cerrarModal(): void {
    this.modalRef?.hide();
    this.IsWait = false;
  }
}
