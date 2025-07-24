import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LoginModel } from '../models/login-model';
import { environment } from 'src/environments/environment';
import { JwtModel } from '../models/jwt-model';

export interface EmployeeTable {
  data: LoginModel[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

let cabecera = new HttpHeaders();
cabecera = cabecera.append('Content-Type', 'application/json');

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private url = environment.baseUrl + 'auth/'
  constructor(private httpCliente: HttpClient) { }
  /**
   * loguearse
   * @param login Login
   * @returns JwtModel
   */
  public login(login: LoginModel): Observable<JwtModel> {
    return this.httpCliente.post<JwtModel>(this.url + 'login', login, { headers: cabecera })
  }
}
