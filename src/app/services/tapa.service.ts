import { Injectable } from '@angular/core';
import { TapaModel } from '../models/tapa-model';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

export interface EmployeeTable {
  content: TapaModel[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

let cabecera = new HttpHeaders();
cabecera = cabecera.append('Content-Type', 'application/json');

@Injectable({
  providedIn: 'root'
})
export class TapaService {

  url = environment.baseUrl + 'caps/';

  constructor(private httpCliente: HttpClient) { }

  /**
  * Lista las tapas registradas
  * @returns Tapas[] lista de tapas
  */
  public listarPagination(pageSize: number, pageNumber: number): Observable<EmployeeTable> {
    let params = new HttpParams();
    params = params.append('size', pageSize);
    params = params.append('page', pageNumber);
    return this.httpCliente.get<EmployeeTable>(this.url + 'all', { headers: cabecera, params: params })
  }


  /**
  * Lista las tapas con estado activo
  * @returns Tapas[] lista de tapas
  */
  public listarActivos(pageSize: number, pageNumber: number): Observable<EmployeeTable> {
    let params = new HttpParams();
    params = params.append('size', pageSize);
    params = params.append('page', pageNumber);
    return this.httpCliente.get<EmployeeTable>(this.url + 'all/active', { headers: cabecera, params: params })
  }

  /**
* Lista los tapas con estado inactivo
* @returns Tapas[] lista de tapas
*/
  public listarInactivos(pageSize: number, pageNumber: number): Observable<EmployeeTable> {
    let params = new HttpParams();
    params = params.append('size', pageSize);
    params = params.append('page', pageNumber);
    return this.httpCliente.get<EmployeeTable>(this.url + 'all/inactive', { headers: cabecera, params: params })
  }

  /**
   * Lista las tapas registrados por nombre
   * @returns tapas[] lista de tapas
   */
  public listarByName(pageSize: number, pageNumber: number, nombre: string): Observable<EmployeeTable> {
    let params = new HttpParams();
    params = params.append('size', pageSize);
    params = params.append('page', pageNumber);
    if (nombre != null)
      params = params.append('name', nombre);
    return this.httpCliente.get<EmployeeTable>(this.url + 'by-name', { headers: cabecera, params: params })
  }

  /**
   * Lista las tapas registrados por nombre
   * @returns tapas[] lista de tapas
   */
  public listarByDiametro(pageSize: number, pageNumber: number, diametro: string): Observable<EmployeeTable> {
    let params = new HttpParams();
    params = params.append('size', pageSize);
    params = params.append('page', pageNumber);
    if (diametro != null)
      params = params.append('diameter', diametro);
    return this.httpCliente.get<EmployeeTable>(this.url + 'by-diameter', { headers: cabecera, params: params })
  }

  /**
   * Lista las tapas registrados por color
   * @returns tapas[] lista de tapas
   */
  public listarByColor(pageSize: number, pageNumber: number, color: string): Observable<EmployeeTable> {
    let params = new HttpParams();
    params = params.append('size', pageSize);
    params = params.append('page', pageNumber);
    if (color != null)
      params = params.append('color', color);
    return this.httpCliente.get<EmployeeTable>(this.url + 'by-color', { headers: cabecera, params: params })
  }

  /**
   * crea una tapa
   * @param tapa 
   * @returns mensaje si fue exitoso o error
   */
  public registrar(tapa: TapaModel): Observable<any> {
    return this.httpCliente.post<any>(this.url + 'add', tapa)
  }

  /**
   * Actualiza los datos de la tapa
   * @param id number
   * @param tapa
   * @returns Respuesta
   */
  public actualizar(id: number, tapa: TapaModel): Observable<any> {
    return this.httpCliente.put<any>(this.url + `update`, tapa);
  }

  /**
   * Permite añadir inventario a una tapa existente en la base de datos. 
   * Solo necesita el numero a añadir y el nombre de la tapa. Si la tapa no existe, lanzará un error.
   * Añade inventario a un tapa
   * @param id number
   * @param tapa
   * @returns Respuesta
   */
  public añadirInventario(tapa: TapaModel): Observable<any> {
    return this.httpCliente.put<any>(this.url + `inventory`, tapa);
  }

  /**
   * 
   * @param tapa model de la tapa
   * @returns Response
   */
  public activar(tapa: TapaModel): Observable<any> {
    return this.httpCliente.put<any>(this.url + `activate`, tapa);
  }

  /**
    * Cambia el estado de la tapa de activo a inactivo
    * @returns
    */
  public eliminar(tapa: TapaModel): Observable<any> {
    return this.httpCliente.put<any>(this.url + `delete`, tapa)
  }
}
