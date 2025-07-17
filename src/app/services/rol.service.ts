import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

let cabecera = new HttpHeaders();
cabecera = cabecera.append('Content-Type', 'application/json');

@Injectable({
  providedIn: 'root'
})
export class RolService {
  private url = environment.baseUrl + 'roles/';

  constructor(private httpCliente: HttpClient) { }

/**
 * Lista todos los roles activos
 * @returns 
 */
  public listarActivos(): Observable<any> {
    return this.httpCliente.get(`${this.url}listar/activos`, { headers: cabecera });
  
  }
}
