import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject, debounceTime, distinctUntilChanged, finalize, switchMap, takeUntil } from 'rxjs';
import { AreaModel } from 'src/app/models/area-model';
import { EmpleadoModel } from 'src/app/models/empleado-model';
import { MarcacionModel } from 'src/app/models/marcacion-model';
import { AlertaService } from 'src/app/services/alerta.service';
import { AreaService } from 'src/app/services/area.service';
import { EmpleadoService } from 'src/app/services/empleado.service';
import { MarcacionService } from 'src/app/services/marcacion.service';
import { TokenService } from 'src/app/services/token/token.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-marcaciones',
  templateUrl: './marcaciones.component.html',
  styleUrls: ['./marcaciones.component.css']
})
export class MarcacionesComponent implements OnInit, OnDestroy {
  titulo: string = 'Lista de registros';
  botonDeshabilitado: boolean = false;

  //Columnas de la tabla
  displayedColumns: string[] = ['nombreEmpleado', 'cedula', 'fecha', 'hora', 'tipo', 'nombreArea', 'imagen', 'actualizar', 'eliminar'];
  //paginator
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>
  @ViewChild(MatPaginator) paginator: MatPaginator;

  tituloTemple: string = '';
  btnConfirmar: string = '';

  modalRef: BsModalRef;
  modalRefLoading: BsModalRef;
  IsWait: boolean = false;

  marcacionForm: FormGroup;

  //keyword:string=''
  keyword: FormControl = new FormControl('')

  idEmpleado: any;
  editEmpleado: boolean = false;
  idHoraLabora: number;

  filtroArea: FormControl = new FormControl('', [Validators.required]);
  filtroEmpleado: FormControl = new FormControl('', [Validators.required]);
  filtroFechaInicio: FormControl = new FormControl(this.getMaxDate(), [Validators.required]);
  filtroFechaFin: FormControl = new FormControl(this.getMaxDate(), [Validators.required]);

  listaAreas: AreaModel[] = []
  listaEmpleados: EmpleadoModel[]; //todos los empleados
  tiposMarcaciones: any = [{ id: 0, default: 'ENTRADA', nombre: "Entrada" },
  { id: 1, default: 'ENTRADA_BREAK', nombre: "Entrada Break" },
  { id: 2, default: 'SALIDA_BREAK', nombre: "Salida Break" },
  { id: 3, default: 'SALIDA', nombre: "Salida" }]

  //pagination rest api
  page: number = 0;
  size: number = 5;
  buscarEmpleados: string;
  buscarnombres: any;
  totalItems: number = 100;
  totalPages: number;
  currentPage: number;
  pageSizeOptions = [5, 100, 500];
  hidePageSize = false;
  showPageSizeOptions = true;
  showFirstLastButtons = true;
  disabled = false;
  pageEvent: PageEvent;

  imageData: any;

  private searchTerms = new Subject<string>();
  private destroy$: Subject<void> = new Subject<void>();

  constructor(
    public modalservice: BsModalService,
    public tokenservice: TokenService,
    public areaService: AreaService,
    private empleadoService: EmpleadoService,
    private marcacionService: MarcacionService,
    private alerta: AlertaService,
    private router: Router,

  ) { }
  ngOnInit(): void {
    this.verifyAdminRole();
    this.listar();
    this.listarAreas();
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


    this.initForm();
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

  private initForm(): void {
    this.marcacionForm = new FormGroup({
      idEmpleado: new FormControl(0, [Validators.required]),
      idArea: new FormControl(0, [Validators.required]),
      fecha: new FormControl('', [Validators.required]),
      hora: new FormControl('', [Validators.required]),
      tipo: new FormControl(-1, [Validators.required]),
      observacion: new FormControl('', [Validators.required])
    });
  }

  public onFechaSeleccionada(event: Event): void {
    this.listar()
  }

  public getMaxDate(): string {
    const date = new Date();
    return date.toISOString().split('T')[0]; // Formato yyyy-MM-dd
  }

  public buscarEmpleado(): void {
    this.searchTerms.next(this.keyword.value);
  }
  public seleccionarEmpleado(empleado: any): void {
    this.idEmpleado = empleado.id; // Almacena el empleado seleccionado
  }

  public limpiarFormulario(): void {
    this.filtroFechaInicio.setValue(this.getMaxDate());  // Reset the date input
    this.filtroFechaFin.setValue(this.getMaxDate());   // Reset the date input
    this.filtroEmpleado.reset();     // Reset the employee input
    this.filtroArea.reset();       // Reset the area input
  }

  /**
   * Lista los listaHoraLaboral registrados
   *    */
  public listar(): void {
    if (this.filtroFechaInicio.value != '' && this.filtroFechaFin.value != '') {
      this.marcacionService.filterProgramaciones(this.page, this.size, this.filtroFechaInicio.value,
        this.filtroFechaFin.value, this.filtroEmpleado.value,
        this.filtroArea.value)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: value => {
            this.dataSource = new MatTableDataSource(value.data);
            this.totalItems = value.totalItems;
            this.totalPages = value.totalPages;
            this.currentPage = value.currentPage;
          }
        })
    } else {
      this.alerta.error('Debe ingresar las fechas de inicio y fin', '')
    }
  }

  /**
  * Filtra los datos de la tabla
  * @param event evento del filtro de la tabla
  */
  filtroNombre(event: Event) {
    this.buscarnombres = (event.target as HTMLInputElement).value;
    this.listar();
  }

  private listarAreas(): void {
    this.areaService.listarActivos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.listaAreas = res
        }, error: error => {
          this.alerta.error('Error', error.error.mensaje)
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
 * Abre el modal
 * @param temple el nombre del temple que se va utilizar
 * @param horaLaboral si el valor es null es para registrar
 *
 */
  public openModal(temple: TemplateRef<any>, horaLaboral: any) {
    this.modalRef = this.modalservice.show(temple, this.configs);
    this.limpiar();
    if (this.modalRef) {
      this.modalRef.onHide?.subscribe((reason: string) => {
        this.limpiar();
      });
    }
    if (horaLaboral == null) {
      this.marcacionForm.get('tipo')?.enable();
      this.tituloTemple = 'Registro';
      this.btnConfirmar = 'Agregar'
      this.editEmpleado = false;
    } else {
      this.tituloTemple = 'Actualización'
      this.btnConfirmar = 'Actualizar'
      this.editEmpleado = true;
      this.marcacionForm.get('tipo')?.disable();
      this.idHoraLabora = horaLaboral.id;
      this.setDataForm(horaLaboral)

    }
  }

  /**
   * Centra el modal
   */
  private configs = {
    class: 'modal-dialog-centered modal-lg'
  }


  /**
   * Limpia el formulario
   */
  private limpiar(): void {
    this.keyword.setValue(null)
    this.marcacionForm.reset();
  }

  private getData(): MarcacionModel {
    const marcacion: MarcacionModel = new MarcacionModel();
    marcacion.idEmpleado = this.idEmpleado
    marcacion.fecha = this.marcacionForm.get('fecha')?.value;
    marcacion.hora = this.marcacionForm.get('hora')?.value;
    marcacion.tipo = this.marcacionForm.get('tipo')?.value;
    marcacion.observacion = this.marcacionForm.get('observacion')?.value;
    marcacion.idArea = this.marcacionForm.get('idArea')?.value;
    return marcacion;
  }

  private setDataForm(marcacion: MarcacionModel): void {
    this.keyword.setValue(marcacion.nombreEmpleado)
    this.idEmpleado = marcacion.idEmpleado
    this.marcacionForm.patchValue({
      idEmpleado: marcacion.idEmpleado,
      idArea: marcacion.idArea,
      fecha: marcacion.fecha,
      hora: marcacion.hora,
      tipo: this.seleccionarTipo(marcacion.tipo),
      observacion: marcacion.observacion
    });
  }


  private seleccionarTipo(nombre: string): number | undefined {
    const tipoMarcacion = this.tiposMarcaciones.find((tipo: any) => tipo.default === nombre);
    return tipoMarcacion ? tipoMarcacion.id : undefined;
  }



  /**
   * Actualiza los datos del horaLaboral
   * Datos Nombre, documento y correo

   */
  private actualizar(): void {
    this.botonDeshabilitado = true
    this.marcacionService.actualizar(this.idHoraLabora, this.getData())
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.modalRefLoading.hide();
          this.botonDeshabilitado = false;
        })
      )
      .subscribe({
        next: (res) => {
          this.modalRef.hide()
          this.alerta.success('Actualización', '');
          this.limpiar()
          this.listar()
        }, error: error => {
          //this.modalRefLoading.hide();
          this.alerta.error(error.error.mensaje, '')

        }
      })

  }


  /**
   * Abre un template donde muestra una imagen que recive del servicio marcacaionService.getImage
   * @param temple 
   * @param nombreImagen 
   */
  openDialogoMostrarImagen(temple: TemplateRef<any>, nombreImagen: any): void {
    try {
      this.imageData = null
    } catch {

    }
    this.modalRef = this.modalservice.show(temple, this.configs);
    this.marcacionService.getImage(nombreImagen).subscribe({
      next: (data: Blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          this.imageData = reader.result;
        };
        reader.readAsDataURL(data);
      },
      error: (error) => {
        console.error('Error al obtener la imagen:', error);
        this.imageData = null;
      }
    });
  }

  private configLoading = {
    class: 'modal-dialog-centered'
  }

  public openLoading(temple: TemplateRef<any>, funcion: string) {
    //try { this.modalRef.hide() } catch (error) { }
    if (funcion == 'registrar') {
      this.IsWait = true
      this.modalRefLoading = this.modalservice.show(temple, this.configLoading)
      this.registrar()
    } else if (funcion == 'actualizar') {
      this.IsWait = true
      this.modalRefLoading = this.modalservice.show(temple, this.configLoading)
      this.actualizar();
    }
  }

  /**
   * Registro del horaLaboral
   * Datos Nombre, documento y correo
   */
  private registrar(): void {
    this.botonDeshabilitado = true;
    this.marcacionService.nuevoManual(this.getData())
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.modalRefLoading.hide();
          this.botonDeshabilitado = false;
        })
      )
      .subscribe({
        next: (res) => {
          this.modalRef.hide();
          this.alerta.success('Registro exitoso', '');
          this.limpiar();
          this.listar();
        }, error: error => {
          this.alerta.error(error.error.mensaje, '');
        }
      });
  }

  /**
   * Metodo para eliminar un horaLaboral
   * @param id id del horaLaboral a eliminar
   * @return void
   */
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
        this.eliminarHoraLaboral(id)
      }
    })

  }

  private eliminarHoraLaboral(id: number): void {
    this.marcacionService.eliminar(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.alerta.success('Registro eliminado', '');
          this.listar()
        }, error: err => {
          this.alerta.error('No se pudo eliminar el registro', '');
        }
      });
  }

}
