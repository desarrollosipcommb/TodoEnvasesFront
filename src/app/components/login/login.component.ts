import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Config } from 'src/app/config/config';
import { LoginModel } from 'src/app/models/login-model';
import { LoginService } from 'src/app/services/login.service';
import { TokenService } from 'src/app/services/token/token.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  hide: boolean = true;
  isLogged: boolean = false;
  isLoginFail: boolean = false;
  errorMenssage: string = '';
  botonHabilitado = true;

  login = new FormGroup({
    userName: new FormControl(''),
    contrasena: new FormControl('')
  })

  constructor(private tokenService: TokenService,
    private config: Config,
    private router: Router,
    private loginService: LoginService,
    public modalservice: BsModalService,) { }

  ngOnInit(): void {
    if (this.tokenService.getToken()) {
      this.isLogged = true;
      this.isLoginFail = false;
      this.config.setIsLogged(true);
      this.router.navigate(['/programacion/listar']);
      this.config.setDisplayName('');
    }

  }
  /**
* Metodo que valida el usuario y contraseña del usuario
* si es correcto redirecciona a la pagina principal
* @return void
* @param userName
* @param contrasena
*
*/
  async onLogin() {
    const login = new LoginModel(this.login.value.userName, this.login.value.contrasena);
    await this.loginService.login(login).subscribe({
      next: (data) => {
        this.isLogged = true;
        this.tokenService.setIdUsuario(data.id);
        this.tokenService.setToken(data.token);
        this.tokenService.setUserName(data.cedula);
        this.tokenService.setRol(data.rol)
        this.tokenService.setIdEmpleado(data.id_empleado);
        this.config.setIsLogged(this.isLogged);
        this.config.setDisplayName(data.cedula);
        this.config.setUser(data.cedula);
        switch (this.tokenService.getRol()) {
          case 'TABLET':
            this.router.navigate(['/asistencia/general']);
            break;

          case 'EMPLEADO':
            this.router.navigate(['/asistencia']);
            break;

          case 'ADMINISTRADOR':
            this.router.navigate(['/programacion/listar']);
            break;

          case 'JEFE':
            this.router.navigate(['/programacion/listar']);
            break;

          default:
            this.router.navigate(['/programacion/listar']);
            break;
        }

        this.getDatosUsuarios();
      }, error: error => {
        this.isLogged = false;
        this.isLoginFail = true;
        this.errorMenssage = error.message;
        this.limpiarCampos();
        Swal.fire({
          position: 'top-end',
          icon: 'error',
          title: ' Contraseña y/o nombre de usuario incorrecto ',
          showConfirmButton: false,
          timer: 2500
        })
      }
    });
  }

  /**
     * Metodo que obtiene los datos del usuario que inicio sesion
     * @return los nombres y apellidos del usuario
    */
  private getDatosUsuarios() {
    return this.config.getUser();
  }

  /**
   * Metodo que limpia los campos del formulario de login
   * @return void
  */
  private limpiarCampos() {
    this.login.setValue({
      userName: '',
      contrasena: ''
    });
  }
  reloadPage(): void {
    window.location.reload();
  }
}
