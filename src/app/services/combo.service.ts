import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ComboModel } from '../models/combo-model';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';


export interface EmployeeTable {
  data: ComboModel[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

let cabecera = new HttpHeaders();
cabecera = cabecera.append('Content-Type', 'application/json');


@Injectable({
  providedIn: 'root'
})
export class ComboService {
  url = environment.baseUrl + 'combos/';

  constructor(private httpCliente: HttpClient) { }

  /**
    * Lista los combo registradas
    * @returns combos[] lista de combo
    */
  public listarPagination(pageSize: number, pageNumber: number, nombre: string): Observable<EmployeeTable> {
    let params = new HttpParams();
    params = params.append('size', pageSize);
    params = params.append('page', pageNumber);
    return this.httpCliente.get<EmployeeTable>(this.url + 'all', { headers: cabecera, params: params })
  }


  /**
* Lista los combo registrados por nombre
* @returns combos[] lista de combo
*/
  public listarLikeName(pageSize: number, pageNumber: number, nombre: string): Observable<EmployeeTable> {
    let params = new HttpParams();
    params = params.append('size', pageSize);
    params = params.append('page', pageNumber);
    if (nombre != null)
      params = params.append('comboName', nombre);
    return this.httpCliente.get<EmployeeTable>(this.url + 'like-name', { headers: cabecera, params: params })
  }

  /**
  * Lista los combo registrados por nombre
  * @returns combos[] lista de combo
  */
  public listarByName(nombre: string): Observable<EmployeeTable> {
    let params = new HttpParams();
    if (nombre != null)
      params = params.append('comboName', nombre);
    return this.httpCliente.get<EmployeeTable>(this.url + 'by-name', { headers: cabecera, params: params })
  }

  /**
    * Lista los combos activos
    * @returns combos[] lista de combo
    */
  public listarActivos(pageSize: number, pageNumber: number, nombre: string): Observable<EmployeeTable> {
    let params = new HttpParams();
    params = params.append('size', pageSize);
    params = params.append('page', pageNumber);
    return this.httpCliente.get<EmployeeTable>(this.url + 'active', { headers: cabecera, params: params })
  }

  /**
    * Lista los combos inactivos
    * @returns combos[] lista de combo
    */
  public listarInactivos(pageSize: number, pageNumber: number, nombre: string): Observable<EmployeeTable> {
    let params = new HttpParams();
    params = params.append('size', pageSize);
    params = params.append('page', pageNumber);
    return this.httpCliente.get<EmployeeTable>(this.url + 'inactive', { headers: cabecera, params: params })
  }

  /**
   * crea un combo
   * @param combo 
   * @returns mensaje si fue exitoso o error
   */
  public registrar(combo: ComboModel): Observable<any> {
    return this.httpCliente.post<any>(this.url + 'add', combo)
  }

  /**
   * Actualiza los datos del combo
   * @param id number
   * @param combo
   * @returns Respuesta
   */
  public actualizar(combo: ComboModel): Observable<any> {
    return this.httpCliente.put<any>(this.url + `update`, combo);
  }

  /**
   * 
   * @param id id del combo
   * @returns Response
   */
  public activar(combo: ComboModel): Observable<any> {
    return this.httpCliente.put<any>(this.url + `active`, combo);
  }

  /**
    * Cambia el estado del combo de activo a inactivo
    * @param id del combo
    * @returns
    */
  public eliminar(combo: ComboModel): Observable<any> {
    return this.httpCliente.put<any>(this.url + `deactivate`, combo)
  }
}
