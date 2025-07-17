import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { debounceTime, distinctUntilChanged, Subject, switchMap, takeUntil } from 'rxjs';
import { EmpleadoModel } from 'src/app/models/empleado-model';
import { ProgramacionModel } from 'src/app/models/programacion-model';
import { TurnoModel } from 'src/app/models/turno-model';
import { AlertaService } from 'src/app/services/alerta.service';
import { AreaService } from 'src/app/services/area.service';
import { EmpleadoService } from 'src/app/services/empleado.service';
import { ProgramacionService } from 'src/app/services/programacion.service';
import { TokenService } from 'src/app/services/token/token.service';
import { TurnoService } from 'src/app/services/turno.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-programaciones',
  templateUrl: './programaciones.component.html',
  styleUrls: ['./programaciones.component.css']
})
export class ProgramacionesComponent implements OnInit,OnDestroy {

  tituloTemple: string = ''
  displayedColumns: string[] = ['empleado', 'fechaHoraInicio', 'fechaHoraInicioBreak', 'fechaHoraFinBreak', 'fechaHoraSalida', 'area', 'editar', 'liberar'];
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  private destroy$: Subject<void> = new Subject<void>();

  modalRef: BsModalRef;
  btnConfirmar: string = '';

  //pagination rest api
  page: number = 0;
  size: number = 5;
  buscarnombres: any;
  buscarLote: any;
  totalItems: number = 5;
  totalPages: number;
  currentPage: number;
  pageSizeOptions = [5, 10, 50];
  hidePageSize = false;
  showPageSizeOptions = true;
  showFirstLastButtons = true;
  disabled = false;
  pageEvent: PageEvent;

  idEmpleado: any;
  fechaInicioControl: FormControl = new FormControl('', [Validators.required]);
  fechaFinControl: FormControl = new FormControl('', [Validators.required]);
  area: FormControl = new FormControl('', [Validators.required]);
  turnoControl: FormControl = new FormControl('', [Validators.required]);
  horaInicioControl: FormControl = new FormControl('', [Validators.required]);
  inicioBreakControl: FormControl = new FormControl('', [Validators.required]);
  finBreakControl: FormControl = new FormControl('', [Validators.required]);
  horaFinControl: FormControl = new FormControl('', [Validators.required]);
  turnoPartido: boolean = false
  keyword: FormControl = new FormControl('')
  private searchTerms = new Subject<string>();

  idProgramacion: number;

  listaTurnos: any[] = []
  listaAreas: any[] = []
  listaEmpleados: EmpleadoModel[] = []
  programacion: ProgramacionModel;

  filtroEmpleado: FormControl = new FormControl('', [Validators.required]);
  filtroFechaInicio: FormControl = new FormControl('', [Validators.required]);
  filtroFechaFin: FormControl = new FormControl('', [Validators.required]);
  filtroArea: FormControl = new FormControl('', [Validators.required]);
  minDate: string; // Variable para almacenar la fecha mínima
  maxDate: string;
  hoy: any;

  public fechaSalidaDisable: boolean = false;


  constructor(public modalservice: BsModalService,
    private datePipe: DatePipe,
    private programacionService: ProgramacionService,
    private areaService: AreaService,
    private alerta: AlertaService,
    private empleadoService: EmpleadoService,
    private turnoService: TurnoService,
    private router: Router,
    public tokenservice: TokenService) {
    this.hoy = new Date().toISOString().split('T')[0];
    const currentDate = new Date();
    this.minDate = currentDate.toISOString().slice(0, 16);
    this.filtroEmpleado.valueChanges.subscribe(value => {
      this.listarEmpleados();
    });
  }
  ngOnDestroy(): void {
   this.destroy$.next();
   this.destroy$.complete();
  }

  ngOnInit(): void {
    if (!this.tokenservice.validarRol('Administrador') && !this.tokenservice.validarRol('JEFE')) {
      this.router.navigate(['/error']);
    }
    this.filtroFechaInicio = new FormControl(this.hoy);
    this.filtroFechaFin = new FormControl(this.hoy);
    this.listar();
    this.listarTurnos();
    this.listarAreas();

    this.searchTerms
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),

        switchMap((term: string) => this.empleadoService.listarEmpleadosSinProgramacion(this.fechaInicioControl.value,
          this.fechaFinControl.value, term))
      )
      .subscribe((data) => {
        this.listaEmpleados = data;
      });
  }

  seleccionTurno(event: TurnoModel) {
    const turno:TurnoModel = this.listaTurnos.find(t => t.id === event);
    this.turnoPartido = turno.turnoPartido
    this.horaInicioControl.setValue(turno.horaInicio)
    this.inicioBreakControl.setValue(turno.horaInicioBreak)
    this.finBreakControl.setValue(turno.horaFinBreak)
    this.horaFinControl.setValue(turno.horaFin)
  }




  eventListar(): void {
    this.listar()
  }

  /**
  * Filtra los datos de la tabla
  * @param event evento del filtro de la tabla
  */
  filtroNombre(event: Event) {
    this.buscarnombres = (event.target as HTMLInputElement).value;
    this.listar();
  }


  /**
   * Metodo para listar los empleados
   * @return void
   */
  public listar(): void {
    this.programacionService.filterProgramaciones(this.page, this.size, this.filtroFechaInicio.value,
      this.filtroFechaFin.value, this.filtroEmpleado.value, this.filtroArea.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.dataSource = new MatTableDataSource(data.data);
        this.totalItems = data.totalItems;
        this.totalPages = data.totalPages;
        this.currentPage = data.currentPage;
      });
  }


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


  listarAreas() {
    this.areaService.listarActivos()
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (res) => {
        this.listaAreas = res
      }, error: error => {
        this.alerta.error('error', error.error.mensaje)
      }
    })
  }

  listarTurnos() {
    this.turnoService.listarActivo()
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (data) => {
        this.listaTurnos = data
      }, error: error => {
        this.alerta.error('', error.error.mensaje)
      }
    })
  }

  InicioSeleccionado(event: any): void {
    const fechaSeleccionada = new Date(event.target.value);
    fechaSeleccionada.setDate(fechaSeleccionada.getDate() + 1);
    this.maxDate = fechaSeleccionada.toISOString().slice(0, 16);
  }



  limpiarFiltros() {
    this.filtroFechaInicio.setValue(this.hoy);
    this.filtroFechaFin.setValue(this.hoy);
    this.filtroEmpleado.reset();     // Reset the employee input
    this.filtroArea.reset();         // Reset the area input
  }

  limpiarTemplate() {
    this.idEmpleado = null
    this.fechaInicioControl.setValue(null);
    this.fechaFinControl.setValue(null);
    this.area.setValue(null)
    this.keyword.setValue('');
    this.turnoControl.setValue(null)
    this.horaInicioControl.setValue(null)
    this.inicioBreakControl.setValue(null)
    this.finBreakControl.setValue(null)
    this.horaFinControl.setValue(null)
    this.turnoPartido = false
  }

  /**
   * Tipo de accion que se va realizar
   * @param accion Agregar o Actualizar
   */
  tipoAccion(accion: string) {
    if (accion == 'Programar') {
      this.registar();
    } else if (accion == 'Actualizar') {
      this.actualizar();

    }
  }

  /**
   * Centra el modal
   */
  configs = {
    class: 'modal-lg'
  }

  /**
   * Abre el modal
   * @param programacion que se va actualizar, si es nulo es agregar
   * @param temple
   */
  openModal(temple: TemplateRef<any>, programacion: any) {
    this.modalRef = this.modalservice.show(temple, this.configs)
    this.limpiarTemplate()
    if (programacion == null) {
      this.fechaSalidaDisable=true;
      this.tituloTemple = 'Registro programacion';
      this.btnConfirmar = 'Programar'
      this.keyword.enable()

    } else {
      this.fechaSalidaDisable=false;
      this.idProgramacion = programacion.idProgramacion;
      this.tituloTemple = 'Actualización programación'
      this.setData(programacion);
      this.btnConfirmar = 'Actualizar'
      this.keyword.disable();
      this.programacion = programacion;
    }
  }


  listarEmpleados(): void {
    const fechaInicio = this.fechaInicioControl.value;
    const fechaSalida = this.fechaFinControl.value;
    this.empleadoService.listarEmpleadosSinProgramacion(fechaInicio, fechaSalida, this.filtroEmpleado.value)
    .pipe(takeUntil(this.destroy$))  
    .subscribe((data) => {
        this.listaEmpleados = data;
      });
  }


  buscarEmpleado(): void {
    if (this.fechaInicioControl.value != '' || this.fechaFinControl.value != '') {
      this.searchTerms.next(this.keyword.value);
    } else {
      this.alerta.error('Debe seleccionar una hora inicio y una hora salida', '');
    }
  }
  seleccionarEmpleado(empleado: any) {
    this.idEmpleado = empleado.id; // Almacena el empleado seleccionado
  }


  setData(programacion: ProgramacionModel) {
    this.idEmpleado = programacion.idEmpleado;
    this.fechaInicioControl.setValue(this.getFechaString(programacion.fechaHoraInicio));
    this.fechaFinControl.setValue(programacion.fechaFin ?? '');
    this.area.setValue(programacion.idArea ?? '');
    this.keyword.setValue(programacion.nombreEmpleado ?? '');
    this.turnoControl.setValue(programacion.turno.id)
    this.seleccionTurno(programacion.turno.id);
  }

  private getFechaString(fecha: any) {
    return this.datePipe.transform(fecha, 'yyyy-MM-dd');
  }

  formatDate(date: any) {
    return this.datePipe.transform(date, 'dd/MM/yyyy')
  }

  getData(): ProgramacionModel {
    const programacion = new ProgramacionModel();
    const turnoId = this.turnoControl.value;
    programacion.nombreTurno = this.listaTurnos.find(t => t.id === turnoId)?.nombre;
    programacion.fechaInicio = this.formatDate(this.fechaInicioControl.value) ?? ''
    programacion.fechaFin = this.formatDate(this.fechaFinControl.value) ?? ''
    programacion.idArea = this.area.value
    programacion.idEmpleado = this.idEmpleado
    return programacion;
  }


  registar() {
    this.programacionService.crear(this.getData())
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (res) => {
        this.alerta.success('Registro exitoso', '');
        this.modalRef.hide();
        this.listar();
        this.limpiarTemplate();
      }, error: error => {
          this.alerta.error(error.error.mensaje, '')
      }
    })
  }

  /**
  * Envía los datos del formulario al servio para actualizar el registro
  * Datos: Nombre del permiso
  */
  actualizar() {
    this.programacionService.actualizarProgramacion(this.idProgramacion, this.getData())
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: next => {
        this.alerta.success('Actualización exitosa', '');
        this.modalRef.hide();
        this.listar();
        this.limpiarTemplate()
      }, error: error => {
          this.alerta.error(error.error.mensaje, '')
      }
    })
  }

  /**
   * Metodo para eliminar un horaLaboral
   * @param id id del horaLaboral a eliminar
   * @return void
   */
  liberar(id: number): void {

    Swal.fire({
      title: 'Esta seguro?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, Liberar Programación!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.programacionService.liberar(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data) => {
            this.alerta.success('Exitoso', '');
            this.listar();
          }, error: err => {
            this.alerta.error('No se pudo liberar el registro', '');
          }
        });
      }
    })
  }
}
