import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AreaModel } from '../models/area-model';

export interface EmployeeTable {
  data: AreaModel[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

let cabecera = new HttpHeaders();
cabecera = cabecera.append('Content-Type', 'application/json');

@Injectable({
  providedIn: 'root'
})

export class AreaService {
  url = environment.baseUrl + 'area/';

  constructor(private httpCliente: HttpClient) { }

  /**
    * Lista las areas registradas
    * @returns Areas[] lista de areas
    */
  public listarPagination(pageSize: number, pageNumber: number, nombre: string): Observable<EmployeeTable> {
    let params = new HttpParams();
    params = params.append('size', pageSize);
    params = params.append('page', pageNumber);
    if (nombre != null)
      params = params.append('nombre', nombre);
    return this.httpCliente.get<EmployeeTable>(this.url + 'listar', { headers: cabecera, params: params })
  }

  public listarActivos(): Observable<any> {
    return this.httpCliente.get<any>(this.url + 'listar/activos', { headers: cabecera })
  }

  /**
   * crea un area
   * @param area 
   * @returns mensaje si fue exitoso o error
   */
  public registrar(area: AreaModel): Observable<any> {
    return this.httpCliente.post<any>(this.url + 'crear', area)
  }

  /**
   * Actualiza los datos del area
   * @param id number
   * @param area
   * @returns Respuesta
   */
  public actualizar(id: number, area: AreaModel): Observable<any> {
    return this.httpCliente.put<any>(this.url + `update/${id}`, area);
  }

  /**
   * 
   * @param id id del area
   * @returns Response
   */
  public activar(id: number): Observable<any> {
    return this.httpCliente.put<any>(this.url + `activar/${id}`, {});
  }

  /**
    * Cambia el estado del area de activo a inactivo
    * @param id del area
    * @returns
    */
  public eliminar(id: number): Observable<any> {
    return this.httpCliente.delete<any>(this.url + `delete/${id}`, { headers: cabecera })
  }

}
