import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { UsuarioModel } from 'src/app/models/usuario-model';
import { AlertaService } from 'src/app/services/alerta.service';
import { TokenService } from 'src/app/services/token/token.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-usuario-tablet',
  templateUrl: './usuario-tablet.component.html',
  styleUrls: ['./usuario-tablet.component.css']
})
export class UsuarioTabletComponent implements OnInit {
  MODULO: string = 'EMPLEADOS';
  tituloTemple: string = ''
  filtroUsuario = new FormControl;

  idUsuario: any;
  hideContra: boolean = true;
  hideReContra: boolean = true;
  usuarioForm = new FormControl(null, [Validators.required]);
  contrasenaForm = new FormControl(null, [Validators.required, Validators.minLength(8)]);
  recontrasenaForm = new FormControl(null, [Validators.required, Validators.minLength(8)]);

  displayedColumns: string[] = ['nombre', 'estado', 'editar', 'eliminar'];
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  //pagination rest api
  page: number = 0;
  size: number = 5;
  buscarEmpleado: string;
  totalItems: number = 100;
  totalPages: number;
  currentPage: number;
  pageSizeOptions = [5, 10, 50, 100];
  hidePageSize = false;
  showPageSizeOptions = true;
  showFirstLastButtons = true;
  disabled = false;
  pageEvent: PageEvent;

  modalRef: BsModalRef;
  btnConfirmar: string = '';
  public rol: string = '';

  IsWait: boolean = false;


  constructor(public modalservice: BsModalService,
    private userTabletService: UsuarioService,
    private alerta: AlertaService,
    private router: Router,
    public tokenservice: TokenService) { }

  ngOnInit(): void {

    this.listar();
  }

  /**
 * Listar todos los datos y los pasa al dataSource para que se muestren en la tabla
 * @returns void
 */
  private listar(): void {
    this.userTabletService.listarPagination(this.page, this.size, this.filtroUsuario.value).subscribe({
      next: value => {
        this.dataSource = new MatTableDataSource(value.data);
        this.totalItems = value.totalItems;
        this.totalPages = value.totalPages;
        this.currentPage = value.currentPage;
      }
    })
  }

  handlePageEvent(e: PageEvent) {
    this.pageEvent = e;
    this.totalItems = e.length;
    this.size = e.pageSize;
    this.page = e.pageIndex;
    this.listar();
  }


  /**
   * Filtra los datos de la tabla
   * @param event evento del filtro de la tabla
  */
  filtro(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  /**
   * Abre el modal
   * @param permiso que se va actualizar, si es nulo es agregar
   * @param temple
   */
  openModal(temple: TemplateRef<any>, user: any) {
    this.modalRef = this.modalservice.show(temple, this.configs)
    if (user == null) {
      this.tituloTemple = 'Registro usuario de Cliente';
      this.btnConfirmar = 'Agregar'
      this.usuarioForm.setValue(null);
      this.contrasenaForm.setValue(null)
      this.recontrasenaForm.setValue(null)
    } else {
      this.tituloTemple = 'Actualización usuario de Cliente'
      this.usuarioForm.setValue(user.nombre);
      this.btnConfirmar = 'Actualizar'
      this.idUsuario = user.id
      this.usuarioForm.setValue(user.usuario)
    }
  }
  /**
     * Centra el modal
     */
  configs = {
    class: 'modal-dialog-centered'
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

  getData() {
    const usuario = new UsuarioModel();
    usuario.usuario = this.usuarioForm.value
    if (this.contrasenaForm.value == this.recontrasenaForm.value) {
      usuario.contrasena = this.contrasenaForm.value
    } else {
      this.alerta.error("Las contraseñas no coinciden", "")
      return
    }
    usuario.roles = 4;
    usuario.empleado = 0;
    return usuario;
  }

  limpiar() {
    this.usuarioForm.setValue(null)
    this.contrasenaForm.setValue(null)
    this.recontrasenaForm.setValue(null)
  }

  /**
   * Envía los datos del formulario al servio para registrar
   * el nuevo permiso
   *
   * Datos: Nombre del servicio
   *
   */
  registrar() {
    this.userTabletService.registrar(this.getData()).subscribe({
      next: (res) => {
        this.alerta.success('Registro exitoso', '');
        this.modalRef.hide();
        this.limpiar()
        this.listar();
      }, error: error => {
        //Errores de datos necesarios para el registro
        if (error.error.length > 0) {
          this.alerta.error(error.error, '')
        } else {
          //Error al comprobar los datos
          this.alerta.error(error.error.mensaje, '')
        }

      }
    })
  }

  /**
   * Envía los datos del formulario al servio para actualizar el registro
   *
   */
  actualizar() {

    this.userTabletService.actualizar(this.idUsuario, this.getData()).subscribe({
      next: next => {
        this.alerta.success('Actualización ciudad', '');
        this.modalRef.hide();
        this.listar();
      }, error: error => {
        if (error.error.length > 0) {
          this.alerta.error(error.error, '')
        } else {
          this.alerta.error(error.error.mensaje, '')
        }
      }
    })
  }


  /**
   * Elmina  seleccionado en la tabla
   * @returns void
   * @param id id del
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
        const idUsuario = this.tokenservice.getIdUsuario()
        this.userTabletService.eliminar(id).subscribe({
          next: () => {
            this.alerta.success('Usuario eliminado', '');
            this.listar();
          }, error: error => {
            this.alerta.error(error.message, '');
          }
        })


      }
    })
  }

}
