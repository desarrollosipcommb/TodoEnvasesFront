import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject, takeUntil } from 'rxjs';
import { ComboModel } from 'src/app/models/combo-model';
import { EnvaseModel } from 'src/app/models/envase-model';
import { TapaModel } from 'src/app/models/tapa-model';
import { AlertaService } from 'src/app/services/alerta.service';
import { ComboService } from 'src/app/services/combo.service';
import { EnvaseService } from 'src/app/services/envase.service';
import { TapaService } from 'src/app/services/tapa.service';
import { TokenService } from 'src/app/services/token/token.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-combos',
  templateUrl: './combos.component.html',
  styleUrls: ['./combos.component.css']
})
export class CombosComponent implements OnInit, OnDestroy {

  tituloTemple: string = ''
  displayedColumns: string[] = ['name', 'jar', 'cap', 'docenaPrice', 'cienPrice', 'unitPrice', 'editar', 'eliminar'];
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  //pagination rest api

  buscarnombres: string = '';

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
  nombreControl = new FormControl('', [Validators.required]);
  IsWait: boolean = false;
  botonDeshabilitado = false;

  private destroy$: Subject<void> = new Subject<void>();

  public envaseControl = new FormControl('', [Validators.required]);
  public tapaControl = new FormControl('', [Validators.required]);
  public unidadPrecioControl = new FormControl(0, [Validators.required]);
  public docenaPrecioControl = new FormControl(0, [Validators.required]);
  public cienPrecioControl = new FormControl(0, [Validators.required]);

  listaEnvases: EnvaseModel[] = [];
  listaTapas: any[] = [];

  private tapaModel: TapaModel;

  public isUpdate: boolean = false;

  constructor(public modalservice: BsModalService,
    private comboSercice: ComboService,
    private envaseService: EnvaseService,
    private alerta: AlertaService,
    private router: Router,
    public tokenservice: TokenService,

  ) {

    this.envaseControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        this.listarEnvases(value);
      });

  }


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
      this.router.navigate(['/error']);
    }

  }



  /**
     * Lista los envases registrados
     * 
  */
  private listar(): void {
    this.comboSercice.listarLikeName(this.size, this.page, this.buscarnombres)
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

  private listarEnvases(nombre: string | null): void {
    this.envaseService.listarPagination(5, 0, nombre, '')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: value => {
          this.listaEnvases = value.content;
        }
      })
  }

  public listarTapasByEnvases(nombreEnvase: string): void {


    this.envaseService.listarCompatibleByEnvase(nombreEnvase)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: value => {
          this.listaTapas = value.content;
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
  };


  openModal(template: TemplateRef<any>, combo: ComboModel | null, tipo: number): void {
    this.modalRef = this.modalservice.show(template, this.configs);
    this.limpiar();
    this.isUpdate = false;

    switch (tipo) {
      case 1:
        this.tituloTemple = 'Registro';
        this.btnConfirmar = 'Agregar';
        break;

      case 2:
        this.isUpdate = true;
        this.tituloTemple = 'Actualización';
        this.btnConfirmar = 'Actualizar';
        this.setDataForm(combo ?? new ComboModel());
        break;
    }
  }

  private limpiar(): void {
    this.nombreControl.setValue(null);
    this.listaEnvases = [];
    this.listaTapas = [];
    this.envaseControl.setValue(null);
    this.tapaControl.setValue(null);
    this.unidadPrecioControl.setValue(0);
    this.docenaPrecioControl.setValue(0);
    this.cienPrecioControl.setValue(0);
    this.tapaModel = new TapaModel();

  }

  private setDataForm(combo: ComboModel): void {

    this.nombreControl.setValue(combo.name)
    this.envaseControl.setValue(combo.jarName)
    this.unidadPrecioControl.setValue(combo.unitPrice)
    this.docenaPrecioControl.setValue(combo.docenaPrice)
    this.cienPrecioControl.setValue(combo.cienPrice)
    this.tapaControl.setValue(combo.capName)

    const tapa = new TapaModel();
    tapa.name = combo.capName;
    tapa.diameter = combo.diameter;
    tapa.color = combo.color;
    this.tapaModel = tapa;

  }



  public seleccionarTapa(tapa: TapaModel): void {
    this.tapaModel = tapa;
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
  private getData(): ComboModel {
    const combo = new ComboModel();
    combo.name = String(this.nombreControl.value);
    combo.jarName = String(this.envaseControl.value);
    combo.capName = this.tapaModel.name;
    combo.diameter = this.tapaModel.diameter;
    combo.color = this.tapaModel.color;
    combo.unitPrice = Number(this.unidadPrecioControl.value);
    combo.docenaPrice = Number(this.docenaPrecioControl.value);
    combo.cienPrice = Number(this.cienPrecioControl.value);
    return combo;
  }


  /**
 * Envía los datos del formulario al servio para registrar
 */
  registrar() {
    this.botonDeshabilitado = true
    this.comboSercice.registrar(this.getData())
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
    this.comboSercice.actualizar(this.getData())
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
  confirmar(combo: ComboModel, tipo: string): void {
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
          this.eliminarEnvase(combo)
        } else {
          this.activarEnvase(combo)
        }

      }
    })

  }

  eliminarEnvase(combo: ComboModel): void {
    //Variable let
    let comboEliminar = new ComboModel();
    this.comboSercice.eliminar(combo)
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

  activarEnvase(combo: ComboModel): void {
    this.comboSercice.activar(combo)
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
