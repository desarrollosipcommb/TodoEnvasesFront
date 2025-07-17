import { HttpHeaders, HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MarcacionModel } from '../models/marcacion-model';

export interface EmployeeTable {
  data: MarcacionModel[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

let cabecera = new HttpHeaders();
cabecera = cabecera.append('Content-Type', 'application/json');

@Injectable({
  providedIn: 'root'
})
export class MarcacionService {
  private url = environment.baseUrl + 'marcacion/';
  private url2 = environment.baseUrl + 'reporte/';

  constructor(private httpCliente: HttpClient) { }



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
    

    return this.httpCliente.get(`${this.url}listar`, { params });
  }


  /**
   * Crea un nuevo hora laboral
   * @param horaLaboral HoraLaboral
   * @returns Respuesta
   */
  public nuevo(horaLaboral: any): Observable<any> {
    return this.httpCliente.post<any>(this.url + 'crear', horaLaboral)
  }

  /**
 * Crea un nuevo hora laboral
 * @param horaLaboral HoraLaboral
 * @returns Respuesta
 */
  public nuevoSinLactitudLongitud(horaLaboral: any): Observable<any> {
    return this.httpCliente.post<any>(this.url + 'crear/table', horaLaboral)
  }

  /**
   * Crea un nuevo hora laboral
   * @param horaLaboral HoraLaboral
   * @returns Respuesta
   */
  public nuevoManual(horaLaboral: any): Observable<any> {
    return this.httpCliente.post<any>(this.url + 'ingresomanual', horaLaboral)
  }

  /**
 * actualizar Hora laboral
 * @param id Hora laboral
 * @param MarcacionModel
 * @returns
 */
  public actualizar(id: number, model: MarcacionModel): Observable<any> {
    return this.httpCliente.put<any>(this.url + `actualizar/${id}`, model, { headers: cabecera })
  }
  
  /**
  * Cambia el estado de un del registro de activo a inactivo
  * @param id del registro
  * @returns
  */
  public eliminar(id: number): Observable<any> {
    return this.httpCliente.delete<any>(this.url + `delete/${id}`, { headers: cabecera })
  }

  getImage(imageName: string): Observable<Blob> {
    return this.httpCliente.get(this.url2 + 'images/' + imageName, { responseType: 'blob' });
  }
}