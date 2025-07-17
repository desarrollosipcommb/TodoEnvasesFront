import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { UsuarioModel } from '../models/usuario-model';
import { Observable } from 'rxjs';

export interface EmployeeTable {
  data: UsuarioModel[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}
const cabecera = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  url = environment.baseUrl + 'auth/';
  constructor(private httpCliente: HttpClient) { }

  /**
    * Lista los usuarios registrado
    * @returns Usuarios[] lista de usuarios
    */
  public listarPagination(pageNumber: number, pageSize: number, usuario: string): Observable<EmployeeTable> {
    let params = new HttpParams();
    params = params.append('page', pageNumber);
    params = params.append('size', pageSize);

    if (usuario != null) { params = params.append('nombreUsuario', usuario); }

    return this.httpCliente.get<EmployeeTable>(this.url + 'listar', cabecera)
  }

  /**
   * Crear un usuario
   * @param usuario
   * @returns el usuario creado si fue exitoso
   */
  public registrar(usuario: UsuarioModel | undefined): Observable<any> {
    return this.httpCliente.post<any>(this.url + 'crear', usuario, cabecera)
  }

  /**
 * actualizar usuario
 * @param id usuario
 * @param usuario
 * @returns
 */
  public actualizar(id: any, usuario: UsuarioModel | undefined): Observable<any> {
    return this.httpCliente.put<any>(this.url + `update/${id}`, usuario, cabecera)
  }

  /**
 * Cambia el estado de un usuario de activo a inactivo
 * @param id usuario
 * @returns
 */
  public eliminar(id: number): Observable<any> {
    return this.httpCliente.delete<any>(this.url + `delete/${id}`, cabecera)
  }

}
