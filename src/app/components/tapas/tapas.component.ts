import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject, takeUntil } from 'rxjs';
import { TapaModel } from 'src/app/models/tapa-model';
import { AlertaService } from 'src/app/services/alerta.service';
import { TapaService } from 'src/app/services/tapa.service';
import { TipoEnvaseService } from 'src/app/services/tipo-envase.service';
import { TokenService } from 'src/app/services/token/token.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-tapas',
  templateUrl: './tapas.component.html',
  styleUrls: ['./tapas.component.css']
})
export class TapasComponent implements OnInit, OnDestroy {

  tituloTemple: string = ''
  displayedColumns: string[] = ['nombre', 'color', 'diametro', 'cantidad', 'estado', 'inventario', 'detalle', 'editar', 'eliminar'];
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  //pagination rest api
  page: number = 0;
  size: number = 5;
  buscarnombres: string;
  buscarcolor: string;
  buscardiametro: string;
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
  idTapa: any;
  detailTapa: boolean = false
  readEditar: boolean = false
  listaTipoEnvase: any
  inventory: boolean = true
  nombreControl = new FormControl('', [Validators.required]);
  descripcionControl = new FormControl('', [Validators.required]);
  diametroControl = new FormControl('', [Validators.required]);
  colorControl = new FormControl('', [Validators.required])
  cantidadControl = new FormControl(0, [Validators.required]);
  unidadPrecioControl = new FormControl(0, [Validators.required]);
  docenaPrecioControl = new FormControl(0, [Validators.required]);
  cienPrecioControl = new FormControl(0, [Validators.required]);
  pacaPrecioControl = new FormControl(0, [Validators.required]);
  unidadPacaControl = new FormControl(0, [Validators.required]);

  IsWait: boolean = false;
  botonDeshabilitado = false;

  private destroy$: Subject<void> = new Subject<void>();

  constructor(public modalservice: BsModalService,
    private tipoEnvaseService: TipoEnvaseService,
    private tapaService: TapaService,
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
    if (!this.tokenservice.validarRol('admin')) {
      this.router.navigate(['/error']);
    }

  }

  listarTipoEnvase(): void {
    this.tipoEnvaseService.listarActivos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => {
          this.listaTipoEnvase = data;
        },
        error: err => {
          this.alerta.error('Error al listar tipos de envase', err.error.mensaje);
        }
      });
  }


  /**
  * Lista las tapas registrados
  * 
  */
  private listar(): void {
    this.tapaService.listarByNameDiameterColor(
      this.size, this.page,
      this.buscarnombres, this.buscardiametro,
      this.buscarcolor)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: value => {
          console.log(value.content)
          this.dataSource = new MatTableDataSource(value.content);
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

  applyFilterColor(event: Event) {
    this.buscarcolor = (event.target as HTMLInputElement).value;
    if (this.buscarcolor != null) {
      this.listar();
    }
  }

  applyFilterDiametro(event: Event) {
    this.buscardiametro = (event.target as HTMLInputElement).value;
    if (this.buscardiametro != null) {
      this.listar();
    }
  }


  /*
  * Centra el modal
  */
  configs = {
    class: 'modal-dialog-centered modal-lg'
  }

  openDetail(template: TemplateRef<any>, tapa: TapaModel): void {
    this.modalRef = this.modalservice.show(template, this.configs)
    this.detailTapa = true
    this.inventory = true
    this.tituloTemple = 'Detalle';
    this.setDataForm(tapa);
  }

  openInventario(template: TemplateRef<any>, tapa: TapaModel): void {
    this.modalRef = this.modalservice.show(template, this.configs);
    this.limpiar()
    this.nombreControl.setValue(tapa.name)
    this.colorControl.setValue(tapa.color)
    this.diametroControl.setValue(tapa.diameter)
    this.inventory = false
    this.detailTapa = false
    this.tituloTemple = 'Añadir Inventario'
    this.btnConfirmar = 'Añadir'
  }

  openModal(template: TemplateRef<any>, tapa: TapaModel | null): void {
    this.modalRef = this.modalservice.show(template, this.configs);
    this.detailTapa = false
    this.inventory = true
    this.limpiar();
    if (!tapa) {
      this.readEditar = false
      this.tituloTemple = 'Registro';
      this.btnConfirmar = 'Agregar';
    } else {
      this.tituloTemple = 'Actualización';
      this.btnConfirmar = 'Actualizar';
      this.readEditar = true
      this.idTapa = tapa.id;
      this.setDataForm(tapa);
    }
  }

  private limpiar(): void {
    this.nombreControl.setValue(null);
    this.descripcionControl.setValue(null)
    this.diametroControl.setValue(null)
    this.colorControl.setValue(null)
    this.cantidadControl.setValue(null)
    this.unidadPrecioControl.setValue(null)
    this.docenaPrecioControl.setValue(null)
    this.cienPrecioControl.setValue(null)
    this.pacaPrecioControl.setValue(null)
    this.unidadPacaControl.setValue(null)
  }

  private setDataForm(tapa: TapaModel): void {
    this.nombreControl.setValue(tapa.name)
    this.diametroControl.setValue(tapa.diameter)
    this.cantidadControl.setValue(tapa.quantity)
    this.colorControl.setValue(tapa.color)
    this.unidadPrecioControl.setValue(tapa.unitPrice)
    this.docenaPrecioControl.setValue(tapa.docenaPrice)
    this.cienPrecioControl.setValue(tapa.cienPrice)
    this.pacaPrecioControl.setValue(tapa.pacaPrice)
    this.unidadPacaControl.setValue(tapa.unitsInPaca)
    this.descripcionControl.setValue(tapa.description)
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
    } else if (accion == 'Añadir') {
      this.inventario();
    }
  }

  /**
   * 
   * @returns retorna los datos en el formulario del template
   */
  getData() {
    const tapa = new TapaModel();
    tapa.name = String(this.nombreControl.value);
    tapa.diameter = String(this.diametroControl.value)
    tapa.color = String(this.colorControl.value)
    tapa.quantity = Number(this.cantidadControl.value)
    tapa.unitPrice = Number(this.unidadPrecioControl.value)
    tapa.docenaPrice = Number(this.docenaPrecioControl.value)
    tapa.cienPrice = Number(this.cienPrecioControl.value)
    tapa.pacaPrice = Number(this.pacaPrecioControl.value)
    tapa.unitsInPaca = Number(this.unidadPacaControl.value)
    tapa.description = String(this.descripcionControl.value)

    return tapa;
  }



  /**
   * Envía los datos del formulario al servio para registrar
   */
  registrar() {
    this.botonDeshabilitado = true
    this.tapaService.registrar(this.getData())
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
    this.tapaService.actualizar(this.idTapa, this.getData())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: next => {
          this.botonDeshabilitado = false
          this.alerta.success('Tapa actualizada', '');
          this.modalRef.hide();
          this.listar();
          this.limpiar();
        }, error: error => {
          this.alerta.error(error.error.mensaje, '')
          this.botonDeshabilitado = false
        }
      })
  }

  inventario() {
    this.botonDeshabilitado = true
    const Tapa = new TapaModel()
    Tapa.name = String(this.nombreControl.value)
    Tapa.quantity = Number(this.cantidadControl.value)
    Tapa.color = String(this.colorControl.value)
    Tapa.diameter = String(this.diametroControl.value)
    this.tapaService.añadirInventario(Tapa)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: next => {
          this.botonDeshabilitado = false
          this.alerta.success('Cantidad añadida', '');
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
  confirmar(tapa: TapaModel, tipo: string): void {
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
          this.eliminarTapa(tapa)
        } else {
          this.activarTapa(tapa)
        }

      }
    })

  }

  eliminarTapa(tapa: TapaModel): void {
    this.tapaService.eliminar(tapa)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.alerta.success('Tapa eliminada', '');
          this.listar();
        }, error: err => {
          this.alerta.error('No se pudo eliminar la tapa', '');
        }
      });
  }

  activarTapa(tapa: TapaModel): void {
    this.tapaService.activar(tapa)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.alerta.success('Tapa activada', '');
          this.listar();
        }, error: err => {
          this.alerta.error('No se pudo activar la tapa', err.mensaje);
        }
      });
  }
}
