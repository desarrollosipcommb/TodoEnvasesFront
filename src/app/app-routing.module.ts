import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { ProgramacionesComponent } from './components/programaciones/programaciones.component';
import { EmpleadosComponent } from './components/empleados/empleados.component';
import { ProgramarComponent } from './components/programar/programar.component';
import { MarcacionesComponent } from './components/marcaciones/marcaciones.component';
import { LicenciasComponent } from './components/licencias/licencias.component';
import { TiposLicenciasComponent } from './components/tipos-licencias/tipos-licencias.component';
import { AsistenciaGeneralComponent } from './components/asistencia-general/asistencia-general.component';
import { LogsComponent } from './components/logs/logs.component';
import { AsistenciaComponent } from './components/asistencia/asistencia.component';
import { ReporteComponent } from './components/reporte/reporte.component';
import { ExportarProgramacionesComponent } from './components/exportar-programaciones/exportar-programaciones.component';
import { ErrorPermisoComponent } from './components/error-permiso/error-permiso.component';
import { ReporteHorasComponent } from './components/reporte-horas/reporte-horas.component';
import { AreasComponent } from './components/areas/areas.component';
import { UsuarioTabletComponent } from './components/usuario-tablet/usuario-tablet.component';
import { TurnosComponent } from './components/turnos/turnos.component';

const routes: Routes = [

  { path: '', component: LoginComponent },
  { path: 'programacion/listar', component: ProgramacionesComponent },
  { path: 'programacion/exportar', component: ExportarProgramacionesComponent },
  { path: 'programar', component: ProgramarComponent },
  { path: 'empleado/listar', component: EmpleadosComponent },
  { path: 'usuarios-tablet/listar', component: UsuarioTabletComponent },
  { path: 'area/listar', component: AreasComponent },
  { path: 'marcacion/listar', component: MarcacionesComponent },
  //{ path: 'licencias/listar', component: LicenciasComponent },
  //{ path: 'tipos-licencias/listar', component: TiposLicenciasComponent },
  { path: 'asistencia/general', component: AsistenciaGeneralComponent },
  { path: 'log/listar', component: LogsComponent },
  { path: 'asistencia', component: AsistenciaComponent },
  //{ path: 'reporte', component: ReporteComponent },
  { path: 'error', component: ErrorPermisoComponent },
  { path: 'reporte-horas', component: ReporteHorasComponent },
  { path: 'turnos/listar', component: TurnosComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
