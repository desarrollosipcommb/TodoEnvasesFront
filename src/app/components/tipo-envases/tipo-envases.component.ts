import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject, takeUntil } from 'rxjs';
import { TipoEnvaseModel } from 'src/app/models/tipo-envase-model';
import { AlertaService } from 'src/app/services/alerta.service';
import { TipoEnvaseService } from 'src/app/services/tipo-envase.service';
import { TokenService } from 'src/app/services/token/token.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-tipo-envases',
  templateUrl: './tipo-envases.component.html',
  styleUrls: ['./tipo-envases.component.css']
})
export class TipoEnvasesComponent implements OnInit, OnDestroy {

  tituloTemple: string = ''
  displayedColumns: string[] = ['nombre', 'diametro', 'estado', 'editar', 'eliminar'];
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
  btnConfirmar: string = '';
  idEnvase: any;
  nombreControl = new FormControl('', [Validators.required]);
  descripcionControl = new FormControl('', [Validators.required]);
  diametroControl = new FormControl('', [Validators.required]);

  IsWait: boolean = false;
  botonDeshabilitado = false;

  private destroy$: Subject<void> = new Subject<void>();

  constructor(public modalservice: BsModalService,
    private tipoEnvaseService: TipoEnvaseService,
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
    this.tipoEnvaseService.listarPagination(this.size, this.page, this.buscarnombres)
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
    class: 'modal-dialog-centered modal-lg'
  }


  openModal(template: TemplateRef<any>, tipoEnvase: TipoEnvaseModel | null): void {
    this.modalRef = this.modalservice.show(template, this.configs);
    this.limpiar();
    if (!tipoEnvase) {
      this.tituloTemple = 'Registro';
      this.btnConfirmar = 'Agregar';
    } else {
      this.tituloTemple = 'Actualización';
      this.btnConfirmar = 'Actualizar';
      this.idEnvase = tipoEnvase.id;
      this.setDataForm(tipoEnvase);
    }
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

  private limpiar(): void {
    this.nombreControl.setValue(null);
    this.diametroControl.setValue(null)
    this.descripcionControl.setValue(null)
  }

  private setDataForm(tipoEnvase: TipoEnvaseModel): void {
    this.nombreControl.setValue(tipoEnvase.name)
    this.diametroControl.setValue(tipoEnvase.diameter)
    this.descripcionControl.setValue(tipoEnvase.description)
  }

  /**
   * 
   * @returns retorna los datos en el formulario del template
   */
  getData() {
    const tipoEnvase = new TipoEnvaseModel();
    tipoEnvase.name = String(this.nombreControl.value)
    tipoEnvase.diameter = String(this.diametroControl.value)
    tipoEnvase.description = String(this.descripcionControl.value);
    return tipoEnvase;
  }

  /**
   * Envía los datos del formulario al servio para registrar
   */
  registrar() {
    this.botonDeshabilitado = true
    this.tipoEnvaseService.registrar(this.getData())
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
    this.tipoEnvaseService.actualizar(this.idEnvase, this.getData())
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
          this.eliminarTipoEnvase(id)
        } else {
          this.activarTipoEnvase(id)
        }

      }
    })

  }

  eliminarTipoEnvase(id: number): void {
    this.tipoEnvaseService.eliminar(id)
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

  activarTipoEnvase(id: number): void {
    this.tipoEnvaseService.activar(id)
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
