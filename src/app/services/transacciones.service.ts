import { Injectable } from '@angular/core';
import { TransactionModel } from '../models/transaction-model';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

let cabecera = new HttpHeaders();

export interface EmployeeTable {
  content: TransactionModel[]
  number: number;
  totalElements: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class TransaccionesService {

  url = environment.baseUrl + 'transactions/';
  constructor(private httpClient: HttpClient) { }

  listar(size: number, page: number, name: string, itemType: any, transactionType: any): Observable<any> {

    let params = new HttpParams()
      .set('size', size.toString())
      .set('page', page.toString());


    if(name == null){ name = '';}
    if (!itemType) { itemType = ''; }
    if (!transactionType) { transactionType = ''; }

    params = params.append('username', name);
    params = params.append('itemType', itemType);
    params = params.append('transactionType', transactionType);
    // El body es el username (string)
    return this.httpClient.get<EmployeeTable>(this.url + 'get/username', { headers: cabecera, params: params });
  }
}
