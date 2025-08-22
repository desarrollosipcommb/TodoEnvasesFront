import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject, takeUntil } from 'rxjs';
import { QuimicoModel } from 'src/app/models/quimico-model';
import { AlertaService } from 'src/app/services/alerta.service';
import { QuimicoService } from 'src/app/services/quimico.service';
import { TokenService } from 'src/app/services/token/token.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-quimicos',
  templateUrl: './quimicos.component.html',
  styleUrls: ['./quimicos.component.css']
})
export class QuimicosComponent implements OnInit, OnDestroy {

  tituloTemple: string = '';
  displayedColumns: string[] = ['nombre', 'descripcion', 'cantidad', 'precioUnitario', 'estado', 'inventario', 'editar', 'eliminar'];
  dataSource: MatTableDataSource<QuimicoModel> = new MatTableDataSource<QuimicoModel>([]);
  @ViewChild(MatPaginator) paginator: MatPaginator;

  //pagination rest api
  //pagination rest api
  page: number = 0;
  size: number = 5;
  totalItems: number = 5;
  totalPages: number;
  currentPage: number;
  pageSizeOptions = [100, 250, 500];
  pageEvent: PageEvent;

  modalRef: BsModalRef;
  btnConfirmar: string = '';
  idEnvase: any;
  listaTipoEnvases: any
  nameControl = new FormControl('', [Validators.required]);
  descriptionControl = new FormControl('', [Validators.required]);
  quantityControl = new FormControl(0, [Validators.required]);
  cunitPriceControl = new FormControl(0, [Validators.required]);

  IsWait: boolean = false;
  botonDeshabilitado = false;

  private destroy$: Subject<void> = new Subject<void>();

  public buscarnombres: string = '';

  public isActualizar: boolean = false;
  public isDisabled: boolean = false;

  constructor(public modalservice: BsModalService,
    private quimicoService: QuimicoService,
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
    if (!this.tokenservice.validarRol('admin')) {
      //this.router.navigate(['/error']);
    }

  }


  /**
     * Lista los envases registrados
     * 
  */
  private listar(): void {
    this.quimicoService.listarPagination(this.size, this.page, this.buscarnombres)
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

  /*
  * Centra el modal
  */
  configs = {
    class: 'modal-dialog-centered'
  }


  openModal(template: TemplateRef<any>, quimicoModel: QuimicoModel | null, tipo: number): void {
    this.modalRef = this.modalservice.show(template, this.configs);
    this.limpiar();
    this.isActualizar = true;
    this.isDisabled = false;
    switch (tipo) {
      case 1:
        this.tituloTemple = 'Registro';
        this.btnConfirmar = 'Agregar';
        this.isActualizar = false;
        break;
      case 2:
        this.tituloTemple = 'Actualización';
        this.btnConfirmar = 'Actualizar';
        this.idEnvase = quimicoModel?.id;
        this.setDataForm(quimicoModel ?? new QuimicoModel());
        break;
      case 3:
        this.tituloTemple = 'Añadir inventario';
        this.btnConfirmar = 'Agregar inventario';
        this.isDisabled = true;
        this.setDataFormInvetario(quimicoModel ?? new QuimicoModel());
        break;
    }
  }

  private limpiar(): void {
    this.nameControl.setValue('');
    this.descriptionControl.setValue('');
    this.quantityControl.setValue(0);
    this.cunitPriceControl.setValue(0);
  }

  private setDataForm(quimico: QuimicoModel): void {
    this.nameControl.setValue(quimico.name);
    this.descriptionControl.setValue(quimico.description);
    this.quantityControl.setValue(quimico.quantity);
    this.cunitPriceControl.setValue(quimico.unitPrice);
  }

  private setDataFormInvetario(quimico: QuimicoModel): void {
    this.nameControl.setValue(quimico.name);
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
    } else if (accion == 'Agregar inventario') {
      this.registrarInventario();
    }
  }

  /**
   * 
   * @returns retorna los datos en el formulario del template
   */
  getData(): QuimicoModel {
    const quimico: QuimicoModel = new QuimicoModel();
    quimico.name = this.nameControl.value;
    quimico.description = this.descriptionControl.value;
    quimico.quantity = this.quantityControl.value;
    quimico.unitPrice = this.cunitPriceControl.value;
    return quimico;
  }

  getDataInventario(): QuimicoModel {
    const quimico: QuimicoModel = new QuimicoModel();
    quimico.name = this.nameControl.value;
    quimico.quantity = this.quantityControl.value;
    return quimico;
  }



  /**
   * Envía los datos del formulario al servio para registrar
   */
  registrar() {
    this.botonDeshabilitado = true
    this.quimicoService.registrar(this.getData())
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
  public registrarInventario(): void {
    this.botonDeshabilitado = true
    this.quimicoService.añadirInventario(this.getDataInventario())
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
    this.quimicoService.actualizar(this.getData())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: next => {
          this.botonDeshabilitado = false
          this.alerta.success('Actualización exitosa', '');
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
  confirmar(quimicoModel: QuimicoModel, tipo: string): void {
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
          this.eliminarQuimico(quimicoModel)
        } else {
          this.activarEnvase(quimicoModel)
        }

      }
    })

  }

  eliminarQuimico(quimicoModel: QuimicoModel): void {
    this.quimicoService.eliminar(quimicoModel)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.alerta.success('Exitoso', '');
          this.listar();
        }, error: err => {
          this.alerta.error('No se pudo eliminar', '');
        }
      });
  }

  activarEnvase(quimicoModel: QuimicoModel): void {
    this.quimicoService.activar(quimicoModel)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.alerta.success('Exitoso', '');
          this.listar();
        }, error: err => {
          this.alerta.error('No se pudo activar', '');
        }
      });
  }

  public getEstado(estado: boolean): string {
    if (estado) {
      return 'Activo'
    } else {
      return 'Inactivo'
    }
  }
}
