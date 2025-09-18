import { Injectable } from '@angular/core';
import { ExtractoModel } from '../models/extracto-model';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

export interface EmployeeTable {
  content: ExtractoModel[]
  number: number;
  totalElements: number;
  totalPages: number;
}


let cabecera = new HttpHeaders();

@Injectable({
  providedIn: 'root'
})
export class ExtractosService {
  url = environment.baseUrl + 'extractos/';

  constructor(private httpCliente: HttpClient) { }

  public listarPagination(pageSize: number,pageNumber: number , name: string): Observable<EmployeeTable> {
    let params = new HttpParams();
    params = params.append('page', pageNumber);
    params = params.append('size', pageSize);

    if(name == null){ name = '';}

    params = params.append('name', name);
    return this.httpCliente.get<EmployeeTable>(this.url + 'like-name', { headers: cabecera, params: params })
  }

  public eliminarExtracto(extracto: ExtractoModel): Observable<any> {
    return this.httpCliente.put(this.url + 'delete', extracto, { headers: cabecera });
  }

  public activar(extracto: ExtractoModel): Observable<any> {
    return this.httpCliente.put(this.url + 'activate', extracto, { headers: cabecera });
  }

  public registrar(extracto: ExtractoModel): Observable<any> {
    return this.httpCliente.post(this.url + 'add', extracto, { headers: cabecera });
  }

  public actualizar(extracto: ExtractoModel): Observable<any> {
    return this.httpCliente.put(this.url + 'update', extracto, { headers: cabecera });
  }

}
