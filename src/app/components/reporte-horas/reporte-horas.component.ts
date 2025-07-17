import { HttpErrorResponse } from '@angular/common/http';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Data } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { debounceTime, distinctUntilChanged, finalize, Subject, switchMap, takeUntil } from 'rxjs';
import { EmpleadoModel } from 'src/app/models/empleado-model';
import { AlertaService } from 'src/app/services/alerta.service';
import { AreaService } from 'src/app/services/area.service';
import { EmpleadoService } from 'src/app/services/empleado.service';
import { ReporteService } from 'src/app/services/reporte.service';
import { TokenService } from 'src/app/services/token/token.service';

@Component({
  selector: 'app-reporte-horas',
  templateUrl: './reporte-horas.component.html',
  styleUrls: ['./reporte-horas.component.css']
})
export class ReporteHorasComponent {
  isSending: boolean = false;

  displayedColumns: string[] = ['empleado', 'nd', 'nn', 'ned', 'nen', 'dd', 'dn', 'ded', 'den', 'fd', 'fn', 'fed', 'fen', 'dfd', 'dfn', 'dfed', 'dfen'];
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>

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

  fechaInicio: FormControl = new FormControl(new Date());
  fechaFin: FormControl = new FormControl(new Date());
  filtroArea = new FormControl('');
  listaAreas: Data[] = []

  private searchTerms = new Subject<string>();
  keyword: FormControl = new FormControl('')
  listaEmpleados: EmpleadoModel[] = []
  idEmpleado: any;

  maxDate: string;
  modalRefLoading: BsModalRef;
  @ViewChild('templateLoading', { static: true }) loadingTemplate!: TemplateRef<any>;
  configs = { class: 'modal-dialog-centered modal-lg' }
  private destroy$ = new Subject<void>();
  IsWait: boolean = false;
  constructor(private tokenService: TokenService,
    public modalservice: BsModalService,
    private reporteService: ReporteService,
    private areaService: AreaService,
    private empleadoService: EmpleadoService,
    private alerta: AlertaService) {
    const currentDate = new Date();
    this.maxDate = this.formatDate(currentDate);
  }

  handlePageEvent(e: PageEvent) {
    this.pageEvent = e;
    this.totalItems = e.length;
    this.size = e.pageSize;
    this.page = e.pageIndex;
    this.solicitarReporte()
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.listarAreas()
    this.fechaInicio.setValue(this.formatDate(new Date))
    this.fechaFin.setValue(this.formatDate(new Date))
    this.searchTerms
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term: string) => this.empleadoService.buscarEmpleados(term))
      )
      .subscribe((data) => {
        this.listaEmpleados = data['content'];
        this.totalPages = data.totalPages;
      });
  }

  formatDuration(duration: string): string {
    if (!duration.startsWith('PT') || duration == '0') {
      return duration; // Si no tiene 'PT', devuelve el valor original.
    }
    // Elimina el prefijo 'PT'
    const formatted = duration.substring(2);
    return formatted;
  }

  buscarEmpleado(): void {
    this.searchTerms.next(this.keyword.value);
  }

  seleccionarEmpleado(empleado: any) {
    this.idEmpleado = empleado.identificacion; // Almacena el empleado seleccionado
  }

  listarAreas() {
    this.areaService.listarActivos().subscribe({
      next: (res) => {
        this.listaAreas = res
      }, error: error => {
        this.alerta.error('error', error.error.mensaje)
      }
    })
  }
  limpiar() {
    this.fechaInicio.setValue(this.formatDate(new Date))
    this.fechaFin.setValue(this.formatDate(new Date))
    this.keyword.setValue('')
    this.filtroArea.setValue('')
  }

  private configLoading = {
    class: 'modal-dialog-centered'
  }

  public openLoading(temple: TemplateRef<any>) {

    this.IsWait = true
    this.modalRefLoading = this.modalservice.show(temple, this.configLoading)
    this.solicitarReporte()
  }

  solicitarReporte() {
    this.isSending = true; // Deshabilita el botón
    this.reporteService.reporteHoras(this.page, this.size, this.fechaInicio.value, this.fechaFin.value,
      this.idEmpleado, this.filtroArea.value).subscribe({
        next: (data) => {
          this.modalRefLoading.hide();
          this.dataSource = new MatTableDataSource(data.data);
          this.totalItems = data.totalItems;
          this.totalPages = data.totalPages;
          this.currentPage = data.currentPage;
          this.isSending = false;
        }, error: error => {
          this.modalRefLoading.hide();
          this.alerta.error(error.error.mensaje, '')
          this.isSending = false;
        }
      })
    this.isSending = false;
  }

  public descargarArchivoCSV(): void {
    this.abrirModal(this.loadingTemplate);
    this.reporteService.downloadCsv(this.fechaInicio.value, this.fechaFin.value, this.tokenService.getIdUsuario(),
      this.idEmpleado, this.filtroArea.value)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.cerrarModal())
      )
      .subscribe({
        next: (data: Blob) => {
          const blob = new Blob([data], { type: 'text/csv' }); // Cambiar el tipo de Blob a CSV
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          document.body.appendChild(a);
          a.href = url;
          a.download = `reporte_${this.fechaInicio.value}_Al_${this.fechaFin.value}.csv`; // Extensión CSV
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
    this.modalRefLoading = this.modalservice.show(temple, this.configs);
  }

  private cerrarModal(): void {
    this.modalRefLoading?.hide();
    this.IsWait = false;
  }
}
