import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { map, Observable, startWith, Subject, takeUntil } from 'rxjs';
import { EmpleadoModel } from 'src/app/models/empleado-model';
import { LicenciaModel } from 'src/app/models/licencia-model';
import { TipoLicenciaModel } from 'src/app/models/tipo-licencia-model';
import { AlertaService } from 'src/app/services/alerta.service';
import { EmpleadoService } from 'src/app/services/empleado.service';
import { LicenciaService } from 'src/app/services/licencia.service';
import { TipoLicenciaService } from 'src/app/services/tipo-licencia.service';
import { TokenService } from 'src/app/services/token/token.service';

function formatoFechaActual(): string {
  const date = new Date
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

@Component({
  selector: 'app-licencias',
  templateUrl: './licencias.component.html',
  styleUrls: ['./licencias.component.css']
})
export class LicenciasComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['empleado', 'licencia', 'inicioLicencia', 'finLicencia', 'estado', 'editar', 'accion'];
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  //pagination rest api
  page: number = 0;
  size: number = 5;
  buscarnombres: string;
  totalItems: number = 5;
  totalPages: number;
  currentPage: number;
  pageSizeOptions = [5, 20, 50];
  hidePageSize = false;
  showPageSizeOptions = true;
  showFirstLastButtons = true;
  disabled = false;
  pageEvent: PageEvent;

  private destroy$: Subject<void> = new Subject<void>();

  /**
   * Datos requeridos para el template de agregar/editar tipo de licencia
   */
  tituloTemple: string = ''
  modalRef: BsModalRef;
  btnConfirmar: string = '';
  idLicencia: any;
  botonDeshabilitado = false;
  accionDeshabilitado = false;
  listaLicencias: TipoLicenciaModel[] = [];
  listaEmpleados: EmpleadoModel[] = [];
  empleadoForm = new FormControl('', [Validators.required])
  idEmpleado: number;
  licenciaForm: FormControl = new FormControl('', [Validators.required])
  idTipoLicencia: number;
  inicioLicForm: FormControl = new FormControl(formatoFechaActual(), [Validators.required])
  finLicForm: FormControl = new FormControl(formatoFechaActual(), [Validators.required])

  minDate: string; // Variable para almacenar la fecha mínima
  filteredEmpleados!: Observable<any[]>;
  filteredLicencias!: Observable<any[]>;

  filtroEmpleado: FormControl = new FormControl('', [Validators.required]);
  filtroFechaInicio: FormControl = new FormControl('', [Validators.required]);
  filtroFechaFin: FormControl = new FormControl('', [Validators.required]);

  constructor(public modalservice: BsModalService,
    private licenciaService: LicenciaService,
    private tipoLicenciaService: TipoLicenciaService,
    private empleadoService: EmpleadoService,
    private alerta: AlertaService,
    public tokenservice: TokenService,
    private router: Router) {
    this.minDate = formatoFechaActual();
  }

  ngOnInit(): void {
    if (!this.tokenservice.validarRol('Administrador') && !this.tokenservice.validarRol('EMPLEADO') && !this.tokenservice.validarRol('JEFE')) {
      this.router.navigate(['/error']);
    }


    this.filtroFechaInicio = new FormControl(this.formatoFechaActual());
    this.filtroFechaFin = new FormControl(this.formatoFechaActual());
    this.listar()
    this.listarLicencias()
    this.listarEmpleados()
    this.filteredEmpleados = this.empleadoForm.valueChanges.pipe(
      startWith(''),
      map(value => this._filterEmpleado(value || ''))
    );

    this.filteredLicencias = this.licenciaForm.valueChanges.pipe(
      startWith(''),
      map(value => this._filterLicencias(value || ''))
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public onFechaSeleccionada(event: Event): void {
    this.listar()
  }

  empleadoSeleccionado(empleado: any): void {
    if (empleado) { this.idEmpleado = empleado.id; }
  }

  displayFnEmpleado(empleado: any): string {
    return empleado && empleado.nombre ? empleado.nombre : '';
  }

  tipoLiceSeleccionado(licencia: any): void {
    if (licencia) { this.idTipoLicencia = licencia.id; }
  }

  displayFnLicencia(licencia: any): string {
    return licencia && licencia.nombre ? licencia.nombre : '';
  }

  private _filterEmpleado(value: string): any[] {
    return this.listaEmpleados.filter(empleado => empleado.nombre.toLowerCase().includes(value));
  }
  private _filterLicencias(value: string): any[] {
    return this.listaLicencias.filter(licencia => licencia.nombre.toLowerCase().includes(value));
  }

  limpiarFormulario() {
    this.filtroFechaInicio = new FormControl(this.formatoFechaActual());
    this.filtroFechaFin = new FormControl(this.formatoFechaActual());
    this.filtroEmpleado.reset();     // Reset the employee input
  }

  private formatoFechaActual(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = ('0' + (today.getMonth() + 1)).slice(-2);
    const day = ('0' + today.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  filtroNombre(event: Event) {
    this.buscarnombres = (event.target as HTMLInputElement).value;
    this.listar();
  }


  /**
   * Llena la mat-table del html con los valores que obtiene del 
   * servicio listarPagination que esta en licenciaService
   */
  private listar(): void {
    this.licenciaService.listarPagination(this.size, this.page, this.filtroFechaInicio.value,
      this.filtroFechaFin.value, this.filtroEmpleado.value,)
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

  listarLicencias() {
    this.tipoLicenciaService.listarActivos().subscribe({
      next: (res) => {
        this.listaLicencias = res
      }, error: error => {
        this.alerta.error('error', error.error.mensaje)
      }
    })
  }
  listarEmpleados() {
    this.empleadoService.listarActivos().subscribe({
      next: (res) => {
        this.listaEmpleados = res
      }, error: error => {
        this.alerta.error('error', error.error.mensaje)
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

  /**
   * Busca dinamicamento el empleado por nombre
   * @param event obtiene dinamicamento el valor ingresado
   */
  applyFilterNombres(event: Event) {
    this.buscarnombres = (event.target as HTMLInputElement).value;
    if (this.buscarnombres != null) {
      this.listar();
    }
  }

  /**
   * Sobre pone un template en la vista de la ventana
   * 
   * @param template  
   * @param licencia 
   */
  openModal(template: TemplateRef<any>, licencia: LicenciaModel | null): void {
    this.modalRef = this.modalservice.show(template, { class: 'modal-lg' });
    this.cleanView();
    if (!licencia) {
      this.tituloTemple = 'Registro';
      this.btnConfirmar = 'Registrar';
    } else {
      this.tituloTemple = 'Actualización';
      this.btnConfirmar = 'Actualizar';
      this.idLicencia = licencia.id;
      this.setDataForm(licencia);
    }
  }

  /**
   *  Centra el modal
   */
  configs = {
    class: 'modal-dialog-centered'
  }

  cleanView() {
    this.empleadoForm.setValue(null)
    this.licenciaForm.setValue(null)
    this.inicioLicForm.setValue(formatoFechaActual())
    this.finLicForm.setValue(formatoFechaActual())
  }

  private convertirFecha(fecha1: string): string {
    if (fecha1 == null || fecha1 == '')
      return '';

    const fecha = new Date(fecha1);
    const dia = fecha.getUTCDate().toString().padStart(2, "0");
    const mes = (fecha.getMonth() + 1).toString().padStart(2, "0");
    const anio = fecha.getFullYear();
    const horas = fecha.getHours().toString().padStart(2, "0");
    const minutos = fecha.getMinutes().toString().padStart(2, "0");

    return `${anio}-${mes}-${dia} ${horas}:${minutos}`;
  }

  /**
   * 
   * @returns retorna los datos en el formulario del template
   */
  getData() {
    const licencia = new LicenciaModel();
    licencia.idEmpleado = this.idEmpleado
    licencia.idTipoLicencia = this.idTipoLicencia
    licencia.fechaHoraInicio = this.convertirFecha(this.inicioLicForm.value)
    licencia.fechaHoraFin = this.convertirFecha(this.finLicForm.value)
    return licencia;
  }

  /**
   * Envía los datos del formulario al servicio para registrar
   */
  registrar() {
    this.botonDeshabilitado = true
    this.licenciaService.registrar(this.getData())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.botonDeshabilitado = false
          this.alerta.success('Registro exitoso', '');
          this.modalRef.hide();
          this.listar();
        }, error: error => {
          this.alerta.error(error.error.mensaje, '')
          this.botonDeshabilitado = false
        }
      })
  }

  setDataForm(licencia: any): void {
    this.idEmpleado = licencia.empleado.id
    this.idTipoLicencia = licencia.tipoLicencia.id
    this.empleadoForm.setValue(licencia.empleado)
    this.licenciaForm.setValue(licencia.tipoLicencia)
    this.inicioLicForm.setValue(licencia.fechaHoraInicio)
    this.finLicForm.setValue(licencia.fechaHoraFin)
  }

  actualizar() {
    this.botonDeshabilitado = true
    console.log(this.getData())
    this.licenciaService.actualizar(this.idLicencia, this.getData())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: next => {
          this.botonDeshabilitado = false
          this.alerta.success('Novedad actualizada', '');
          this.modalRef.hide();
          this.listar();
          this.cleanView();
        }, error: error => {
          this.alerta.error(error.error.mensaje, '')
          this.botonDeshabilitado = false
        }
      })

  }


  /**
   * determina si utiliza el servicio de aprobar o rechazar
   * @param id ID de la novedad/licencia
   * @param accion determina si utiliza el servicio de aprobar o rechazar
   * @param mensajeExito recibe el mensaje de exito mostrado en un template 
   */
  gestionNovedad(id: number, accion: 'aprobar' | 'rechazar', mensajeExito: string) {
    this.accionDeshabilitado = true
    this.licenciaService.gestionNovedad(id, accion)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: next => {
          this.accionDeshabilitado = false
          this.alerta.success(mensajeExito, '');
          this.listar();
        }, error: error => {
          this.alerta.error(error.error.mensaje, '')
          this.accionDeshabilitado = false
        }
      })
  }


}
