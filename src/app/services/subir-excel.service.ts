import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SubirExcelService {
  url = environment.baseUrl + 'files/'; // Ajusta el endpoint según tu backend

  constructor(private httpCliente: HttpClient) { }

  /**
   * Sube un archivo Excel al backend
   * @param file Archivo Excel
   * @returns Observable con la respuesta del backend
   */
  public agregarInventario(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.httpCliente.post<any>(this.url + 'upload-excel', formData);
  }


  /**
   * Sube un archivo Excel al backend que actualiza solo las cantidades de los items ya existentes
   * @param file Archivo Excel
   * @returns Observable con la respuesta del backend
   */
  public actualizarInventario(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.httpCliente.post<any>(this.url + 'update-inventory-excel', formData);
  }
}
