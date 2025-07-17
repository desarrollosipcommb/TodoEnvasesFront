import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { finalize, Subject, takeUntil } from 'rxjs';
import { ProgramacionModel } from 'src/app/models/programacion-model';
import { AlertaService } from 'src/app/services/alerta.service';
import { ProgramacionService } from 'src/app/services/programacion.service';
import { TokenService } from 'src/app/services/token/token.service';
import domtoimage from 'dom-to-image';
import { AreaModel } from 'src/app/models/area-model';
import { AreaService } from 'src/app/services/area.service';

@Component({
  selector: 'app-exportar-programaciones',
  templateUrl: './exportar-programaciones.component.html',
  styleUrls: ['./exportar-programaciones.component.css']
})
export class ExportarProgramacionesComponent implements OnInit, OnDestroy {
  private destroy$: Subject<void> = new Subject<void>();
  listaAreas: AreaModel[] = []
  modalRef: BsModalRef;

  filtroArea: FormControl = new FormControl('', [Validators.required]);
  filtroEmpleado: FormControl = new FormControl('', [Validators.required]);
  filtroFechaInicio: FormControl = new FormControl('', [Validators.required]);
  filtroFechaFin: FormControl = new FormControl('', [Validators.required]);


  public listaProgramaciones: ProgramacionModel[] = [];

  IsWait: boolean = false;

  @ViewChild('templateLoading', { static: true }) loadingTemplate!: TemplateRef<any>;

  constructor(public modalservice: BsModalService,
    private programacionService: ProgramacionService,
    private areaService: AreaService,
    private alerta: AlertaService,
    private router: Router,
    public tokenservice: TokenService) {
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.modalRef?.hide();
    this.IsWait = false;
  }



  ngOnInit(): void {

    if (!this.tokenservice.validarRol('Administrador') && !this.tokenservice.validarRol('JEFE')) {
      this.router.navigate(['/error']);
    }

    this.filtroFechaInicio = new FormControl(this.obtenerFechaActual());
    this.filtroFechaFin = new FormControl(this.obtenerFechaActual());
    this.listar();

    this.listarAreas();

  }


  public onFechaSeleccionada(event: Event): void {
    this.listar()
  }


  // Función para obtener la fecha actual en formato YYYY-MM-DD
  private obtenerFechaActual(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
  * Filtra los datos de la tabla
  * @param event evento del filtro de la tabla
  */
  public filtroNombre(event: Event) {
    this.listar();
  }


  /**
   * Metodo para listar los empleados
   * @return void
   */
  public listar(): void {
    this.abrirModal(this.loadingTemplate);
    this.programacionService.listarProgramaciones(this.filtroFechaInicio.value,
      this.filtroFechaFin.value, this.filtroEmpleado.value,this.filtroArea.value)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.cerrarModal();
        })
      )
      .subscribe(data => {
        this.listaProgramaciones = data;
      });
  }

  private listarAreas(): void {
    this.areaService.listarActivos().subscribe({
      next: (res) => {
        this.listaAreas = res
      }, error: error => {
        this.alerta.error('error', error.error.mensaje)
      }
    })
  }

  public limpiarFormulario(): void {
    this.filtroFechaInicio = new FormControl(this.obtenerFechaActual());
    this.filtroFechaFin = new FormControl(this.obtenerFechaActual());
    this.filtroEmpleado.reset();     // Reset the employee input
    this.filtroArea.reset();       // Reset the area input
  }


  /**
   * Centra el modal
   */
  private configs = {
    class: 'modal-dialog-centered'
  }

  /**
   * Abre el modal
   * @param programacion que se va actualizar, si es nulo es agregar
   * @param temple
   */
  public openModal(temple: TemplateRef<any>) {
    this.abrirModal(temple);
    this.exportarComoImagen().then(() => {
      this.cerrarModal();
    });
  }

  private cerrarModal() {
    this.modalRef?.hide();
    this.IsWait = false;
  }

  private abrirModal(temple: TemplateRef<any>) {
    this.IsWait = true;
    this.modalRef = this.modalservice.show(temple, this.configs);
  }


  public exportarComoImagen(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const element = document.querySelector('.export') as HTMLElement;
      domtoimage.toPng(element)
        .then((dataUrl) => {
          const link = document.createElement('a');
          link.href = dataUrl;
          link.download = 'programaciones.png';
          link.click();
          resolve();
        })
        .catch((error) => {
          console.error('Error al exportar como imagen:', error);
          reject(error);
        });
    });
  }

  // Función para formatear la fecha en español
  formatFecha(fechaString: string): string {
    // Convertir el string a un objeto Date
    const fecha = new Date(fechaString);

    // Opciones para el formato de fecha
    const opciones: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };

    // Formatear la fecha
    const fechaFormateada = new Intl.DateTimeFormat('es-ES', opciones).format(fecha);

    // Obtener la hora en formato de 12 horas
    const horas = fecha.getHours();
    const minutos = fecha.getMinutes();
    const periodo = horas >= 12 ? 'PM' : 'AM'; // Determinar AM o PM
    const horas12 = horas % 12 || 12; // Convertir a formato 12 horas

    // Formatear la hora con dos dígitos para los minutos
    const minutosFormateados = minutos < 10 ? '0' + minutos : minutos;

    // Combinar fecha y hora
    return `${fechaFormateada} a las ${horas12}:${minutosFormateados} ${periodo}`;
  }

}
