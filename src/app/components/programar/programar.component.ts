import { DatePipe } from '@angular/common';
import { AfterViewChecked, ChangeDetectorRef, Component, OnInit, TemplateRef } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { EmpleadoModel } from 'src/app/models/empleado-model';
import { ProgramacionModel } from 'src/app/models/programacion-model';
import { TurnoModel } from 'src/app/models/turno-model';
import { AlertaService } from 'src/app/services/alerta.service';
import { AreaService } from 'src/app/services/area.service';
import { EmpleadoService } from 'src/app/services/empleado.service';
import { ProgramacionService } from 'src/app/services/programacion.service';
import { TokenService } from 'src/app/services/token/token.service';
import { TurnoService } from 'src/app/services/turno.service';

@Component({
  selector: 'app-programar',
  templateUrl: './programar.component.html',
  styleUrls: ['./programar.component.css']
})
export class ProgramarComponent implements OnInit, AfterViewChecked {
  isScrolled = false;

  listaTurnos: any[] = []
  listaAreas: any[] = []
  filtroEmpleado: FormControl = new FormControl('');
  minDate: string; // Variable para almacenar la fecha mínima
  listaEmpleados: EmpleadoModel[] = []
  listaProgramados: EmpleadoModel[] = []
  empleadosFiltrados: EmpleadoModel[] = [];
  listaEjemplo: number[] = []

  turnoPartido: boolean = false
  turnoControl: FormControl = new FormControl('', [Validators.required]);
  horaInicioControl: FormControl = new FormControl('', [Validators.required]);
  inicioBreakControl: FormControl = new FormControl('', [Validators.required]);
  finBreakControl: FormControl = new FormControl('', [Validators.required]);
  horaFinControl: FormControl = new FormControl('', [Validators.required]);
  fechaInicioControl: FormControl = new FormControl('', [Validators.required]);
  fechaFinControl: FormControl = new FormControl('', [Validators.required]);
  areaControl: FormControl = new FormControl('');
  turnoSeleccionada: FormControl = new FormControl('', [Validators.required]);

  modalRef: BsModalRef;
  IsWait: boolean = false;
  botonDeshabilitado = false;

  constructor(public modalservice: BsModalService,
    private areaService: AreaService,
    private alerta: AlertaService,
    private empleadoService: EmpleadoService,
    private programacionService: ProgramacionService,
    private cdr: ChangeDetectorRef,
    private tokenService: TokenService,
    private turnoService: TurnoService,
    private datePipe: DatePipe,
    private router: Router) {
    const currentDate = new Date();
    this.minDate = currentDate.toISOString().slice(0, 16);
    this.filtroEmpleado.valueChanges.subscribe(value => {
      this.listarEmpleados();
    });
  }

  formatoFechaListar(date: string): string {
    const partes = date.split('-');
    const año = partes[0];
    const mes = partes[1];
    const día = partes[2];
    return `${año}-${mes}-${día}`;
  }

  formatoFechaProgram(date: string): string {
    const partes = date.split('-');
    const año = partes[0];
    const mes = partes[1];
    const día = partes[2];
    return `${día}/${mes}/${año}`;
  }


  empleadosSelected = false;
  programadosSelected = false;


  ngOnInit(): void {
    if (!this.tokenService.validarRol('Administrador') && !this.tokenService.validarRol('JEFE')) {
      this.router.navigate(['/error']);
    }

    this.fechaInicioControl = new FormControl(this.formatoFechaActual());
    this.fechaFinControl = new FormControl(this.formatoFechaActual());
    this.listarTurnos();
    this.listarAreas();
    this.listarEmpleados()
  }

  ngAfterViewChecked() {
    this.cdr.detectChanges();
  }



  listarAreas() {
    this.areaService.listarActivos().subscribe({
      next: (res) => {
        this.listaAreas = res;
      }, error: error => {
        this.alerta.error('error', error.error.mensaje)
      }
    })
  }

  listarTurnos() {
    this.turnoService.listarActivo().subscribe({
      next: (data) => {
        this.listaTurnos = data
      }, error: error => {
        this.alerta.error('', error.error.mensaje)
      }
    })
  }


  seleccionTurno(event: TurnoModel) {
    this.turnoPartido = this.listaTurnos.find(t => t.id === event)?.turnoPartido
    this.horaInicioControl.setValue(this.listaTurnos.find(t => t.id === event)?.horaInicio)
    this.inicioBreakControl.setValue(this.listaTurnos.find(t => t.id === event)?.horaInicioBreak)
    this.finBreakControl.setValue(this.listaTurnos.find(t => t.id === event)?.horaFinBreak)
    this.horaFinControl.setValue(this.listaTurnos.find(t => t.id === event)?.horaFin)
  }

  // Función para obtener la fecha actual en formato YYYY-MM-DD
  private formatoFechaActual(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = ('0' + (today.getMonth() + 1)).slice(-2);
    const day = ('0' + today.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  selectEmpleados() {
    this.empleadosFiltrados.forEach(empleados => empleados.checked = this.empleadosSelected);
  }

  onEmpleadosChange(): void {
    this.empleadosSelected = this.empleadosFiltrados.every(empleado => empleado.checked);
  }

  selectProgramados() {
    this.listaProgramados.forEach(programados => programados.checked = this.programadosSelected);
  }

  onProgramadosChange(): void {
    this.programadosSelected = this.listaProgramados.every(programados => programados.checked);
  }


  listarEmpEvent(event: any): void {
    this.listarEmpleados()
  }

  listarEmpleados() {
    this.empleadoService.listarEmpleadosSinProgramacion(
      this.formatoFechaListar(this.fechaInicioControl.value),
      this.formatoFechaListar(this.fechaFinControl.value),
      this.filtroEmpleado.value)
      .subscribe((data) => {
        this.listaEmpleados = data;
        this.actualizarEmpleadosFiltrados()
      });

  }

  actualizarEmpleadosFiltrados(): void {
    this.empleadosFiltrados = this.listaEmpleados.filter(empleado =>
      !this.listaProgramados.some(programado => programado.id === empleado.id));
    this.isScrolled = true;
    this.cdr.detectChanges();
  }

  agregarEmpleados(): void {
    this.listaEmpleados.forEach(empleado => {
      if (empleado.checked && !this.listaProgramados.includes(empleado)) {
        this.listaProgramados.push(empleado);
        this.selectProgramados()
      }
    });
    this.actualizarEmpleadosFiltrados();
    this.empleadosSelected = false;
  }

  sacarEmpleados(): void {
    this.listaProgramados = this.listaProgramados.filter(empleado => {
      if (empleado.checked && !this.empleadosFiltrados.includes(empleado)) {
        this.empleadosFiltrados.push(empleado);
        return false; // Elimina el empleado de listaProgramados
      }
      return true; // Mantén el empleado en listaProgramados
    });
    this.listarEmpleados()

    this.programadosSelected = false;
  }

  formatDate(date: any) {
    return this.datePipe.transform(date, 'dd/MM/yyyy')
  }

  getData() {
    const programacion = new ProgramacionModel;
    const turnoId = this.turnoControl.value;
    const nombreTurno = this.listaTurnos.find(t => t.id === turnoId)?.nombre;
    programacion.nombreTurno = nombreTurno
    programacion.idsEmpleados = this.listaProgramados.map(programado => programado.id);
    programacion.idArea = this.areaControl.value
    programacion.fechaInicio = this.formatDate(this.fechaInicioControl.value) ?? ''
    programacion.fechaFin = this.formatDate(this.fechaFinControl.value) ?? ''
    return programacion;
  }

  programarEmpleados() {
    this.botonDeshabilitado = true;
    this.programacionService.programarVarios(this.getData()).subscribe({
      next: (res) => {
        this.alerta.success('Registro exitoso', '');

        this.CleanView();
        this.modalRef.hide()
        this.botonDeshabilitado = false;
      }, error: error => {
        //Errores de datos necesarios para el registro
        if (error.error.length > 0) {
          this.alerta.error(error.error, '')
        } else {
          //Error al comprobar los datos
          this.alerta.error(error.error.mensaje, '')
        }
        this.modalRef.hide()
        this.botonDeshabilitado = false;
      }
    })

  }

  CleanView() {
    this.turnoControl.setValue(null)
    this.horaInicioControl.setValue(null)
    this.inicioBreakControl.setValue(null)
    this.finBreakControl.setValue(null)
    this.horaFinControl.setValue(null)
    this.turnoPartido = false
    this.listaProgramados = []
    this.turnoSeleccionada.setValue(false)
    this.fechaInicioControl = new FormControl(this.formatoFechaActual());
    this.fechaFinControl = new FormControl(this.formatoFechaActual());

  }

  configLoading = {
    class: 'modal-dialog-centered'
  }

  openLoading(temple: TemplateRef<any>) {
    try {
      this.modalRef.hide()
    } catch (error) {
    }
    this.IsWait = true
    this.modalRef = this.modalservice.show(temple, this.configLoading)
    this.programarEmpleados()
  }


}
