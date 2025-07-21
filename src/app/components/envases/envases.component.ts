import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject, takeUntil } from 'rxjs';
import { EnvaseModel } from 'src/app/models/envase-model';
import { AlertaService } from 'src/app/services/alerta.service';
import { EnvaseService } from 'src/app/services/envase.service';
import { TipoEnvaseService } from 'src/app/services/tipo-envase.service';
import { TokenService } from 'src/app/services/token/token.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-envases',
  templateUrl: './envases.component.html',
  styleUrls: ['./envases.component.css']
})
export class EnvasesComponent implements OnInit, OnDestroy {

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
  idEnvase: any;
  listaTipoEnvases: any
  nombreControl = new FormControl('', [Validators.required]);
  descripcionControl = new FormControl('', [Validators.required]);
  diametroControl = new FormControl('', [Validators.required]);
  cantidadControl = new FormControl('', [Validators.required]);
  unidadPrecioControl = new FormControl('', [Validators.required]);
  docenaPrecioControl = new FormControl('', [Validators.required]);
  cienPrecioControl = new FormControl('', [Validators.required]);
  pacaPrecioControl = new FormControl('', [Validators.required]);
  unidadPacaControl = new FormControl('', [Validators.required]);
  compatibleControl = new FormControl('', [Validators.required]);
  incompatibleControl = new FormControl('', [Validators.required]);
  latitud: string;
  longitud: string;
  botonUbicacion = false;

  IsWait: boolean = false;
  botonDeshabilitado = false;

  private destroy$: Subject<void> = new Subject<void>();

  constructor(public modalservice: BsModalService,
    private envaseService: EnvaseService,
    private tipoEnvaseService: TipoEnvaseService,
    private alerta: AlertaService,
    private router: Router,
    public tokenservice: TokenService) { }




  ngOnInit(): void {
    this.verifyAdminRole();
    this.listar();
    this.listarTipoEnvase()
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

  listarTipoEnvase(): void {
    this.tipoEnvaseService.listarActivos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => {
          this.listaTipoEnvases = data;
        },
        error: err => {
          this.alerta.error('Error al listar tipos de envase', err.error.mensaje);
        }
      });
  }

  /**
     * Lista los areas registrados
     * 
  */
  private listar(): void {
    this.envaseService.listarPagination(this.size, this.page, this.buscarnombres)
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
    class: 'modal-dialog-centered modal-xl'
  }


  openModal(template: TemplateRef<any>, envase: EnvaseModel | null): void {
    this.modalRef = this.modalservice.show(template, this.configs);
    this.limpiar();
    if (!envase) {
      this.tituloTemple = 'Registro';
      this.btnConfirmar = 'Agregar';
    } else {
      this.tituloTemple = 'Actualización';
      this.btnConfirmar = 'Actualizar';
      this.idEnvase = envase.id;
      this.setDataForm(envase);
    }
  }

  private limpiar(): void {
    this.nombreControl.setValue(null);
  }

  private setDataForm(envase: EnvaseModel): void {
    this.nombreControl.setValue(envase.name)
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
    const envase = new EnvaseModel();
    envase.name = this.nombreControl.value;
    return envase;
  }



  /**
   * Envía los datos del formulario al servio para registrar
   */
  registrar() {
    this.botonDeshabilitado = true
    this.envaseService.registrar(this.getData())
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
    this.envaseService.actualizar(this.idEnvase, this.getData())
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
    this.envaseService.eliminar(id)
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
    this.envaseService.activar(id)
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
