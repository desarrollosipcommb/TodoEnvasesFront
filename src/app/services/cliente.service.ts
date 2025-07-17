import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';




let cabecera = new HttpHeaders();
cabecera = cabecera.append('Content-Type', 'application/json');


@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  url = environment.baseUrl + 'cliente/';

  constructor(private httpCliente: HttpClient) { }


  public mostrarCoordenadas(): Observable<any> {
    return this.httpCliente.get<any>(this.url + 'coordenadas', { headers: cabecera })
  }


  /**
   * Actualiza solamente la latitud y longitud del cliente
   * @returns 
   */
  public actualizarUbicacion(coordenadas: any): Observable<any> {
    return this.httpCliente.put<any>(this.url + `update/ubicacion`, coordenadas);
  }
}
