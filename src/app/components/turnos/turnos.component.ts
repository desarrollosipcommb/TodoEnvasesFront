import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { TurnoModel } from 'src/app/models/turno-model';
import { AlertaService } from 'src/app/services/alerta.service';
import { TokenService } from 'src/app/services/token/token.service';
import { TurnoService } from 'src/app/services/turno.service';

@Component({
  selector: 'app-turnos',
  templateUrl: './turnos.component.html',
  styleUrls: ['./turnos.component.css']
})
export class TurnosComponent implements OnInit {
  MODULO: string = 'PROGRAMACIONES';
  titulo: string = 'Lista de Turnos';
  btnAtras: boolean = true
  turnos: TurnoModel[] = [];
  manejaBreak: boolean = false;

  //Columnas de la tabla
  displayedColumns: string[] = ['nombre', 'entrada', 'entradaBreak', 'salidaBreak', 'salida', 'detalle',/*'turno',*/ 'estado', 'actualizar'/*, 'eliminar'*/];
  //paginator
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  tituloTemple: string = '';
  btnConfirmar: string = '';
  modalRef: BsModalRef;

  nombreControl = new FormControl('', [Validators.required]);

  filtroNombreControl = new FormControl;
  horaInicio: FormControl = new FormControl('', [Validators.required]);
  horaSalida: FormControl = new FormControl('', [Validators.required]);
  inicioBreak: FormControl = new FormControl('', [Validators.required]);
  finBreak: FormControl = new FormControl('', [Validators.required]);
  tiempoControl: FormControl = new FormControl(0, [Validators.required]);
  holguraEntradaControl: FormControl = new FormControl(0, [Validators.required]);
  holguraSalidaControl: FormControl = new FormControl(0, [Validators.required]);
  toleranciaEntradaControl: FormControl = new FormControl(0, [Validators.required]);
  toleranciaSalidaControl: FormControl = new FormControl(0, [Validators.required]);
  minDate: string; // Variable para almacenar la fecha mínima
  turnoSeleccionado: boolean = true;

  idTurno: number;

  //pagination rest api
  page: number = 0;
  size: number = 5;
  buscarnombres: any;
  totalItems: number = 100;
  totalPages: number;
  currentPage: number;
  pageSizeOptions = [5, 100, 500];
  hidePageSize = false;
  showPageSizeOptions = true;
  showFirstLastButtons = true;
  disabled = false;
  pageEvent: PageEvent;

  IsWait: boolean = false;
  botonDeshabilitado: boolean = false;
  showDetail: boolean = false

  constructor(
    public modalservice: BsModalService,
    public tokenservice: TokenService,
    private turnoService: TurnoService,
    private alerta: AlertaService
  ) {
    const currentDate = new Date();
    this.minDate = this.formatDate(currentDate);
  }

  formatDate(date: Date): string {
    // Formatea la fecha en 'yyyy-MM-ddTHH:mm' (formato aceptado por datetime-local)
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + date.getMinutes()).slice(-2);

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  ngOnInit(): void {
    /*if (this.tokenservice.isAccessV2('READ', this.MODULO) == false) {
      this.router.navigate(['/error']);
    }*/

    this.listar();
  }

  /**
   * Lista los turnos registrados
  */
  private listar(): void {
    this.turnoService.listarPagination(this.page, this.size, this.buscarnombres).subscribe({
      next: value => {
        this.dataSource = new MatTableDataSource(value.data);
        this.totalItems = value.totalItems;
        this.totalPages = value.totalPages;
        this.currentPage = value.currentPage;
      }
    })
  }


  onChange(event: any) {
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

  /**
   * Busca de manera dinamica el turno por nombre
   * @param event obtiene de manera dinamica el valor ingresado
   */
  applyFilterNombres(event: Event) {
    this.buscarnombres = (event.target as HTMLInputElement).value;
    if (this.buscarnombres != null) {
      this.listar();
    }
  }


  /**
   * Abre el modal
   * @param temple el nombre del temple que se va utilizar
   * @param empleado si el valor es null es para registrar
   *
   */
  openModal(temple: TemplateRef<any>, turno: any) {
    this.showDetail = false
    this.modalRef = this.modalservice.show(temple, this.configs);
    this.limpiar();
    if (turno == null) {
      this.tituloTemple = 'Registro';
      this.btnConfirmar = 'Agregar'
    } else {
      this.tituloTemple = 'Actualización'
      this.btnConfirmar = 'Actualizar'
      this.idTurno = turno.id
      this.setDataFormr(turno)

    }
  }

  openDetail(temple: TemplateRef<any>, turno: any) {
    this.modalRef = this.modalservice.show(temple, this.configs);
    this.tituloTemple = 'Detalle'
    this.showDetail = true
    this.btnConfirmar = 'Detalle'
    this.setDataFormr(turno)
  }

  /**
   * Centra el modal
   */
  configs = {
    class: 'modal-dialog-centered modal-lg'
  }

  /**
   * Limpia el formulario
   */
  limpiar() {
    this.nombreControl.setValue('')
    this.horaInicio.setValue('')
    this.inicioBreak.setValue('')
    this.finBreak.setValue('')
    this.horaSalida.setValue('')
    this.turnoSeleccionado = true
    this.tiempoControl.setValue(0)
    this.holguraEntradaControl.setValue(0)
    this.holguraSalidaControl.setValue(0)
    this.toleranciaEntradaControl.setValue(0)
    this.toleranciaSalidaControl.setValue(0)
  }

  /**
   * Obtienes los datos del formulario y los guarda el el modelo
   * @returns retorna el horario con los datos del formulario
   */
  getDataForms(): TurnoModel {
    const turno: TurnoModel = new TurnoModel();

    turno.nombre = this.nombreControl.value ?? '';
    turno.horaInicio = this.horaInicio.value.slice(0, 5)
    console.log(this.horaInicio.value)
    turno.horaInicioBreak = this.inicioBreak.value.slice(0, 5)
    turno.horaFinBreak = this.finBreak.value.slice(0, 5)
    turno.horaFin = this.horaSalida.value.slice(0, 5)
    turno.pasaOtroDia = this.turnoSeleccionado
    turno.tiempoBreak = this.tiempoControl.value
    turno.holguraEntrada = this.holguraEntradaControl.value
    turno.holguraSalida = this.holguraSalidaControl.value
    turno.toleranciaEntrada = this.toleranciaEntradaControl.value
    turno.toleranciaSalida = this.toleranciaSalidaControl.value
    turno.turnoPartido = this.manejaBreak
    return turno;

  }

  setDataFormr(turno: TurnoModel) {
    this.nombreControl.setValue(turno.nombre ?? '')
    this.horaInicio.setValue(turno.horaInicio)
    this.inicioBreak.setValue(turno.horaInicioBreak)
    this.finBreak.setValue(turno.horaFinBreak)
    this.horaSalida.setValue(turno.horaFin)
    this.manejaBreak = turno.turnoPartido
    this.turnoSeleccionado = turno.pasaOtroDia
    this.tiempoControl.setValue(turno.tiempoBreak)
    this.holguraEntradaControl.setValue(turno.holguraEntrada)
    this.holguraSalidaControl.setValue(turno.holguraSalida)
    this.toleranciaEntradaControl.setValue(turno.toleranciaEntrada)
    this.toleranciaSalidaControl.setValue(turno.toleranciaSalida)
  }


  /**
   * Actualiza los datos del turno
   */
  actualizar() {
    this.botonDeshabilitado = true
    this.turnoService.actualizar(this.idTurno, this.getDataForms()).subscribe({
      next: (res) => {
        this.botonDeshabilitado = false
        //const data = res;
        this.alerta.success('Actualización', '');
        this.modalRef.hide();
        this.listar();
        this.limpiar()
      }, error: error => {
        if (error.error.length > 0) {
          this.alerta.error(error.error, '')
        } else {
          this.alerta.error(error.error.mensaje, '')
        }
        this.botonDeshabilitado = false
      }
    })

  }

  /**
   * Registro del empleado
   * Datos Nombre, documento y correo

   */
  registrar() {
    this.botonDeshabilitado = true
    this.turnoService.registrar(this.getDataForms()).subscribe({
      next: (res) => {
        this.botonDeshabilitado = false
        this.alerta.success('Registro exitoso', '');
        this.modalRef.hide();
        this.listar();
        this.limpiar();
      }, error: error => {
        if (error.error.length > 0) {
          this.alerta.error(error.error, '')
        } else {
          this.alerta.error(error.error.mensaje, '')
        }
        this.botonDeshabilitado = false
      }
    })

  }
  /*
    eliminarHorario(id: number): void {
      this.turnoService.eliminar(id).subscribe({
        next: (data) => {
          this.alerta.success('Turno eliminado', '');
          this.listar();
        }, error: err => {
          this.alerta.error('No se pudo eliminar el Turno', err.error.mensaje);
        }
      });
    }*/

  limpiarFiltros() {
    this.buscarnombres = null
    this.filtroNombreControl.setValue('')
    this.listar()
  }

}
