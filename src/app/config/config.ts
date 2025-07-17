import { Injectable, OnInit } from "@angular/core";
import { TokenService } from "../services/token/token.service";

@Injectable({
    providedIn: 'root'
  })
  

export class Config {
    displayName: any;
    nombre: string;
    apellido: string;
    roles: string[] = [];
    id_usuario: number;
    islogged: boolean = false;
    user: any;

    version = 'V2.0.1';
    anio = '2025';

    constructor(public tokenService: TokenService) { }

    setUser(user: any) {
      this.user = user;
    }
  
    getUser() {
      return this.user;
    }
  
    setIsLogged(islogged: boolean): void {
      this.islogged = islogged;
    }
  
    getIsLogged(): boolean {
      return this.islogged;
    }
  
    setDisplayName(displayName: any): void {
      this.displayName = displayName;
    }
  
    getDisplayName(): any {
      this.displayName = this.tokenService.getUserName()
      return this.displayName;
    }
  
    setRoles(roles: string[]): void {
      this.roles = roles;
    }
  
    getRoles(): string[] {
      return this.roles;
    }
  
    setId(id: number) {
      this.id_usuario = id;
    }
  
    getId(): number {
      return this.id_usuario
    }
  
    /**
     * Obtiene la fecha actual
     * @returns Fecha de formato dd/mm/yyyy
     */
    getFechaActual(): string {
      const fecha = new Date();
      const mes = fecha.getMonth() + 1;
      const mesString = mes < 10 ? '0' + mes : mes;
      const dia = fecha.getDate() < 10 ? '0' + fecha.getDate() : fecha.getDate();
      return dia + '/' + mesString + '/' + fecha.getFullYear();
    }
  
    getFecha(): string {
      const fecha = new Date();
      const mes = fecha.getMonth() + 1;
      const mesString = mes < 10 ? '0' + mes : mes;
      const dia = fecha.getDate() < 10 ? '0' + fecha.getDate() : fecha.getDate();
      return fecha.getFullYear() + '-' + mesString + '-' + dia;
    }
  
    /**
     * Obtiene el string de la fecha y lo convierte a formato yyyy-mm-dd
     * @param fecha string 
     * @returns Fecha de formato yyyy-mm-dd
     */
    convertirFecha(fecha: Date): string {
      //formato de fecha 
      const newFecha = new Date(fecha);
      const mes = newFecha.getMonth() + 1;
      const mesString = mes < 10 ? '0' + mes : mes;
      const dia = newFecha.getDate() < 10 ? '0' + newFecha.getDate() : newFecha.getDate() - 1;
      return newFecha.getFullYear() + '-' + mesString + '-' + dia;
    }
}
