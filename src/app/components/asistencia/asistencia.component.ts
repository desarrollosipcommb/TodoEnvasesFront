import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ProgramacionModel } from 'src/app/models/programacion-model';
import { AlertaService } from 'src/app/services/alerta.service';
import { GeolocationService } from 'src/app/services/geolocation.service';
import { MarcacionService } from 'src/app/services/marcacion.service';
import { ProgramacionService } from 'src/app/services/programacion.service';
import { TokenService } from 'src/app/services/token/token.service';

@Component({
  selector: 'app-asistencia',
  templateUrl: './asistencia.component.html',
  styleUrls: ['./asistencia.component.css']
})
export class AsistenciaComponent {
  programacion: ProgramacionModel[] = [];
  MODULO: string = 'MARCACIONES';
  idEmpleado: number;
  latitude: number = 0;
  longitude: number = 0;
  // Variable para controlar el estado del botón de marcación
  botonDeshabilitado = false;

  idProgramacion: number;

  //empleado: Empleado
  tipoMarc: number
  activeCard: any = null;

  active: boolean = false;

  alimentacionSeleccionada: '';
  camaraActiva = false;
  fotoTomada = false;
  manejaCasino: boolean;


  imagenCapturada: string | null = null;
  archivoCapturado: File | null = null;
  @ViewChild('videoElement') videoElement!: ElementRef;
  @ViewChild('canvasElement') canvasElement!: ElementRef;

  cameraStream: MediaStream;

  private destroy$: Subject<void> = new Subject<void>();
  bandera: boolean = false;

  selected = '';

  constructor(
    private router: Router,
    private tokenService: TokenService,
    private programacionService: ProgramacionService,
    private marcacionService: MarcacionService,
    private geolocationService: GeolocationService,
    private alerta: AlertaService,
  ) { }

  ngOnInit(): void {

    if (!this.tokenService.validarRol('Administrador') && !this.tokenService.validarRol('EMPLEADO') && !this.tokenService.validarRol('JEFE')) {
      this.router.navigate(['/error']);
    } else {
      this.limpiar();
      this.obtenerProgramacion();
    }

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


  /**
  * obtenenmos la programacion del usuario de la fecha actual
  * @param id cedula del usuario
  * @returns void.
  */
  obtenerProgramacion(): void {
    this.idEmpleado = this.tokenService.getIdEmpleado();
    this.programacionService.detalle(this.idEmpleado)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => {
          this.programacion = data;
          /*this.programacion.forEach((item) => {
            if (item.tipo == 4) {
              this.alerta.info('Ya has realizado las marcaciones del día', '')
            }
          });*/
          if (this.programacion[0].tipo == 4) {
            this.alerta.info('Ya has realizado las marcaciones del día', '')
          }
          this.bandera = false;
        },
        error: err => {
          this.alerta.error(err.error.mensaje, '');
          this.bandera = true;
        }
      });
  }


  private async getUbicacion(): Promise<void> {
    try {
      const position: GeolocationPosition = await this.geolocationService.getCurrentPosition();
      this.latitude = position.coords.latitude;
      this.longitude = position.coords.longitude;

      this.handleLocation();
    } catch (error) {
      console.error(error);
    }
  }



  private handleLocation(): void {

  }

  /**
    * Metodo de registro de hora laboral
    * @param nombre si es una hora laboral de entrada o salida 
    * @returns void. 
   */
  public async registrarMarcacion(): Promise<void> {
    this.botonDeshabilitado = true;
    await this.getUbicacion();
    if ((this.latitude == 0) && (this.longitude == 0)) {
      this.alerta.error('Error, no se pudo obtener la ubicación', 'Recargue la pagina para intentar nuevamente o active la ubicación');
      this.botonDeshabilitado = false;
    } else {

      this.idEmpleado = this.tokenService.getIdEmpleado();
      const formData = new FormData();
      formData.append('tipo', this.tipoMarc.toString());
      formData.append('latitud', this.latitude.toString());
      formData.append('longitud', this.longitude.toString());
      if (this.archivoCapturado != undefined && this.archivoCapturado != null) {
        formData.append('file', this.archivoCapturado);
      }
      formData.append('idProgramacion', this.idProgramacion.toString());
      this.marcacionService.nuevo(formData).subscribe({
        next: data => {
          this.latitude = 0
          this.longitude = 0
          this.alerta.success('Registro exitoso', 'La ' + this.tipoMarcacion(this.tipoMarc) + ' se ha registrado correctamente');
          this.alimentacionSeleccionada = '';
          this.botonDeshabilitado = false;
          this.obtenerProgramacion();
          this.limpiar();
          this.apagarCamara()
        }, error: error => {
          this.alerta.error(error.error.mensaje, '')
          this.botonDeshabilitado = false;
        }
      });
    }
  }

  private limpiar(): void {
    this.archivoCapturado = null;
    this.camaraActiva = false;
    this.fotoTomada = false;
    this.imagenCapturada = null;
    this.activeCard = null;
    this.active = false;

  }


  tipoMarcacion(tipoMarc: number) {
    switch (tipoMarc) {
      case 0:
        return 'Entrada laboral';
      case 1:
        return 'Ingreso break';
      case 2:
        return 'Salida break';
      case 3:
        return 'Salida laboral';
      default:
        return 'Desconocido';
    }
  }



  async tomarFoto() {
    const video = this.videoElement.nativeElement as HTMLVideoElement;
    const canvas = this.canvasElement.nativeElement as HTMLCanvasElement;
    const context = canvas.getContext('2d');

    if (video && context) {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;
      await video.play();

      // Ajusta el tamaño del canvas al tamaño del video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Captura el fotograma actual del video en el canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convierte el canvas en una imagen base64
      this.imagenCapturada = canvas.toDataURL('image/jpeg');

      // Convierte la imagen base64 en un Blob
      const base64Data = this.imagenCapturada.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });

      // Crea un archivo (File) a partir del Blob
      this.archivoCapturado = new File([blob], 'imagen.jpeg', { type: 'image/jpeg' });

      // Detén la transmisión de video
      stream.getTracks().forEach(track => track.stop());
      this.fotoTomada = true
      this.camaraActiva = true
    }
  }

  async activarCamara() {
    try {
      this.fotoTomada = false
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



  activar(programacion: ProgramacionModel) {
    this.limpiar();
    this.active = true;
    if (programacion.tipo == 0 || programacion.tipo == 3) {
      this.activarCamara();
    }
    this.activeCard = programacion;
    this.idProgramacion = programacion.idProgramacion;
    this.tipoMarc = programacion.tipo;

  }

  apagarCamara() {
    try {
      if (this.cameraStream) {
        const tracks = this.cameraStream.getTracks();
        tracks.forEach((track) => {
          track.stop();
        });

        if (this.videoElement?.nativeElement) {
          this.videoElement.nativeElement.srcObject = null;
        }
        this.camaraActiva = false;
      }
    } catch (error) {
      console.error('Error al apagar la cámara:', error);
    }
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
