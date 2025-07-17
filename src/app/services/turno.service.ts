import { Injectable } from '@angular/core';
import { TurnoModel } from '../models/turno-model';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EmployeeTable {
  data: TurnoModel[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

let cabecera = new HttpHeaders();
cabecera = cabecera.append('Content-Type', 'application/json');


@Injectable({
  providedIn: 'root'
})
export class TurnoService {
  url = environment.baseUrl + 'turno/';

  constructor(private httpCliente: HttpClient) { }

  public listarPagination(pageNumber: number, pageSize: number, nombre: string): Observable<EmployeeTable> {
    let params = new HttpParams();
    params = params.append('page', pageNumber);
    params = params.append('size', pageSize);
    if (nombre)
      params = params.append('nombre', nombre);

    return this.httpCliente.get<EmployeeTable>(this.url + 'listar', { headers: cabecera, params: params })
  }

  public listarActivo(): Observable<any> {
    return this.httpCliente.get<any>(this.url + 'listar/activos', { headers: cabecera })
  }

  /**
   * Cambia el estado de un turno de activo a inactivo
   * @param id turno
   * @returns
   */
  /*
  public eliminar(id: number): Observable<any> {
    return this.httpCliente.delete<any>(this.url + `delete/${id}`, { headers: cabecera })
  }*/

  /**
 * Crear un turno
 * @param turno
 * @returns el turno creado si fue exitoso
 */
  public registrar(turno: TurnoModel): Observable<any> {
    return this.httpCliente.post<any>(this.url + 'crear', turno, { headers: cabecera })
  }

  /**
   * actualizar turno
   * @param id turno
   * @param turno
   * @returns
   */
  public actualizar(id: number, turno: TurnoModel): Observable<any> {
    return this.httpCliente.put<any>(this.url + `update/${id}`, turno, { headers: cabecera })
  }


}
