import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AlertaService {
  icono: any;
  constructor() { }
  /**
   * Alerta 
   * @param titulo 
   * @param texto 
   * @param time tiempo que se demora la alerta
   * @param tipo number cada icono 1=Error, 2=Success, 3=Info, 4=Warning, 5=Question
   * @param btnConfirmar boolean 
   * @param btnCancelar boolean
   */

  public alerta(titulo: string, texto: string, time: number, tipo: number, btnConfirmar: boolean, btnCancelar: boolean) {
    switch (tipo) {
      case 1: {
        this.icono = 'error';
        break;
      }
      case 2: {
        this.icono = 'success';
        break;
      }
      case 3: {
        this.icono = 'info';
        break;
      }
      case 4: {
        this.icono = 'warning';
        break;
      }
      case 4: {
        this.icono = 'question';
        break;
      }
      default: {
        break;
      }
    }

    Swal.fire({
      title: titulo,
      text: texto,
      icon: this.icono,
      timer: time,
      showCancelButton: btnCancelar,      
      showConfirmButton: btnConfirmar,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
    })
  }

  /**
   * Alerta 
   * @param titulo 
   * @param texto 
   *   */

   public error(titulo: string, texto: string) {
    Swal.fire({
      customClass: {
        container: 'my-swal'
      },
      title: titulo,
      text: texto,
      icon: 'error',
      showCancelButton: false,      
      showConfirmButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
    })
  }

  
  /**
   * Alerta 
   * @param titulo 
   * @param texto 
   *   */

   public success(titulo: string, texto: string) {
    Swal.fire({
      title: titulo,
      text: texto,
      icon: 'success',
      timer: 3000,
      showCancelButton: false,      
      showConfirmButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
    })
  }

    /**
   * Alerta 
   * @param titulo 
   * @param texto 
   *   */

    public info(titulo: string, texto: string) {
      Swal.fire({
        title: titulo,
        text: texto,
        icon: 'info',
        timer: 5000,
        showCancelButton: false,      
        showConfirmButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar'
      })
    }
}
