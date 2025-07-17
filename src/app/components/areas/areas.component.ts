import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject, takeUntil } from 'rxjs';
import { AreaModel } from 'src/app/models/area-model';
import { AlertaService } from 'src/app/services/alerta.service';
import { AreaService } from 'src/app/services/area.service';
import { ClienteService } from 'src/app/services/cliente.service';
import { GeolocationService } from 'src/app/services/geolocation.service';
import { TokenService } from 'src/app/services/token/token.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-areas',
  templateUrl: './areas.component.html',
  styleUrls: ['./areas.component.css']
})
export class AreasComponent implements OnInit, OnDestroy {

  tituloTemple: string = ''

  displayedColumns: string[] = ['nombre', 'estado', 'editar', 'eliminar'];
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;


  //pagination rest api
  page: number = 0;
  size: number = 5;
  buscarnombres: string;
  totalItems: number = 100;
  totalPages: number;
  currentPage: number;
  pageSizeOptions = [5, 50, 200];
  hidePageSize = false;
  showPageSizeOptions = true;
  showFirstLastButtons = true;
  disabled = false;
  pageEvent: PageEvent;

  modalRef: BsModalRef;
  modalUbicacion: BsModalRef
  btnConfirmar: string = '';
  idArea: any;
  areaControl = new FormControl('', [Validators.required]);
  coordenadasControl = new FormControl('', [Validators.required])
  latitud: string;
  longitud: string;
  botonUbicacion = false;

  IsWait: boolean = false;
  botonDeshabilitado = false;

  private destroy$: Subject<void> = new Subject<void>();

  constructor(public modalservice: BsModalService,
    private areaService: AreaService,
    private clienteService: ClienteService,
    private geolocationService: GeolocationService,
    private alerta: AlertaService,
    private router: Router,
    public tokenservice: TokenService) { }




  ngOnInit(): void {
    this.verifyAdminRole();
    this.listar();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private verifyAdminRole(): void {
    if (!this.tokenservice.validarRol('Administrador') && !this.tokenservice.validarRol('JEFE')) {
      this.router.navigate(['/error']);
    }

  }

  /**
     * Lista los areas registrados
     * 
  */
  private listar(): void {
    this.areaService.listarPagination(this.size, this.page, this.buscarnombres)
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

  /*
  * Centra el modal
  */
  configs = {
    class: 'modal-dialog-centered'
  }

  openCoordenadas(template: TemplateRef<any>): void {
    this.modalUbicacion = this.modalservice.show(template, this.configs);
    this.limpiar();
    this.tituloTemple = 'Modificar coordenadas';
    this.btnConfirmar = 'Aceptar';
  }

  onInputCoordenadas(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    inputElement.value = inputElement.value.replace(/[^0-9.,\-\s]/g, ''); // Permitir solo números, comas, puntos y espacios
    this.coordenadasControl.setValue(inputElement.value);
  }

  getCoordenadas() {
    const coordenadas: string = this.coordenadasControl.value ?? '';
    if (coordenadas && coordenadas.includes(',')) {
      const [latitud, longitud] = coordenadas.split(',').map(coord => coord.trim()); // Separa y elimina espacios adicionales
      return { latitud, longitud };
    } else {
      this.alerta.error('', 'Formato inválido. Asegúrate de que las coordenadas estén separadas por una coma.');
      return null;
    }
  }

  /**
   * Envía los datos del formulario al servio para actualizar el registro
   */
  updateUbicacion() {
    this.botonDeshabilitado = true
    this.clienteService.actualizarUbicacion(this.getCoordenadas())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: next => {
          this.botonDeshabilitado = false
          this.alerta.success('Ubicación actualizada', '');
          this.modalUbicacion.hide();
          this.coordenadasControl.setValue(null);
        }, error: error => {
          this.alerta.error(error.error.mensaje, '')
          this.botonDeshabilitado = false
        }
      })
  }

  /**
   * Muestra un mensaje de confirmación con la librería swal 
   * Si el mensaje es confirmado procede a capturar la ubicación y actualiza los parámetros en el cliente
   */
  capturarUbicacion(): void {

    Swal.fire({
      title: '¿Desea actualizar la ubicación?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si!',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        this.botonUbicacion = true
        await this.getUbicacion();
        if ((this.latitud == '') && (this.longitud == '')) {
          this.alerta.error('Error, no se pudo obtener la ubicación',
            'Intente recargar la pagina o active la ubicación y proporcione los permisos de ubicación');
          this.botonUbicacion = false
        } else {
          const coordenadas = {
            latitud: this.latitud.toString(),
            longitud: this.longitud.toString()
          };
          this.clienteService.actualizarUbicacion(coordenadas)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: next => {
                this.botonUbicacion = false
                this.alerta.success('Ubicación actualizada', '');
                this.listar();
              }, error: error => {
                this.alerta.error(error.error.mensaje, '')
                this.botonUbicacion = false
              }
            })
        }
      }
    })
  }

  /**
   * Clase que utiliza el servicio getCurrentPosition que esta en geolocationService
   */
  async getUbicacion() {
    try {
      const position: GeolocationPosition = await this.geolocationService.getCurrentPosition();
      this.latitud = position.coords.latitude.toString()
      this.longitud = position.coords.longitude.toString()
    } catch (error) {
      console.error(error);
    }
  }


  openModal(template: TemplateRef<any>, area: AreaModel | null): void {
    this.modalRef = this.modalservice.show(template, this.configs);
    this.limpiar();
    if (!area) {
      this.tituloTemple = 'Registro';
      this.btnConfirmar = 'Agregar';
    } else {
      this.tituloTemple = 'Actualización';
      this.btnConfirmar = 'Actualizar';
      this.idArea = area.id;
      this.setDataForm(area);
    }
  }

  private limpiar(): void {
    this.areaControl.setValue(null);
  }

  private setDataForm(area: AreaModel): void {
    this.areaControl.setValue(area.nombreArea)
  }



  /**
   * Tipo de accion que se va realizar
   *
   * @param accion Agregar o Actualizar
   *
   */
  tipoAccion(accion: string) {
    if (accion == 'Agregar') {
      this.registrar();
    } else if (accion == 'Actualizar') {
      this.actualizar();

    }
  }

  /**
   * 
   * @returns retorna los datos en el formulario del template
   */
  getData() {
    const area = new AreaModel();
    area.nombreArea = this.areaControl.value;
    return area;
  }



  /**
   * Envía los datos del formulario al servio para registrar
   */
  registrar() {
    this.botonDeshabilitado = true
    this.areaService.registrar(this.getData())
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

  /**
   * Envía los datos del formulario al servio para actualizar el registro
   *
   */
  actualizar() {
    this.botonDeshabilitado = true
    this.areaService.actualizar(this.idArea, this.getData())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: next => {
          this.botonDeshabilitado = false
          this.alerta.success('Area actualizada', '');
          this.modalRef.hide();
          this.listar();
          this.limpiar();
        }, error: error => {
          this.alerta.error(error.error.mensaje, '')
          this.botonDeshabilitado = false
        }
      })
  }


  /**
   * Confirmar accion
   * @param id identificardor del registro
   * @param tipo Eliminar Activar
   */
  confirmar(id: number, tipo: string): void {

    Swal.fire({
      title: 'Esta seguro?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, ' + tipo + '!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        if (tipo == 'Eliminar') {
          this.eliminarArea(id)
        } else {
          this.activarArea(id)
        }

      }
    })

  }

  eliminarArea(id: number): void {
    this.areaService.eliminar(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.alerta.success('Area eliminada', '');
          this.listar();
        }, error: err => {
          this.alerta.error('No se pudo eliminar el area', '');
        }
      });
  }

  activarArea(id: number): void {
    this.areaService.activar(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.alerta.success('Area activada', '');
          this.listar();
        }, error: err => {
          this.alerta.error('No se pudo activar el area', '');
        }
      });
  }

}
