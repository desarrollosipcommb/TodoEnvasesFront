import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject, take, takeUntil, tap } from 'rxjs';
import { EmpleadoModel } from 'src/app/models/empleado-model';
import { AlertaService } from 'src/app/services/alerta.service';
import { EmpleadoService, EmployeeTable } from 'src/app/services/empleado.service';
import { RolService } from 'src/app/services/rol.service';
import { TokenService } from 'src/app/services/token/token.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-empleados',
  templateUrl: './empleados.component.html',
  styleUrls: ['./empleados.component.css']
})
export class EmpleadosComponent implements OnInit, OnDestroy {
  titulo: string = 'Lista de empleados';
  displayedColumns: string[] = ['nombre', 'Nombre de Usuario', 'telefono', 'rol', 'correo', 'actualizar', 'eliminar'];
  dataSource: MatTableDataSource<EmpleadoModel>;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  idEmpleado: number;
  tituloTemple: string = '';
  btnConfirmar: string = '';
  Empleado: EmpleadoModel;
  modalRef: BsModalRef;


  filtroEmpleadoControl = new FormControl();
  empleadoForm: FormGroup;

  NomRoles: any;

  page: number = 0;
  size: number = 5;
  buscarEmpleado: string = '';
  totalItems: number = 100;
  totalPages: number;
  currentPage: number;
  pageSizeOptions = [5, 10, 50, 100];
  pageEvent: PageEvent;
  showFirstLastButtons = true;
  disabled = false;
  showPageSizeOptions = true;
  hidePageSize = false;

  hide: boolean = true;
  hide2: boolean = true;

  //listaRoles: any;
  private destroy$: Subject<void> = new Subject<void>();
  IsWait: boolean = false;
  botonDeshabilitado = false;

  constructor(
    private rolService: RolService,
    public modalservice: BsModalService,
    public tokenservice: TokenService,
    private empleadoService: EmpleadoService,
    private alerta: AlertaService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.verifyAdminRole();
    this.initForm();
    this.listar();
    //this.listarRoles();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private verifyAdminRole(): void {
    if (!this.tokenservice.validarRol('admin') && !this.tokenservice.validarRol('JEFE')) {
      this.router.navigate(['/error']);
    }
  }

  private initForm(): void {
    this.empleadoForm = new FormGroup({
      nombreEmpleado: new FormControl('', [Validators.required]),
      documento: new FormControl('', [Validators.required]),
      correo: new FormControl('', [Validators.required, Validators.email]),
      telefono: new FormControl('', [Validators.required]),
      username: new FormControl('', [Validators.required]),
      contrasena: new FormControl('', [Validators.required, Validators.minLength(6)]),
      recontrasena: new FormControl('', [Validators.required, Validators.minLength(6)]),
      idRol: new FormControl(null, Validators.required)
    });
  }

  onChange(event: any): void {
    this.listar();
  }

  private listar(): void {
    this.empleadoService.listarPagination(this.page, this.size, this.buscarEmpleado)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (value: EmployeeTable) => {
          console.log(value);
          const rawData = value.content;
          if (!rawData) {
            this.dataSource = new MatTableDataSource<EmpleadoModel>([]);
            this.totalItems = 0;
            return;
          }
          const empleados: EmpleadoModel[] = rawData.map((item: any) => ({
            fullname: item.fullName,
            username: item.username,
            email: item.email,
            phone: item.phone,
            roleName: item.roleName,
            id: item.id,
            estado: item.isActive
          }));
          this.dataSource = new MatTableDataSource<EmpleadoModel>(empleados);
          this.totalItems = value.totalElements;
          this.totalPages = value.totalPages;
          this.currentPage = value.number; // <-- importante
        },
        error: err => {
          this.alerta.error('Error al listar empleados', err.error?.mensaje || 'Error desconocido');
        }
      });
  }

  manageRoles(rol: string): string {
    switch (rol) {
      case 'admin':
        return 'Administrador';
      case 'seller':
        return 'Vendedor';
      default:
        return 'Desconocido';
    }
  }



  handlePageEvent(e: PageEvent): void {
    this.size = e.pageSize;
    this.page = e.pageIndex;
    this.listar();
  }

  filtroNombre(event: Event): void {
    this.buscarEmpleado = (event.target as HTMLInputElement).value;
    this.listar();
  }

  openModal(template: TemplateRef<any>, empleado: EmpleadoModel | null): void {
    this.modalRef = this.modalservice.show(template, { class: 'modal-lg' });
    this.limpiar();
    if (!empleado) {
      this.tituloTemple = 'Registro';
      this.btnConfirmar = 'Agregar';
      this.enableFormControls();
    } else {
      this.tituloTemple = 'Actualización';
      this.btnConfirmar = 'Actualizar';
      this.setDataForm(empleado);
      this.disableFormControls();
    }
  }

  private limpiar(): void {
    this.empleadoForm.reset();
    this.NomRoles = null;
  }

  private enableFormControls(): void {
    this.empleadoForm.get('documento')?.enable();
    this.empleadoForm.get('nombreUsuario')?.enable();
  }

  private disableFormControls(): void {
    this.empleadoForm.get('documento')?.disable();
    this.empleadoForm.get('nombreUsuario')?.disable();
  }

  private setDataForm(empleado: EmpleadoModel): void {
    this.empleadoForm.patchValue({
      nombreEmpleado: empleado.fullname,
      username: empleado.username,
      correo: empleado.email,
      telefono: empleado.phone,
      idRol: empleado.roleName
    });
  }

  private getDataForms(): EmpleadoModel {
    const empleado = new EmpleadoModel();
    empleado.fullname = this.empleadoForm.get('nombreEmpleado')?.value;
    empleado.username = this.empleadoForm.get('username')?.value;
    empleado.email = this.empleadoForm.get('correo')?.value;
    empleado.phone = this.empleadoForm.get('telefono')?.value;
    empleado.roleName = this.empleadoForm.get('idRol')?.value;
    if (this.empleadoForm.get('contrasena')?.value === this.empleadoForm.get('recontrasena')?.value) {
      //empleado.contrasena = this.empleadoForm.get('contrasena')?.value;
    }

    return empleado;
  }

  actualizar(): void {
    this.botonDeshabilitado = true;

    if (this.validatePassword()) {
      const empleadoAct = this.getDataFormsForUpdate();
      if (!this.empleadoForm.get('contrasena')?.value) {
        //empleadoAct.contrasena = null;
      }

      console.log(empleadoAct);
      this.empleadoService.actualizar(empleadoAct)
        .pipe(
          takeUntil(this.destroy$),
          tap(() => this.botonDeshabilitado = false)
        )
        .subscribe({
          next: () => {
            this.alerta.success('Actualización', '');
            this.modalRef.hide();
            this.listar();
            this.limpiar();
          },
          error: err => {
            this.alerta.error(err.error.mensaje, '');
          }
        });
    }
  }

  private validatePassword(): boolean {
    if (this.empleadoForm.get('contrasena')?.value !== this.empleadoForm.get('recontrasena')?.value) {
      this.alerta.error('Las contraseñas no coinciden', '');
      return false;
    }

    const caracteres = this.empleadoForm.get('contrasena')?.value?.length ?? 0;
    if (caracteres < 6 && caracteres > 0) {
      this.alerta.error('La contraseña debe ser mayor a 6 caracteres', '');
      return false;
    }

    return true;
  }

  registar(): void {
  this.botonDeshabilitado = true;
  if (this.validatePassword()) {
    const empleadoTransformado = this.getDataFormsForRegister();
    this.empleadoService.registrar(empleadoTransformado)
      .pipe(
        takeUntil(this.destroy$),
        tap(() => this.botonDeshabilitado = false)
      )
      .subscribe({
        next: () => {
          this.alerta.success('Registro exitoso', '');
          this.modalRef.hide();
          this.listar();
          this.limpiar();
        },
        error: err => {
          this.alerta.error(err.error.mensaje, '');
        }
      });
    }
  }

  private getDataFormsForUpdate(): any {
    const nombreCompleto = this.empleadoForm.get('nombreEmpleado')?.value || '';
    const [firstName, ...rest] = nombreCompleto.split(' ');
    const lastName = rest.join(' ');
    return {
      username: this.empleadoForm.get('username')?.value,
      email: this.empleadoForm.get('correo')?.value,
      firstName: firstName,
      lastName: lastName,
      phoneNumber: this.empleadoForm.get('telefono')?.value,
      roleName: this.empleadoForm.get('idRol')?.value,
      password: null
    };
  }

  private getDataFormsForRegister(): any {
    const nombreCompleto = this.empleadoForm.get('nombreEmpleado')?.value || '';
    const [firstName, ...rest] = nombreCompleto.split(' ');
    const lastName = rest.join(' ');
    console.log(this.empleadoForm.get('idRol')?.value);
    return {
      username: this.empleadoForm.get('username')?.value,
      email: this.empleadoForm.get('correo')?.value,
      password: this.empleadoForm.get('contrasena')?.value,
      firstName: firstName,
      lastName: lastName,
      phoneNumber: this.empleadoForm.get('telefono')?.value,
      roleName: this.empleadoForm.get('idRol')?.value
    };
  }

  confirmar(id: string, tipo: string): void {
    Swal.fire({
      title: '¿Está seguro?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: `Sí, ${tipo}!`,
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        if (tipo === 'Eliminar') {
          this.eliminar(id);
        } else {
          this.activarEmpleado(id);
        }
      }
    });
  }

eliminar(username: string): void {
  this.empleadoService.eliminar(username)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: () => {
        this.alerta.success('Empleado eliminado', '');
        this.listar();
      },
      error: err => {
        this.alerta.error('No se pudo eliminar el empleado', err.error.mensaje);
      }
    });
}

  activarEmpleado(username: string): void {
    this.empleadoService.activar(username)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.alerta.success('Empleado activado', '');
          this.listar();
        },
        error: err => {
          this.alerta.error('No se pudo activar el Empleado', err.error.mensaje);
        }
      });
  }

  openLoading(template: TemplateRef<any>): void {
    try {
      this.modalRef.hide();
    } catch (error) {
    }
    this.IsWait = true;
    this.modalRef = this.modalservice.show(template, { class: 'modal-dialog-centered' });
  }

}
