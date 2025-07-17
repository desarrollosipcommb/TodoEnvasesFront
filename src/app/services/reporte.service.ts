import { HttpHeaders, HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

let cabecera = new HttpHeaders();
cabecera = cabecera.append('Content-Type', 'application/json');


@Injectable({
  providedIn: 'root'
})
export class ReporteService {
  private url = environment.baseUrl + 'reporte/';

  constructor(private httpCliente: HttpClient) { }


  public filterProgramaciones(pageNumber: number, pageSize: number, fechaInicio: string, fechaFin: string,
    empleado: string, cliente: number): Observable<any> {
    let params = new HttpParams();


    params = params.set('page', pageNumber.toString());

    params = params.set('size', pageSize.toString());


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

    return this.httpCliente.get(`${this.url}listar`, { params });
  }

  public getImage(imageName: number): Observable<Blob> {
    return this.httpCliente.get(this.url + 'images/' + imageName, { responseType: 'blob' });
  }

  public downloadFileExcel(fechaInicio: string, fechaFin: string,
    empleado: string, cliente: number): Observable<Blob> {
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

    return this.httpCliente.get(this.url + 'exportar', { responseType: 'blob', headers: cabecera, params: params });
  }

  reporteHoras(pageNumber: number, pageSize: number, fechaInicio: string, fechaFin: string,
    empleadoCedula: any, area: any): Observable<any> {
    let params = new HttpParams();
    params = params.append('page', pageNumber);
    params = params.append('size', pageSize);

    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);
    if (empleadoCedula) params = params.set('empleado', empleadoCedula);
    if (area) params = params.set('area', area.toString());

    return this.httpCliente.get(`${this.url}horario`, { params });
  }

  public downloadCsv(fechaInicio: string, fechaFin: string, idUsuario: number,
    empleadoCedula: any, area: any): Observable<Blob> {
    let params = new HttpParams();

    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);
    if (idUsuario) params = params.set('idUsuario', idUsuario);
    if (empleadoCedula) params = params.set('empleado', empleadoCedula);
    if (area) params = params.set('area', area.toString());

    return this.httpCliente.get(`${this.url}control-horas/exportar`, { responseType: 'blob', headers: cabecera, params: params });
  }

}
