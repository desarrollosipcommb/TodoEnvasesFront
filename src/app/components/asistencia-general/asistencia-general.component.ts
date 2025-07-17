import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject, switchMap, takeUntil } from 'rxjs';
import { EmpleadoModel } from 'src/app/models/empleado-model';
import { ProgramacionModel } from 'src/app/models/programacion-model';
import { AlertaService } from 'src/app/services/alerta.service';
import { EmpleadoService } from 'src/app/services/empleado.service';
import { GeolocationService } from 'src/app/services/geolocation.service';
import { MarcacionService } from 'src/app/services/marcacion.service';
import { ProgramacionService } from 'src/app/services/programacion.service';
import { TokenService } from 'src/app/services/token/token.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-asistencia-general',
  templateUrl: './asistencia-general.component.html',
  styleUrls: ['./asistencia-general.component.css']
})
export class AsistenciaGeneralComponent implements OnDestroy {
  MODULO: string = 'MARCACIONES';

  // Variable para controlar el estado del botón de marcación
  botonDeshabilitado = false;

  idProgramacion: number;
  //empleado: Empleado
  programacion: ProgramacionModel[] = [];
  tipoMarc: number

  activeCard: any = null;

  active: boolean = false;


  latitude: number = 0;
  longitude: number = 0;
  camaraActiva = false;
  fotoTomada = false;
  imagenCapturada: string | null = null;
  archivoCapturado: File | null = null;
  @ViewChild('videoElement') videoElement!: ElementRef;
  @ViewChild('canvasElement') canvasElement!: ElementRef;

  public listaEmpleados: EmpleadoModel[];
  private searchTerms = new Subject<string>();
  public keyword: FormControl = new FormControl('')

  @ViewChild(MatInput) identificacionInput: MatInput;
  cameraStream: MediaStream;

  private destroy$: Subject<void> = new Subject<void>();


  constructor(
    private router: Router,
    public tokenService: TokenService,
    private programacionService: ProgramacionService,
    private horaLaboralService: MarcacionService,
    private geolocationService: GeolocationService,
    private empleadoService: EmpleadoService,
    private alerta: AlertaService) {
    this.searchTerms
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term: string) => this.empleadoService.buscarEmpleados(term))
      )
      .subscribe((data) => {
        ; // Verifica la estructura aquí
        this.listaEmpleados = data['content']
      });

  }


  ngAfterViewInit(): void {
    if (!this.tokenService.validarRol('Administrador') && !this.tokenService.validarRol('TABLET')) {
      this.router.navigate(['/error']);
    }
  }

  public buscarEmpleado(): void {
    this.searchTerms.next(this.keyword.value);
  }

  public seleccionarEmpleado(empleado: any): void {
    this.buscar(empleado.identificacion);
  }

  /**
  * Destruye la suscripción al observable
  */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    // Apaga la cámara al destruir el componente
    this.apagarCamara();
  }


  private async getUbicacion(): Promise<void> {
    try {
      const position: GeolocationPosition = await this.geolocationService.getCurrentPosition();
      this.latitude = position.coords.latitude;
      this.longitude = position.coords.longitude;
    } catch (error) {
      console.error(error);
    }
  }

  public async registrarMarcacion(): Promise<void> {
    if (this.botonDeshabilitado) return; // Evitar múltiples clics

    this.botonDeshabilitado = true;
    await this.getUbicacion();

    const formData = new FormData();
    formData.append('tipo', this.tipoMarc.toString());
    formData.append('latitud', this.latitude.toString());
    formData.append('longitud', this.longitude.toString());

    if (this.archivoCapturado) {
      formData.append('file', this.archivoCapturado);
    }

    formData.append('idProgramacion', this.idProgramacion.toString());
    this.horaLaboralService.nuevoSinLactitudLongitud(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          Swal.fire({
            title: 'Registro exitoso',
            text: 'Se ha registrado correctamente',
            icon: 'success',
            timer: 1000,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
          });

          this.reiniciarFormulario();
        },
        error: ({ error }) => {
          const mensajeError = error?.mensaje || error;
          this.alerta.error(mensajeError, '');
          this.botonDeshabilitado = false;
        }
      });
  }

  private reiniciarFormulario(): void {
    this.botonDeshabilitado = false;
    this.keyword.setValue('');
    this.programacion = [];
    this.listaEmpleados = [];
    this.limpiar();
    this.apagarCamara();
  }

  public buscar(identificacion: string): void {
    if (!this.validarIdentificacion(identificacion)) return;

    this.programacionService.detallePorIdentificacion(identificacion)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          if (data?.length) {
            this.programacion = data;
            if (this.programacion[0].tipo == 4) {
              this.alerta.info('Ya has realizado las marcaciones del día', '')
            }
          }
        },
        error: ({ error }) => {
          this.alerta.error(error.mensaje, '');
        }
      });
  }

  private validarIdentificacion(identificacion: string): boolean {
    if (!identificacion.toString()) {
      this.alerta.error('Debe ingresar una cédula', '');
      return false;
    }
    return true;
  }

  tipoMarcacion(tipoMarc: number): string {
    const tipos = ['Entrada laboral', 'Ingreso break', 'Salida break', 'Salida laboral'];
    return tipos[tipoMarc] || 'Desconocido';
  }

  private limpiar(): void {
    this.archivoCapturado = null;
    this.camaraActiva = false;
    this.fotoTomada = false;
    this.imagenCapturada = null;
    this.activeCard = null;
    this.active = false;
  }

  activar(programacion: ProgramacionModel): void {
    this.limpiar();
    this.active = true;
    if ([0, 3].includes(programacion.tipo)) {
      this.activarCamara();
    }
    this.activeCard = programacion;
    this.idProgramacion = programacion.idProgramacion;
    this.tipoMarc = programacion.tipo;
  }

  async tomarFoto(): Promise<void> {
    const video = this.videoElement.nativeElement as HTMLVideoElement;
    const canvas = this.canvasElement.nativeElement as HTMLCanvasElement;
    const context = canvas.getContext('2d');

    if (video && context) {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;
      await video.play();

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      this.imagenCapturada = canvas.toDataURL('image/jpeg');
      this.archivoCapturado = this.convertirBase64AFile(this.imagenCapturada);

      stream.getTracks().forEach(track => track.stop());
      this.fotoTomada = true;
      this.camaraActiva = false;
    }
  }

  private convertirBase64AFile(base64: string): File {
    const byteCharacters = atob(base64.split(',')[1]);
    const byteArray = new Uint8Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteArray[i] = byteCharacters.charCodeAt(i);
    }
    return new File([new Blob([byteArray], { type: 'image/jpeg' })], 'imagen.jpeg', { type: 'image/jpeg' });
  }

  async activarCamara(): Promise<void> {
    try {
      this.fotoTomada = false;
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = this.videoElement.nativeElement as HTMLVideoElement;
      video.srcObject = stream;
      await video.play();
      this.camaraActiva = true;
      this.cameraStream = stream;
    } catch (error) {
      console.error('Error al acceder a la cámara:', error);
      this.alerta.error('Error al acceder a la cámara', 'Debe aceptar los permisos para utilizar la cámara');
    }
  }

  apagarCamara(): void {
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach(track => track.stop());
    }

    if (this.videoElement?.nativeElement) {
      this.videoElement.nativeElement.srcObject = null;
    }

    this.camaraActiva = false;
  }

  // Función para formatear la fecha en español
  public formatFecha(fechaString: string): string {
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
