import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EmpleadoModel } from '../models/empleado-model';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

export interface EmployeeTable {
  content: EmpleadoModel[];
  number: number;
  totalElements: number;
  totalPages: number;
}

let cabecera = new HttpHeaders();
//cabecera = cabecera.append('Content-Type', 'application/json');

@Injectable({
  providedIn: 'root'
})
export class EmpleadoService {

  url = environment.baseUrl + 'users/';

  constructor(private httpCliente: HttpClient) { }

  /**
   * Utiliza el servicio para listar a empleados que no tengan
   * una programación asignada en un rango de fechas
   * @param idCliente
   * @param fechaInicio
   * @param fechaFin
   * @param keyword
   * @returns
   */
  public listarEmpleadosSinProgramacion(
    fechaInicio: string,
    fechaFin: string,
    empleado: string): Observable<any> {
    let params = new HttpParams();

    if (fechaInicio) {
      params = params.set('fechaInicio', fechaInicio);
    }
    if (fechaFin) {
      params = params.set('fechaFin', fechaFin);
    }
    params = params.set('empleado', empleado);
    return this.httpCliente.get<any>(this.url + `listar/libres`, { headers: cabecera, params: params })
  }

  /**
   * Retorna los empleados que tengan estado ACTIVO
   * @returns
   */
  public listarActivos(): Observable<any> {
    return this.httpCliente.get<any>(this.url + 'listar/activos', { headers: cabecera })
  }

  /**
  * Crear un empleado
  * @param empleado
  * @returns el empleado creado si fue exitoso
  */
  public registrar(empleado: EmpleadoModel): Observable<any> {
    return this.httpCliente.post<any>(this.url + 'crear', empleado, { headers: cabecera })
  }

  /**
   * actualizar empleado
   * @param id empleado
   * @param empleado
   * @returns
   */
  public actualizar(id: number, empleado: EmpleadoModel): Observable<any> {
    return this.httpCliente.put<any>(this.url + `actualizar/${id}`, empleado, { headers: cabecera })
  }

  /**
   * Cambia el estado de un empleado de activo a inactivo
   *
   * @param id del empleado a eliminar
   * @param idUsuario  del usuario que esta eliminao
   * @returns
   */
  public eliminar(id: number): Observable<any> {
    return this.httpCliente.delete<any>(this.url + `delete/${id}`, { headers: cabecera })
  }



  /**
  * lIsta los empleados registrado
  * @returns Usurios[] lista de empleados
  */
  public listarPagination(pageNumber: number, pageSize: number, empleado: string): Observable<EmployeeTable> {
    let params = new HttpParams();
    params = params.append('page', pageNumber);
    params = params.append('size', pageSize);

    if (empleado != null) { params = params.append('empleado', empleado); }


    return this.httpCliente.get<EmployeeTable>(this.url + 'all', { headers: cabecera, params: params })
  }

  /**
 * Cambia el estado de eliminado a activo
 * @param id del area
 * @param idUsuario id del usurio que realiza la operacion
 * @returns
 */
  public activar(id: number): Observable<any> {
    return this.httpCliente.put<any>(this.url + `activar/${id}`, {});
  }

  buscarEmpleados(keyword: string): Observable<any> {
    return this.httpCliente.get<any>(`${this.url}buscar?keyword=${keyword}`);
  }

}
