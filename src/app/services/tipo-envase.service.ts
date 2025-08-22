import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TipoEnvaseModel } from '../models/tipo-envase-model';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';



export interface EmployeeTable {
  content: TipoEnvaseModel[];
  number: number;
  totalElements: number;
  totalPages: number;

}

let cabecera = new HttpHeaders();
cabecera = cabecera.append('Content-Type', 'application/json');


@Injectable({
  providedIn: 'root'
})
export class TipoEnvaseService {
  url = environment.baseUrl + 'jar-types/';

  constructor(private httpCliente: HttpClient) { }

  /**
    * Lista los tipoEnvase registradas
    * @returns TipoEnvases[] lista de tipoEnvase
    */
  public listarPagination(pageSize: number, pageNumber: number, nombre: string): Observable<EmployeeTable> {
    let params = new HttpParams();
    params = params.append('size', pageSize);
    params = params.append('page', pageNumber);
      params = params.append('name', nombre);
      
    return this.httpCliente.get<EmployeeTable>(this.url + 'like-name', { headers: cabecera, params: params })
  }

  public listarActivos(): Observable<any> {
    return this.httpCliente.get<any>(this.url + 'listar', { headers: cabecera })
  }

  /**
   * crea un tipoEnvase
   * @param tipoEnvase 
   * @returns mensaje si fue exitoso o error
   */
  public registrar(tipoEnvase: TipoEnvaseModel): Observable<any> {
    return this.httpCliente.post<any>(this.url + 'add', tipoEnvase)
  }

  /**
   * Actualiza los datos del tipoEnvase
   * @param id number
   * @param tipoEnvase
   * @returns Respuesta
   */
  public actualizar(tipoEnvase: TipoEnvaseModel): Observable<any> {
    return this.httpCliente.put<any>(this.url + `update`, tipoEnvase);
  }

  /**
   * 
   * @param id id del tipoEnvase
   * @returns Response
   */
  public activar(id: number): Observable<any> {
    return this.httpCliente.put<any>(this.url + `activate/${id}`, {});
  }

  /**
    * Cambia el estado del tipoEnvase de activo a inactivo
    * @param id del tipoEnvase
    * @returns
    */
  public eliminar(id: number): Observable<any> {
    return this.httpCliente.delete<any>(this.url + `delete/${id}`, { headers: cabecera })
  }
}
