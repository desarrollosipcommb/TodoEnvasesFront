import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
  public subirArchivo(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    // No se necesita Content-Type, Angular lo pone automáticamente para FormData
    return this.httpCliente.post<any>(this.url+'upload-excel', formData);
  }
}
