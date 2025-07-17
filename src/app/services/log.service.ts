import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LogModel } from '../models/log-model';
import { environment } from 'src/environments/environment';

let cabecera = new HttpHeaders();
cabecera = cabecera.append('Content-Type', 'application/json');

export interface EmployeeTable {
  data: LogModel[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

@Injectable({
  providedIn: 'root'
})
export class LogService {
  url= environment.baseUrl+'log/';
  constructor(private httpCliente:HttpClient) { }

  /**
   * Lista las log registrados
   * @param pageNumber numero de pagina
   * @param pageSize numero de elementos
   * @param fechaIncio Filtro fecha de inicio
   * @param fechaFin Filtro fecha final
   * @param busqueda Filtro de campo de entrada
   * @returns 
   */
  public listarPagination(pageNumber: number, pageSize: number, fechaIncio: string,
    fechaFin: string, busqueda: string
  ): Observable<EmployeeTable> {
    let params = new HttpParams();
    params = params.append('page', pageNumber.toString());
    params = params.append('size', pageSize.toString());

    if (fechaIncio != '' && fechaIncio != null) {
      params = params.append('fechaInicio', fechaIncio);
    }
    if (fechaFin != '' && fechaFin != null) {
      params = params.append('fechaFin', fechaFin);
    }
    if (busqueda != '' && busqueda != null) {
      params = params.append('busqueda', busqueda);
    }


    return this.httpCliente.get<EmployeeTable>(this.url + 'listar', { headers: cabecera, params: params })
  }
}
