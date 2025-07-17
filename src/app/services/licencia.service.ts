import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { LicenciaModel } from '../models/licencia-model';
import { Observable } from 'rxjs';


export interface EmployeeTable {
  data: LicenciaModel[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

let cabecera = new HttpHeaders();
cabecera = cabecera.append('Content-Type', 'application/json');


@Injectable({
  providedIn: 'root'
})
export class LicenciaService {
  url = environment.baseUrl + 'licencia/';

  constructor(private httpCliente: HttpClient) { }


  /**
    * Lista las registradas licencias/permisos de los empleados 
    * @returns Licencias[] retorna una lista de licencias 
    */
  public listarPagination(pageSize: number, pageNumber: number,fechaInicio: string, fechaFin: string, nombre: string): Observable<EmployeeTable> {
    let params = new HttpParams();
    params = params.append('size', pageSize);
    params = params.append('page', pageNumber);
    if (nombre != null)
      params = params.append('empleado', nombre);


    if (fechaInicio != null)
      params = params.append('fechaInicio', fechaInicio);

    if (fechaFin != null)
      params = params.append('fechaFin', fechaFin);

    return this.httpCliente.get<EmployeeTable>(this.url + 'listar', { headers: cabecera, params: params })
  }

  /**
   * Genera una licencia a un empleado
   * @param Licencia
   * @returns un mensaje de éxito o error, depende del caso
   */
  public registrar(licencia: LicenciaModel): Observable<any> {
    return this.httpCliente.post<any>(this.url + 'crear', licencia)
  }

  /**
   * Actualiza una licencia
   * @param id number
   * @param licencia El modelo de la licencia
   * @returns Respuesta
   */
  public actualizar(id: number, licencia: LicenciaModel): Observable<any> {
    return this.httpCliente.put<any>(this.url + `update/${id}`, licencia);
  }

  /**
   * Determina que direccion utiliza, si aprueba o rechaza la novedad
   * @param id numero de novedad
   * @param accion puede tener dos opciones, aprobar o rechazar, 
   *               se le debe enviar un string con el nombre mencionado
   * @returns 
   */
  public gestionNovedad(id: number, accion: 'aprobar' | 'rechazar'): Observable<any> {
    return this.httpCliente.put<any>(this.url + `${accion}/${id}`, {});
  }
}
