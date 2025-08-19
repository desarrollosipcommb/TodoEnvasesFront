import { Injectable } from '@angular/core';
import { QuimicoModel } from '../models/quimico-model';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

export interface EmployeeTable {
  data: QuimicoModel[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

let cabecera = new HttpHeaders();
cabecera = cabecera.append('Content-Type', 'application/json');


@Injectable({
  providedIn: 'root'
})
export class QuimicoService {
  url = environment.baseUrl + 'quimicos/';

  constructor(private httpCliente: HttpClient) { }

  /**
    * Lista los tipoEnvase registradas
    * @returns TipoEnvases[] lista de quimicos
    */
  public listarPagination(pageSize: number, pageNumber: number, nombre: string): Observable<EmployeeTable> {
    let params = new HttpParams();
    params = params.append('size', pageSize);
    params = params.append('page', pageNumber);
    if (nombre != null)
      params = params.append('nombre', nombre);
    return this.httpCliente.get<EmployeeTable>(this.url + 'all', { headers: cabecera, params: params })
  }


  /**
  * Lista los quimicos con estado activo
  * @returns Quimicos[] lista de quimicos
  */
  public listarActivos(pageSize: number, pageNumber: number): Observable<EmployeeTable> {
    let params = new HttpParams();
    params = params.append('size', pageSize);
    params = params.append('page', pageNumber);
    return this.httpCliente.get<EmployeeTable>(this.url + 'all/active', { headers: cabecera, params: params })
  }

  /**
* Lista los quimicos con estado inactivo
* @returns Quimicos[] lista de quimicos
*/
  public listarInactivos(pageSize: number, pageNumber: number): Observable<EmployeeTable> {
    let params = new HttpParams();
    params = params.append('size', pageSize);
    params = params.append('page', pageNumber);
    return this.httpCliente.get<EmployeeTable>(this.url + 'all/inactive', { headers: cabecera, params: params })
  }

  /**
   * crea un quimico
   * @param quimico 
   * @returns mensaje si fue exitoso o error
   */
  public registrar(quimico: QuimicoModel): Observable<any> {
    return this.httpCliente.post<any>(this.url + 'add', quimico)
  }

  /**
   * Actualiza los datos del quimico
   * @param id number
   * @param quimico
   * @returns Respuesta
   */
  public actualizar(id: number, quimico: QuimicoModel): Observable<any> {
    return this.httpCliente.put<any>(this.url + `update/${id}`, quimico);
  }

  /**
   * Permite añadir inventario a un quimico existente en la base de datos. 
   * Solo necesita el numero a añadir y el nombre del quimico. Si el quimico no existe, lanzará un error.
   * Añade inventario a un quimico
   * @param id number
   * @param quimico
   * @returns Respuesta
   */
  public añadirInventario(id: number, quimico: QuimicoModel): Observable<any> {
    return this.httpCliente.put<any>(this.url + `inventory/${id}`, quimico);
  }

  /**
   * 
   * @param id id del quimico
   * @returns Response
   */
  public activar(id: number): Observable<any> {
    return this.httpCliente.put<any>(this.url + `activate/${id}`, {});
  }

  /**
    * Cambia el estado del quimico de activo a inactivo
    * @param id del quimico
    * @returns
    */
  public eliminar(id: number): Observable<any> {
    return this.httpCliente.delete<any>(this.url + `delete/${id}`, { headers: cabecera })
  }
}
