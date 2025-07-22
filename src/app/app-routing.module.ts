import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { ProgramacionesComponent } from './components/programaciones/programaciones.component';
import { EmpleadosComponent } from './components/empleados/empleados.component';
import { MarcacionesComponent } from './components/marcaciones/marcaciones.component';
import { LogsComponent } from './components/logs/logs.component';
import { ErrorPermisoComponent } from './components/error-permiso/error-permiso.component';
import { UsuarioTabletComponent } from './components/usuario-tablet/usuario-tablet.component';
import { EnvasesComponent } from './components/envases/envases.component';
import { TipoEnvasesComponent } from './components/tipo-envases/tipo-envases.component';

const routes: Routes = [

  { path: '', component: LoginComponent },
  { path: 'programacion/listar', component: ProgramacionesComponent },
  { path: 'empleado/listar', component: EmpleadosComponent },
  { path: 'usuarios-tablet/listar', component: UsuarioTabletComponent },
  { path: 'envase/listar', component: EnvasesComponent },
  { path: 'tipos-envases/listar', component: TipoEnvasesComponent },
  { path: 'marcacion/listar', component: MarcacionesComponent },
  { path: 'log/listar', component: LogsComponent },
  { path: 'error', component: ErrorPermisoComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
