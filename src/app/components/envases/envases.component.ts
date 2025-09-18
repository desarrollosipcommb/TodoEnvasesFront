import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { debounceTime, distinctUntilChanged, Subject, switchMap, takeUntil } from 'rxjs';
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
  displayedColumns: string[] = ['name', 'diameter', 'quantity', 'docenaPrice', 'cienPrice', 'pacaPrice', 'unitPrice', 'unitsInPaca'
    ,'inventario', 'editar', 'eliminar'];
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  //pagination rest api
  page: number = 0;
  size: number = 5;
  buscarnombres: string='';
  buscarDiametro: string='';
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
  btnConfirmar: string = '';
  idEnvase: any;
  listaTipoEnvases: any
  nombreControl = new FormControl('', [Validators.required]);
  descripcionControl = new FormControl('', [Validators.required]);
  diametroControl = new FormControl('', [Validators.required]);
  cantidadControl = new FormControl(0, [Validators.required]);
  unidadPrecioControl = new FormControl(0, [Validators.required]);
  docenaPrecioControl = new FormControl(0, [Validators.required]);
  cienPrecioControl = new FormControl(0, [Validators.required]);
  pacaPrecioControl = new FormControl(0, [Validators.required]);
  unidadPacaControl = new FormControl(0, [Validators.required]);
  compatibleControl = new FormControl('', [Validators.required]);
  incompatibleControl = new FormControl('', [Validators.required]);

  IsWait: boolean = false;
  botonDeshabilitado = false;

  private destroy$: Subject<void> = new Subject<void>();

  isInventario: boolean = false;
  nameRequired: boolean = false;


  constructor(public modalservice: BsModalService,
    private envaseService: EnvaseService,
    private tipoEnvaseService: TipoEnvaseService,
    private alerta: AlertaService,
    private router: Router,
    public tokenservice: TokenService,

  ) {

  }




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
    if (!this.tokenservice.validarRol('admin')) {
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
     * Lista los envases registrados
     *
  */
  private listar(): void {
    this.envaseService.listarPagination(this.size, this.page, this.buscarnombres,this.buscarDiametro)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: value => {
          this.dataSource = new MatTableDataSource(value.content);
          this.totalItems = value.totalElements;
          this.totalPages = value.totalPages;
          this.currentPage = value.number;
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

  applyFilterDiametro(event: Event) {
    this.buscarDiametro= (event.target as HTMLInputElement).value;
    if (this.buscarDiametro!= null) {
      this.listar();
    }
  }

  /*
  * Centra el modal
  */
configs = {
  class: 'modal-dialog-centered modal-lg'
};




    openModal(template: TemplateRef<any>, envase: EnvaseModel | null, tipo: number): void {
      this.modalRef = this.modalservice.show(template, this.configs);
      this.limpiar();
      this.isInventario = false;
      this.nameRequired = true;
      switch (tipo) {
        case 1:
          this.tituloTemple = 'Registro';
          this.btnConfirmar = 'Agregar';
          this.nameRequired = false;
          break;

        case 2:
          this.tituloTemple = 'Actualización';
          this.btnConfirmar = 'Actualizar';
          this.setDataForm(envase??new EnvaseModel());
          break;
        case 3:
          this.setDataFormIventario(envase??new EnvaseModel());
          this.isInventario = true;
          this.tituloTemple = 'Añadir inventario';
          this.btnConfirmar = 'Agregar inventario';
          break;
      }
    }

  private limpiar(): void {
    this.nombreControl.setValue(null);
    this.diametroControl.setValue(null)
    this.cantidadControl.setValue(null)
    this.unidadPrecioControl.setValue(null)
    this.docenaPrecioControl.setValue(null)
    this.cienPrecioControl.setValue(null)
    this.pacaPrecioControl.setValue(null)
    this.unidadPacaControl.setValue(null)
  }

  private setDataForm(envase: EnvaseModel): void {
    this.nombreControl.setValue(envase.name)
    this.diametroControl.setValue(envase.diameter)
    this.cantidadControl.setValue(envase.quantity)
    this.unidadPrecioControl.setValue(envase.unitPrice)
    this.docenaPrecioControl.setValue(envase.docenaPrice)
    this.cienPrecioControl.setValue(envase.cienPrice)
    this.pacaPrecioControl.setValue(envase.pacaPrice)
    this.unidadPacaControl.setValue(envase.unitsInPaca)
    this.unidadPrecioControl.setValue(envase.unitPrice);
    this.descripcionControl.setValue(envase.description)

  }

   private setDataFormIventario(envase: EnvaseModel): void {
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
    }else if (accion == 'Agregar inventario') {
      this.registrarInventario();
    }
  }

  /**
   *
   * @returns retorna los datos en el formulario del template
   */
  getData() {
    const envase = new EnvaseModel();
    envase.name = String(this.nombreControl.value);
    envase.diameter = String(this.diametroControl.value)
    envase.quantity = Number(this.cantidadControl.value)
    envase.unitPrice = Number(this.unidadPrecioControl.value)
    envase.docenaPrice = Number(this.docenaPrecioControl.value)
    envase.cienPrice = Number(this.cienPrecioControl.value)
    envase.pacaPrice = Number(this.pacaPrecioControl.value)
    envase.unitsInPaca = Number(this.unidadPacaControl.value)
    envase.unitPrice= Number(this.unidadPrecioControl.value);
    envase.description= String(this.descripcionControl.value);
    return envase;
  }

   getDataInventario() {
    const envase = new EnvaseModel();
    envase.name = String(this.nombreControl.value);
    envase.quantity = Number(this.cantidadControl.value)
    return envase;
  }

   /**
  * Envía los datos del formulario al servio para registrar
  */
  public registrarInventario(): void {
    this.botonDeshabilitado = true
    this.envaseService.añadirInventario(this.getDataInventario())
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
    this.envaseService.actualizar(this.getData())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: next => {
          this.botonDeshabilitado = false
          this.alerta.success('Envase actualizada', '');
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
  confirmar(nameEnvase:string, tipo: string): void {
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
          this.eliminarEnvase(nameEnvase)
        } else {
          this.activarEnvase(nameEnvase)
        }

      }
    })

  }

  eliminarEnvase(nameEnvase:string): void {
    this.envaseService.eliminar(nameEnvase)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.alerta.success('Envase eliminada', '');
          this.listar();
        }, error: err => {
          this.alerta.error('No se pudo eliminar el envase', '');
        }
      });
  }

  activarEnvase(nameEnvase:string): void {
    this.envaseService.activar(nameEnvase)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.alerta.success('Envase activada', '');
          this.listar();
        }, error: err => {
          this.alerta.error('No se pudo activar el envase', '');
        }
      });
  }
}
