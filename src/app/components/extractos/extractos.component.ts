import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject, takeUntil } from 'rxjs';
import { AlertaService } from 'src/app/services/alerta.service';
import { ExtractosService } from 'src/app/services/extractos.service';
import { ExtractoModel } from 'src/app/models/extracto-model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-extractos',
  templateUrl: './extractos.component.html',
  styleUrls: ['./extractos.component.css']
})
export class ExtractosComponent implements OnInit, OnDestroy {

  tituloTemple: string = '';
  displayedColumns: string[] = ['name', 'description', 'quantity', 'price22ml',
    'price60ml', 'price125ml', 'price250ml', 'price500ml', 'price1000ml', 'editar', 'eliminar'];
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  page: number = 0;
  size: number = 5;
  buscarNombre: string = '';
  buscarTipo: string = '';
  totalItems: number = 100;
  totalPages: number;
  currentPage: number;
  pageSizeOptions = [5, 50, 200];
  showFirstLastButtons = true;
  disabled = false;
  pageEvent: PageEvent;

  modalRef: BsModalRef;
  btnConfirmar: string = '';
  idExtracto: any;

  nombreControl = new FormControl('', [Validators.required]);
  cantidadControl = new FormControl(0, [Validators.required]);
  descripcionControl = new FormControl('', [Validators.required]);
  precio22mlControl = new FormControl(0, [Validators.required]);
  precio60mlControl = new FormControl(0, [Validators.required]);
  precio125mlControl = new FormControl(0, [Validators.required]);
  precio250mlControl = new FormControl(0, [Validators.required]);
  precio500mlControl = new FormControl(0, [Validators.required]);
  precio1000mlControl = new FormControl(0, [Validators.required]);

  IsWait: boolean = false;
  botonDeshabilitado = false;

  private destroy$: Subject<void> = new Subject<void>();

  constructor(
    public modalservice: BsModalService,
    private extractoService: ExtractosService,
    private alerta: AlertaService
  ) { }

  ngOnInit(): void {
    this.listar();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private listar(): void {
    this.extractoService.listarPagination(this.size, this.page, this.buscarNombre)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: value => {
          this.dataSource = new MatTableDataSource(value.content);
          this.totalItems = value.totalElements;
          this.totalPages = value.totalPages;
          this.currentPage = value.number;
        }
      });
  }

  handlePageEvent(e: PageEvent) {
    this.pageEvent = e;
    this.totalItems = e.length;
    this.size = e.pageSize;
    this.page = e.pageIndex;
    this.listar();
  }

  applyFilterNombre(event: Event) {
    this.buscarNombre = (event.target as HTMLInputElement).value;
    this.listar();
  }

  applyFilterTipo(event: Event) {
    this.buscarTipo = (event.target as HTMLInputElement).value;
    this.listar();
  }

  openModal(template: TemplateRef<any>, extracto: any | null, tipo: number): void {
    this.modalRef = this.modalservice.show(template, { class: 'modal-dialog-centered modal-lg' });
    this.limpiar();
    switch (tipo) {
      case 1:
        this.tituloTemple = 'Registro';
        this.btnConfirmar = 'Agregar';
        break;
      case 2:
        this.tituloTemple = 'Actualización';
        this.btnConfirmar = 'Actualizar';
        this.setDataForm(extracto ?? {});
        break;
    }
  }

  private limpiar(): void {
    this.nombreControl.setValue(null);
    this.cantidadControl.setValue(null);
    this.precio22mlControl.setValue(null);
    this.descripcionControl.setValue(null);
    this.precio60mlControl.setValue(null);
    this.precio125mlControl.setValue(null);
    this.precio250mlControl.setValue(null);
    this.precio500mlControl.setValue(null);
    this.precio1000mlControl.setValue(null);

  }

  private setDataForm(extracto: any): void {
    this.nombreControl.setValue(extracto.name);
    this.cantidadControl.setValue(extracto.quantity);
    this.precio22mlControl.setValue(extracto.price);
    this.descripcionControl.setValue(extracto.description);
    this.precio60mlControl.setValue(extracto.price60ml);
    this.precio125mlControl.setValue(extracto.price125ml);
    this.precio250mlControl.setValue(extracto.price250ml);
    this.precio500mlControl.setValue(extracto.price500ml);
    this.precio1000mlControl.setValue(extracto.price1000ml);

  }

  tipoAccion(accion: string) {
    if (accion == 'Agregar') {
      this.registrar();
    } else if (accion == 'Actualizar') {
      this.actualizar();
    }
  }

  getData() {
    return {
      name: String(this.nombreControl.value),
      quantity: Number(this.cantidadControl.value),
      price22ml: Number(this.precio22mlControl.value),
      description: String(this.descripcionControl.value),
      price60ml: Number(this.precio60mlControl.value),
      price125ml: Number(this.precio125mlControl.value),
      price250ml: Number(this.precio250mlControl.value),
      price500ml: Number(this.precio500mlControl.value),
      price1000ml: Number(this.precio1000mlControl.value)
    };
  }

  registrar() {
    this.botonDeshabilitado = true;
    this.extractoService.registrar(this.getData())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.botonDeshabilitado = false;
          this.alerta.success('Registro exitoso', '');
          this.modalRef.hide();
          this.listar();
        },
        error: error => {
          this.alerta.error(error.error.mensaje, '');
          this.botonDeshabilitado = false;
        }
      });
  }

  actualizar() {
    this.botonDeshabilitado = true;
    this.extractoService.actualizar(this.getData())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.botonDeshabilitado = false;
          this.alerta.success('Extracto actualizado', '');
          this.modalRef.hide();
          this.listar();
          this.limpiar();
        },
        error: error => {
          this.alerta.error(error.error.mensaje, '');
          this.botonDeshabilitado = false;
        }
      });
  }

  confirmar(nameExtracto: string, accion: string): void {
    Swal.fire({
      title: 'Esta seguro?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, ' + accion + '!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        if(accion === 'Eliminar') {
          this.eliminarExtracto(nameExtracto);
        }else if(accion === 'Activar') {
          this.activarExtracto(nameExtracto);
        }
      }
    })
  }


  eliminarExtracto(nameExtracto: string): void {
    const extracto = this.dataSource?.data.find((e: ExtractoModel) => e.name === nameExtracto);
    if (!extracto) {
      this.alerta.error('Extracto no encontrado', '');
      return;
    }
    this.extractoService.eliminarExtracto(extracto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.alerta.success('Extracto eliminado', '');
          this.listar();
        },
        error: err => {
          this.alerta.error('No se pudo eliminar el extracto', '');
        }
      });
  }

  activarExtracto(nameExtracto: string): void {
    const extracto = this.dataSource?.data.find((e: ExtractoModel) => e.name === nameExtracto);
    if (!extracto) {
      this.alerta.error('Extracto no encontrado', '');
      return;
    }
    this.extractoService.activar(extracto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.alerta.success('Extracto activado', '');
          this.listar();
        },
        error: err => {
          this.alerta.error('No se pudo activar el extracto', '');
        }
      });
  }
}
