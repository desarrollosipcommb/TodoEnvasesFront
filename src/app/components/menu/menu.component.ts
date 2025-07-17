import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { Config } from 'src/app/config/config';
import { TokenService } from 'src/app/services/token/token.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent {
  @ViewChild(MatDrawer)
  sidenav!: MatDrawer;
  public isLogged = false;
  permisos: any;
  bolen: boolean = false;

  constructor(private observer: BreakpointObserver, public config: Config, public tokenService: TokenService) { }

  async onLogOut() {
    this.config.setRoles([]);
    this.config.setDisplayName('');
    sessionStorage.clear();
    this.isLoggedIn();
  }

  ngOnInit(): void {
    this.isLoggedIn();
    this.getDatosUsuario();
  }

  /**
   * si el tamano de la pantalla es menor a 600px, se oculta el menu
  */
  ngAfterViewInit() {
    this.observer.observe(['(max-width: 600px)']).subscribe((res) => {
      if (res.matches) {
        this.bolen = true;
      } else {
        this.bolen = false;
      }
    });
  }


  /**
   * Obtiene los datos del usuario nombres y apellidos
   * @returns string nombre y apellido del usuario
  */
  getDatosUsuario() {
    return this.config.getUser();
  }


  async isLoggedIn() {
    if (this.tokenService.getToken()) {
      this.isLogged = true;
      this.config.setIsLogged(this.isLogged);
    } else {
      this.isLogged = false;
      this.config.setIsLogged(this.isLogged);
    }
  }
}
