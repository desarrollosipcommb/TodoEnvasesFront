import { Injectable } from '@angular/core';
import { EnvaseModel } from '../models/envase-model';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

export interface EmployeeTable {
  data: EnvaseModel[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

let cabecera = new HttpHeaders();
//cabecera = cabecera.append('Content-Type', 'application/json');


@Injectable({
  providedIn: 'root'
})
export class EnvaseService {
url = environment.baseUrl + 'jars/';

  constructor(private httpCliente: HttpClient) { }

  /**
    * Lista los envases registradas
    * @returns Envases[] lista de envases
    */
  public listarPagination(pageSize: number, pageNumber: number, nombre: string): Observable<EmployeeTable> {
    let params = new HttpParams();
    let header = new HttpHeaders();
    params = params.append('size', pageSize);
    params = params.append('page', pageNumber);
    /*if (nombre != null)
      params = params.append('nombre', nombre);*/
    return this.httpCliente.get<EmployeeTable>(this.url + 'all', { headers: cabecera, params: params })
  }

  public listarActivos(): Observable<any> {
    return this.httpCliente.get<any>(this.url + 'all/active', { headers: cabecera })
  }

  /**
   * crea un envase
   * @param envase 
   * @returns mensaje si fue exitoso o error
   */
  public registrar(envase: EnvaseModel): Observable<any> {
    return this.httpCliente.post<any>(this.url + 'add', envase)
  }

  /**
   * Actualiza los datos del envase
   * @param id number
   * @param envase
   * @returns Respuesta
   */
  public actualizar(id: number, envase: EnvaseModel): Observable<any> {
    return this.httpCliente.put<any>(this.url + `update/${id}`, envase);
  }

  /**
   * 
   * @param id id del envase
   * @returns Response
   */
  public activar(id: number): Observable<any> {
    return this.httpCliente.put<any>(this.url + `activate/${id}`, {});
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
