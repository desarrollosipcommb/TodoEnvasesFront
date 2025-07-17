import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject, takeUntil } from 'rxjs';
import { TipoLicenciaModel } from 'src/app/models/tipo-licencia-model';
import { AlertaService } from 'src/app/services/alerta.service';
import { TipoLicenciaService } from 'src/app/services/tipo-licencia.service';
import { TokenService } from 'src/app/services/token/token.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-tipos-licencias',
  templateUrl: './tipos-licencias.component.html',
  styleUrls: ['./tipos-licencias.component.css']
})
export class TiposLicenciasComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['licencia', 'desc', 'estado', 'editar', 'eliminar'];
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  //pagination rest api
  page: number = 0;
  size: number = 5;
  buscarnombres: string;
  totalItems: number = 5;
  totalPages: number;
  currentPage: number;
  pageSizeOptions = [5, 20, 50];
  hidePageSize = false;
  showPageSizeOptions = true;
  showFirstLastButtons = true;
  disabled = false;
  pageEvent: PageEvent;
  private destroy$: Subject<void> = new Subject<void>();

  /**
   * Datos requeridos para el template de agregar/editar tipo de licencia
   */
  tituloTemple: string = ''
  modalRef: BsModalRef;
  btnConfirmar: string = '';
  idLicencia: any;
  botonDeshabilitado = false;
  licenciaFormGroup: FormGroup;

  constructor(public modalservice: BsModalService,
    private tipoLicenciaService: TipoLicenciaService,
    private alerta: AlertaService,
    public tokenservice: TokenService,
    private router: Router,) { }

  ngOnInit(): void {
    if (!this.tokenservice.validarRol('Administrador')) {
      this.router.navigate(['/error']);
    }
    this.listar()
    this.initFormGroup()
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  /**
   * Inicializa los campos del template y los agrupa en un
   * FormGroup llamado licenciaFormGroup
   */
  private initFormGroup(): void {
    this.licenciaFormGroup = new FormGroup({
      nombreLicenciaForm: new FormControl('', [Validators.required]),
      descripcionForm: new FormControl('', [Validators.required])
    });
  }

  /**
   * Llena la mat-table del html con los valores que obtiene del 
   * servicio listarPagination que esta en licenciaService
   */
  private listar(): void {
    this.tipoLicenciaService.listarPagination(this.size, this.page, this.buscarnombres)
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

  /**
   * Determina que accion realizara el template
   * @param accion Agregar o Actualizar
   */
  tipoAccion(accion: string) {
    if (accion == 'Registrar') {
      this.registrar();
    } else if (accion == 'Actualizar') {
      this.actualizar();

    }
  }

  /**
   * Sobre pone un template en la vista de la ventana
   * 
   * @param template  
   * @param licencia 
   */
  openModal(template: TemplateRef<any>, licencia: TipoLicenciaModel | null): void {
    this.modalRef = this.modalservice.show(template, { class: 'modal-lg' });
    this.limpiar();
    if (!licencia) {
      this.tituloTemple = 'Registro';
      this.btnConfirmar = 'Registrar';
    } else {
      this.tituloTemple = 'Actualización';
      this.btnConfirmar = 'Actualizar';
      this.idLicencia = licencia.id;
      this.setDataForm(licencia);
    }
  }

  /*
  * Centra el modal
  */
  configs = {
    class: 'modal-dialog-centered'
  }

  private limpiar(): void {
    this.licenciaFormGroup.reset();
  }

  private setDataForm(licencia: TipoLicenciaModel): void {
    this.licenciaFormGroup.patchValue({
      nombreLicenciaForm: licencia.nombre,
      descripcionForm: licencia.descripcion,
    });
  }

  /**
   * @returns retorna los datos en el formulario del template
   */
  getData() {
    const licencia = new TipoLicenciaModel();
    licencia.nombre = this.licenciaFormGroup.get('nombreLicenciaForm')?.value;
    licencia.descripcion = this.licenciaFormGroup.get('descripcionForm')?.value;
    return licencia;
  }

  /**
   * Envía los datos del formulario al servicio para registrar
   */
  registrar() {
    this.botonDeshabilitado = true
    this.tipoLicenciaService.registrar(this.getData())
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
   */
  actualizar() {
    this.botonDeshabilitado = true
    this.tipoLicenciaService.actualizar(this.idLicencia, this.getData())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: next => {
          this.botonDeshabilitado = false
          this.alerta.success('Tipo de licencia actualizada', '');
          this.modalRef.hide();
          this.listar();
          this.limpiar();
        }, error: error => {
          this.alerta.error(error.error.mensaje, '')
          this.botonDeshabilitado = false
        }
      })
  }


  eliminar(id: number): void {
    Swal.fire({
      title: 'Esta seguro?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, Eliminar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {

        this.tipoLicenciaService.eliminar(id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.alerta.success('Novedad eliminada', '');
              this.listar();
            }, error: err => {
              this.alerta.error('No se pudo eliminar la novedad', '');
            }
          });
      }
    })
  }

  activar(id: number): void {
    this.tipoLicenciaService.activar(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.alerta.success('Registro activado', '');
          this.listar();
        }, error: err => {
          this.alerta.error('No se pudo activar el registro', '');
        }
      });
  }
}
