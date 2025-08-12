import { Injectable } from '@angular/core';

const TOKEN_KEY = 'AuthToken';
const USERNAME_KEY = 'AuthUserName';
const AUTHORITIES_KEY = 'AutAuthorities';
const REFRESHTOKEN_KEY = 'auth-refreshtoken';
const ID_EMPLEADO = 'Id-empleado';
const iD_USUARIO = 'Id-usuario';
const ROL = 'Rol';
const PERMISSIONS = 'Permissions'


@Injectable({
  providedIn: 'root'
})
export class TokenService {
  roles: Array<string> = [];
  permisos: Array<string> = [];
  constructor() { }

  /**
  * Remueve el rol del localStorage y le asigna el nuevo rol
  * @param rol usuario
  */
  public setRol(rol: any): void {
    window.sessionStorage.removeItem(ROL);
    window.sessionStorage.setItem(ROL, rol);
  }

  /**
   * Obtiene el id usuario del localStorage
   * @returns string
   */
  public getRol(): any {
    return sessionStorage.getItem(ROL);
  }

  /**
   * Remueve el Id usuario del localStorage y le asigna el nuevo Id usuario
   * @param Id usuario
   */
  public setIdUsuario(id: string): void {
    window.sessionStorage.removeItem(iD_USUARIO);
    window.sessionStorage.setItem(iD_USUARIO, id);
  }

  /**
   * Obtiene el id usuario del localStorage
   * @returns string
   */
  public getIdUsuario(): any {
    return sessionStorage.getItem(iD_USUARIO);
  }
  /**
   * Remueve el el id del empleado logueado del localStorage y le asigna el nuevo 
   * @param token
   */
  public setIdEmpleado(id: string): void {
    window.sessionStorage.removeItem(ID_EMPLEADO);
    window.sessionStorage.setItem(ID_EMPLEADO, id);
  }

  /**
   * Obtiene el id del empleado logueado del localStorage
   * @returns string
   */
  public getIdEmpleado(): any {
    return sessionStorage.getItem(ID_EMPLEADO);
  }

  /**
   * Remueve el token del localStorage y le asigna el nuevo token
   * @param token
   */
  public setToken(token: string): void {
    window.sessionStorage.removeItem(TOKEN_KEY);
    window.sessionStorage.setItem(TOKEN_KEY, token);
  }

  /**
   * Obtiene el token del localStorage
   * @returns string
   */
  public getToken(): string | null {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  /**
   * Remueve el username del localStorage y le asigna el nuevo username
   * @param username
   */
  public setUserName(userName: string): void {
    window.sessionStorage.removeItem(USERNAME_KEY);
    window.sessionStorage.setItem(USERNAME_KEY, userName);
  }

  /**
   * Obtiene el username del localStorage
   * @returns string
   */
  public getUserName(): any {
    return sessionStorage.getItem(USERNAME_KEY);
  }

  /**
   * Remueve los autotities del localStorage y le asigna los nuevos autotities
   * @param autorities
   */
  public setAuthorities(authorities: string[]): void {
    window.sessionStorage.removeItem(AUTHORITIES_KEY);
    window.sessionStorage.setItem(AUTHORITIES_KEY, JSON.stringify(authorities));
  }

  /**
 * Remueve los autotities del localStorage y le asigna los nuevos autotities
 * @param autorities
 */
  public setPermissions(permisos: string[]): void {
    window.sessionStorage.removeItem(PERMISSIONS);
    window.sessionStorage.setItem(PERMISSIONS, JSON.stringify(permisos));
  }

  /**
 * Obtiene los PERMISSIONS del localStorage y se asigna a un la variable permisos[]
 * @returns permisos[]
 */
  public getPermissions(): string[] {
    this.permisos = [];
    if (sessionStorage.getItem(PERMISSIONS)) {
      JSON.parse(sessionStorage.getItem(PERMISSIONS) || '{}').forEach((authority: { authority: string; }) => {
        this.permisos.push(authority.authority);
      });
    }
    return this.permisos;
  }

  /**
   * Obtiene los autotities del localStorage y se asigna a un la variable roles[]
   * @returns roles[]
   */
  public getAuthorities(): string[] {
    this.roles = [];
    const a = sessionStorage.getItem(AUTHORITIES_KEY)
    if (sessionStorage.getItem(AUTHORITIES_KEY)) {
      JSON.parse(sessionStorage.getItem(AUTHORITIES_KEY) || '{}').forEach((authority: { authority: string; }) => {
        this.roles.push(authority.authority);
      });
    }
    return this.roles;
  }
  public getRefreshToken(): string | null {
    return window.sessionStorage.getItem(REFRESHTOKEN_KEY);
  }

  public saveRefreshToken(token: string): void {
    window.sessionStorage.removeItem(REFRESHTOKEN_KEY);
    window.sessionStorage.setItem(REFRESHTOKEN_KEY, token);
  }


  //valida que el permiso exista en authorities
  public isAccess(authority: string): boolean {
    if (this.getAuthorities().indexOf(authority) > -1) {
      return true;
    }
    return false;
  }

  /**
   * 
   * @param tipo CRUD (CREATE; READ; UPDATE, DELETE)
   * @param modulo nombre del modulo
   * @returns 
   */
  public isAccessV2(tipo: string, modulo: string): boolean {
    const authority: string = `${tipo.toUpperCase()}_${modulo.toUpperCase()}`;
    if (this.getAuthorities().indexOf(authority) > -1) {
      return true;
    }
    return false;
  }

  public validarRol(nombreRol: string): boolean {
    return this.getRol() === nombreRol;
  }

}
