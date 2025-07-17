import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ProgramacionModel } from '../models/programacion-model';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

let cabecera = new HttpHeaders();
cabecera = cabecera.append('Content-Type', 'application/json');

export interface EmployeeTable {
  data: ProgramacionModel[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProgramacionService {
  private url = environment.baseUrl + 'programacion/';

  constructor(private httpCliente: HttpClient) { }

  /**
   *
   * Lista las programaciones por paginas 
   * @param pageNumber 
   * @param pageSize 
   * @param fechaInicio 
   * @param fechaFin 
   * @param empleado 
   * @param area 
   * @returns 
   */
  filterProgramaciones(pageNumber: number, pageSize: number, fechaInicio: string, fechaFin: string,
    empleado: string, area: number): Observable<any> {
    let params = new HttpParams();

    if (pageNumber) {
      params = params.set('page', pageNumber.toString());
    }
    if (pageSize) {
      params = params.set('size', pageSize.toString());
    }

    if (fechaInicio) {
      params = params.set('fechaInicio', fechaInicio);
    }
    if (fechaFin) {
      params = params.set('fechaFin', fechaFin);
    }
    if (empleado) {
      params = params.set('empleado', empleado);
    }
    if (area) {
      params = params.set('area', area.toString());
    }

    return this.httpCliente.get(`${this.url}listar/empleado`, { params });
  }

  public listarProgramaciones( fechaInicio: string, fechaFin: string,
    empleado: string, cliente: number): Observable<ProgramacionModel[]> {
    let params = new HttpParams();


    if (fechaInicio) {
      params = params.set('fechaInicio', fechaInicio);
    }
    if (fechaFin) {
      params = params.set('fechaFin', fechaFin);
    }
    if (empleado) {
      params = params.set('empleado', empleado);
    }
    if (cliente) {
      params = params.set('cliente', cliente.toString());
    }

    return this.httpCliente.get<ProgramacionModel[]>(`${this.url}listar`, { params });
  }


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
    idCliente: string,
    fechaInicio: string,
    fechaFin: string,
    keyword: string): Observable<any> {
    let params = new HttpParams();

    if (fechaInicio) {
      params = params.set('fechaInicio', fechaInicio);
    }
    if (fechaFin) {
      params = params.set('fechaFin', fechaFin);
    }

    params = params.set('idCliente', idCliente);
    params = params.set('keyword', keyword);
    return this.httpCliente.get<any>(this.url + `listar/empleado`, { headers: cabecera, params: params })
  }

  /**
   * Asigna la programacion al usuario
   * @param Programacion progrmacion
   * @return 
   */
  public crear(programacion: ProgramacionModel): Observable<any> {
    return this.httpCliente.post(this.url + `crear`, programacion);
  }

  /**
   * Asigna las programaciones a los empleados
   * @param Programacion progrmacion
   * @return 
   */
  public programarVarios(programacion: ProgramacionModel): Observable<any> {
    return this.httpCliente.post(this.url + `crear/varios`, programacion);
  }

  /**
   * Actualiza la programcacion de la fecha  actual 
   * @param Id id string el idetificador de la programacion
   * @return programacion actializada
   */
  public actualizarProgramacion(id: number, programacion: ProgramacionModel): Observable<any> {
    return this.httpCliente.put(this.url + `update/${id}`, programacion);
  }

  public liberar(id: any): Observable<any> {
    return this.httpCliente.delete(this.url + `liberar/${id}/`);
  }

  public detallePorIdentificacion(identificacion: string): Observable<any> {
    return this.httpCliente.get(this.url + `empleado/${identificacion}`);
  }

  /**
   * Detalle de la programcion 
   * @param Id id string el idetificador de la programacion
   * @return programacion 
   */

  public detalle(id: any): Observable<any> {
    return this.httpCliente.get(this.url + `empleado/${id}/detalle`);
  }

}
