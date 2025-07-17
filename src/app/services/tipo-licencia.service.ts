import { Injectable } from '@angular/core';
import { TipoLicenciaModel } from '../models/tipo-licencia-model';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

export interface EmployeeTable {
  data: TipoLicenciaModel[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

let cabecera = new HttpHeaders();
cabecera = cabecera.append('Content-Type', 'application/json');

@Injectable({
  providedIn: 'root'
})
export class TipoLicenciaService {
  url = environment.baseUrl + 'tipolicencia/';

  constructor(private httpCliente: HttpClient) { }

  /**
    * lIsta los cliente registrado
    * @returns Clientes[] lista de clientes
    */
  public listarPagination(pageSize: number, pageNumber: number, nombre: string): Observable<EmployeeTable> {
    let params = new HttpParams();
    params = params.append('size', pageSize);
    params = params.append('page', pageNumber);
    if (nombre != null)
      params = params.append('nombre', nombre);
    return this.httpCliente.get<EmployeeTable>(this.url + 'listar', { headers: cabecera, params: params })
  }
  /**
   * Retorna las licencias que tengan estado ACTIVO
   * @returns 
   */
  public listarActivos(): Observable<any> {
    return this.httpCliente.get<any>(this.url + 'listar/activos', { headers: cabecera })
  }

  /**
   * Crear un cliente
   * @param cliente
   * @returns el cliente creado si fue exitoso
   */
  public registrar(licencia: TipoLicenciaModel): Observable<any> {
    return this.httpCliente.post<any>(this.url + 'crear', licencia)
  }

  /**
   * Actualiza los datos del cliente
   * @param id number
   * @param cliente El cliente
   * @returns Respuesta
   */
  public actualizar(id: number, licencia: TipoLicenciaModel): Observable<any> {
    return this.httpCliente.put<any>(this.url + `update/${id}`, licencia);
  }

  /**
    * Cambia el estado del cliente de activo a inactivo
    * @param id del cliente
    * @returns
    */
  public eliminar(id: number): Observable<any> {
    return this.httpCliente.delete<any>(this.url + `delete/${id}`, { headers: cabecera })
  }

  /**
   * Actualiza los datos del cliente
   * @param id number
   * @param cliente El cliente
   * @returns Respuesta
   */
  public activar(id: number): Observable<any> {
    return this.httpCliente.put<any>(this.url + `activar/${id}`, {});
  }
}
