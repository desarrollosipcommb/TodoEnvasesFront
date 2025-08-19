import { Injectable } from '@angular/core';
import { VentaModel } from '../models/venta-model';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

export interface EmployeeTable {
  data: VentaModel[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

let cabecera = new HttpHeaders();
cabecera = cabecera.append('Content-Type', 'application/json');

@Injectable({
  providedIn: 'root'
})
export class VentaService {
  url = environment.baseUrl + 'sale/';

  constructor(private httpCliente: HttpClient) { }

  /**
  * Lista las ventas registradas
  * @returns Ventas[] lista de ventas
  */
  public listarPagination(pageSize: number, pageNumber: number): Observable<EmployeeTable> {
    let params = new HttpParams();
    params = params.append('size', pageSize);
    params = params.append('page', pageNumber);
    return this.httpCliente.get<EmployeeTable>(this.url + 'all', { headers: cabecera, params: params })
  }

  /**
  * Lista las ventas por filtro email
  * @returns Ventas[] lista de ventas
  */
  public listarByEmail(pageSize: number, pageNumber: number, email: string): Observable<EmployeeTable> {
    let params = new HttpParams();
    params = params.append('size', pageSize);
    params = params.append('page', pageNumber);
    if (email != null)
      params = params.append('email', email);
    return this.httpCliente.get<EmployeeTable>(this.url + 'by-email', { headers: cabecera, params: params })
  }

  /**
* Lista los tapas con filtro username
* @returns Tapas[] lista de tapas
*/
  public listarByUsername(pageSize: number, pageNumber: number, username: string): Observable<EmployeeTable> {
    let params = new HttpParams();
    params = params.append('size', pageSize);
    params = params.append('page', pageNumber);
    if (username != null)
      params = params.append('username', username);
    return this.httpCliente.get<EmployeeTable>(this.url + 'by-username', { headers: cabecera, params: params })
  }

  /**
   * Planifica una venta 
   * @param venta 
   * @returns mensaje si fue exitoso o error
   */
  public planificarVenta(venta: VentaModel): Observable<any> {
    return this.httpCliente.post<any>(this.url + 'plan', venta)
  }

  /**
   * registra una venta
   * @param venta 
   * @returns mensaje si fue exitoso o error
   */
  public registrarVenta(venta: VentaModel): Observable<any> {
    return this.httpCliente.post<any>(this.url + 'add', venta)
  }


}
