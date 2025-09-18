import { Injectable } from '@angular/core';
import { EnvaseModel } from '../models/envase-model';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

export interface EmployeeTable {
  content: EnvaseModel[]
   number: number;
   totalElements: number;
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
  public listarPagination(pageSize: number, pageNumber: number, nombre: string|null,diametro:string): Observable<EmployeeTable> {
    let params = new HttpParams();
    let header = new HttpHeaders();
    params = params.append('size', pageSize);
    params = params.append('page', pageNumber);
    if(nombre && nombre.length > 0){
      params = params.append('name', nombre);
    }
    if(diametro && diametro.length > 0){
      params = params.append('diameter', diametro);
    }

    return this.httpCliente.get<EmployeeTable>(this.url + 'by-name-diameter', { headers: cabecera, params: params })
  }

    public listarCompatibleByEnvase( nombre: string|null): Observable<EmployeeTable> {
    let params = new HttpParams();
    let header = new HttpHeaders();
    params = params.append('size', 5);
    params = params.append('page', 0);
    if(nombre && nombre.length > 0){
      params = params.append('jarName', nombre);
    }

    return this.httpCliente.get<EmployeeTable>(this.url + 'compatible-caps', { headers: cabecera, params: params })
  }

  public listarActivos(): Observable<any> {
    return this.httpCliente.get<any>(this.url + 'all/active', { headers: cabecera })
  }

   /**
     * Permite añadir inventario a un envase existente en la base de datos.
     * Solo necesita el numero a añadir y el nombre del envase. Si el envase no existe, lanzará un error.
     * Añade inventario a un envase
     * @param envase
     * @returns Respuesta
     */
    public añadirInventario(envase:EnvaseModel): Observable<any> {
      return this.httpCliente.put<any>(this.url + `inventory`, envase);
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
  public actualizar( envase: EnvaseModel): Observable<any> {
    return this.httpCliente.put<any>(this.url + `update`, envase);
  }

  /**
   *
   * @param id id del envase
   * @returns Response
   */
  public activar(nameEnvase:string): Observable<any> {
    return this.httpCliente.put<any>(this.url + `activate`,nameEnvase, {});
  }

  /**
    * Cambia el estado del area de activo a inactivo
    * @param id del area
    * @returns
    */
  public eliminar(nameEnvase:string): Observable<any> {
    return this.httpCliente.put<any>(this.url + `delete/`,nameEnvase, { headers: cabecera })
  }
}
