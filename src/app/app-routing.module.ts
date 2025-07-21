import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { ProgramacionesComponent } from './components/programaciones/programaciones.component';
import { EmpleadosComponent } from './components/empleados/empleados.component';
import { ProgramarComponent } from './components/programar/programar.component';
import { MarcacionesComponent } from './components/marcaciones/marcaciones.component';
import { AsistenciaGeneralComponent } from './components/asistencia-general/asistencia-general.component';
import { LogsComponent } from './components/logs/logs.component';
import { AsistenciaComponent } from './components/asistencia/asistencia.component';
import { ExportarProgramacionesComponent } from './components/exportar-programaciones/exportar-programaciones.component';
import { ErrorPermisoComponent } from './components/error-permiso/error-permiso.component';
import { ReporteHorasComponent } from './components/reporte-horas/reporte-horas.component';
import { AreasComponent } from './components/areas/areas.component';
import { UsuarioTabletComponent } from './components/usuario-tablet/usuario-tablet.component';
import { TurnosComponent } from './components/turnos/turnos.component';
import { EnvasesComponent } from './components/envases/envases.component';

const routes: Routes = [

  { path: '', component: LoginComponent },
  { path: 'programacion/listar', component: ProgramacionesComponent },
  { path: 'programacion/exportar', component: ExportarProgramacionesComponent },
  { path: 'programar', component: ProgramarComponent },
  { path: 'empleado/listar', component: EmpleadosComponent },
  { path: 'usuarios-tablet/listar', component: UsuarioTabletComponent },
  { path: 'envase/listar', component: EnvasesComponent },
  { path: 'marcacion/listar', component: MarcacionesComponent },
  { path: 'asistencia/general', component: AsistenciaGeneralComponent },
  { path: 'log/listar', component: LogsComponent },
  { path: 'asistencia', component: AsistenciaComponent },
  { path: 'error', component: ErrorPermisoComponent },
  { path: 'reporte-horas', component: ReporteHorasComponent },
  { path: 'turnos/listar', component: TurnosComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
