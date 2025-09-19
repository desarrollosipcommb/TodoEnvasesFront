import { Component } from '@angular/core';
import { SubirExcelService } from 'src/app/services/subir-excel.service';
import { MatTableDataSource } from '@angular/material/table';
import { ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { AlertaService } from 'src/app/services/alerta.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-subir-excel',
  templateUrl: './subir-excel.component.html',
  styleUrls: ['./subir-excel.component.css']
})
export class SubirExcelComponent {

  displayedColumns: string[] = ['fileName', 'message'];
  dataSource = new MatTableDataSource<{ fileName: string; message: string }>([]);
  @ViewChild(MatPaginator) paginator: MatPaginator;

  resultados: { fileName: string; message: string }[] = [];

  resultadosTapas: { fileName: string; message: string }[] = [];

  resultadosEnvases: { fileName: string; message: string }[] = [];

  resultadosDiametros: { fileName: string; message: string }[] = [];

  resultadosQuimicos: { fileName: string; message: string }[] = [];

  resultadosExtractores: { fileName: string; message: string }[] = [];



  constructor(private fileService: SubirExcelService,
    private alerta: AlertaService
  ) { }

  /**
   * Confirmar accion
   * @param id identificardor del registro
   * @param tipo Eliminar Activar
   */
  confirmar(file: Event, action: string): void {
    Swal.fire({
      title: '¿Esta seguro?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#a6b00e',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Confirmar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        if (action == "AGREGAR") {
          this.onFileSelected(file)
        } else if (action == "ACTUALIZAR") {

        }

      }
    })
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length == 1 && this.revisarArchivo(input.files[0])) {
      const file = input.files[0];

      this.fileService.agregarInventario(file).subscribe(
        response => {
          this.alerta.success('Inventario añadido', '');
          this.resultados = Array.isArray(response) ? response : Object.values(response);
          this.organizarResultados(this.resultados);
        },
        error => {
          this.alerta.error('Error al subir el archivo:', error)
        }
      );
    } else {
      alert("Por favor, selecciona solo un archivo del tipo .xls o .xlsx.");
    }
    input.value = ''; // Limpiar el input para permitir subir el mismo archivo nuevamente
  }

  actualizarInventario(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length == 1 && this.revisarArchivo(input.files[0])) {
      const file = input.files[0];

      this.fileService.actualizarInventario(file).subscribe(
        response => {
          this.alerta.success('Cantidades actualizadas', '');
          this.resultados = Array.isArray(response) ? response : Object.values(response);
          this.organizarResultados(this.resultados);
        },
        error => {
          this.alerta.error('Error al subir el archivo:', error)
        }
      );
    } else {
      alert("Por favor, selecciona solo un archivo del tipo .xls o .xlsx.");
    }
    input.value = ''; // Limpiar el input para permitir subir el mismo archivo nuevamente
  }

  revisarArchivo(file: File) {
    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      // El archivo es un Excel válido
      return true;
    }
    return false;
  }

  tipos: string[] = ['diametros', 'tapas', 'envases', 'quimicos', 'extracto'];
  tipoSeleccionado: string = 'diametros';

  resultadosPorTipo: { [key: string]: { fileName: string; message: string }[] } = {
    diametros: [],
    tapas: [],
    envases: [],
    quimicos: [],
    extractores: []
  };

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  setTipoSeleccionado(tipo: string) {
    this.tipoSeleccionado = tipo;
    this.dataSource.data = this.resultadosPorTipo[tipo] ?? [];
    if (this.paginator) this.paginator.firstPage();
  }

  organizarResultados(response: any) {
    // Limpia las listas antes de agregar nuevos resultados
    for (const tipo of this.tipos) {
      this.resultadosPorTipo[tipo] = [];
    }
    for (const item of response) {
      if (item.message.toLowerCase().includes('tapa')) {
        this.resultadosPorTipo['tapas'].push(item);
      } else if (item.message.toLowerCase().includes('envase')) {
        this.resultadosPorTipo['envases'].push(item);
      } else if (item.message.toLowerCase().includes('diametro')) {
        this.resultadosPorTipo['diametros'].push(item);
      } else if (item.message.toLowerCase().includes('quimico') || item.message.toLowerCase().includes('químico')) {
        this.resultadosPorTipo['quimicos'].push(item);
      } else if (item.message.toLowerCase().includes('extracto')) {
        this.resultadosPorTipo['extracto'].push(item);
      }
    }
    this.dataSource.data = this.resultadosPorTipo[this.tipoSeleccionado] ?? [];
    if (this.paginator) this.paginator.firstPage();
  }

  pageSize: number = 10;
  currentPage: number = 1;

  getRowClass(element: { message: string }) {
    const msg = element.message.toLowerCase();
    if (msg.toLowerCase().includes('error') && !msg.includes('ya existe')) return 'row-error';
    if (msg.includes('ya existe')) return 'row-warning';
    if (msg.includes('agregado')) return 'row-success';
    return '';
  }

  get paginatedResultados() {
    const lista = this.resultadosPorTipo[this.tipoSeleccionado] ?? [];
    const start = (this.currentPage - 1) * this.pageSize;
    return lista.slice(start, start + this.pageSize);
  }

  get totalPages() {
    const lista = this.resultadosPorTipo[this.tipoSeleccionado] ?? [];
    return Math.ceil(lista.length / this.pageSize);
  }

  changePage(page: number) {
    this.currentPage = page;
  }




}
