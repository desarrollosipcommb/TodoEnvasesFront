import { Injectable } from '@angular/core';
import { QuimicoModel } from '../models/quimico-model';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

export interface EmployeeTable {
  content: QuimicoModel[];
  number: number;
  totalElements: number;
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
      params = params.append('searchName', nombre);
    return this.httpCliente.get<EmployeeTable>(this.url + 'byName', { headers: cabecera, params: params })
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
  public actualizar( quimico: QuimicoModel): Observable<any> {
    return this.httpCliente.put<any>(this.url + `update`, quimico);
  }

  /**
   * Permite añadir inventario a un quimico existente en la base de datos. 
   * Solo necesita el numero a añadir y el nombre del quimico. Si el quimico no existe, lanzará un error.
   * Añade inventario a un quimico
   * @param id number
   * @param quimico
   * @returns Respuesta
   */
  public añadirInventario(quimico: QuimicoModel): Observable<any> {
    return this.httpCliente.put<any>(this.url + `inventory`, quimico);
  }

  /**
   * 
   * @param id id del quimico
   * @returns Response
   */
  public activar(quimicoModel: QuimicoModel): Observable<any> {
    return this.httpCliente.put<any>(this.url + `activate`, quimicoModel, {});
  }

  /**
    * Cambia el estado del quimico de activo a inactivo
    * @param id del quimico
    * @returns
    */
  public eliminar(quimicoModel: QuimicoModel): Observable<any> {
    console.log("Enviando a backend: ", quimicoModel); // 👈 debug
    return this.httpCliente.put<any>(this.url + `delete`, quimicoModel);
  }
}
