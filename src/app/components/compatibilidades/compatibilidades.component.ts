import { ChangeDetectorRef, Component, TemplateRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { TapaModel } from 'src/app/models/tapa-model';
import { AlertaService } from 'src/app/services/alerta.service';
import { EnvaseService } from 'src/app/services/envase.service';
import { TokenService } from 'src/app/services/token/token.service';

@Component({
  selector: 'app-compatibilidades',
  templateUrl: './compatibilidades.component.html',
  styleUrls: ['./compatibilidades.component.css']
})
export class CompatibilidadesComponent {

  isScrolled = false;

  listaEnvases: any[] = []
  filtroCompatibles: FormControl = new FormControl('');
  filtroIncompatibles: FormControl = new FormControl('');
  envaseControl: FormControl = new FormControl('');
  listaCompatibles: any
  listaIncompatibles: any
  compatiblesFiltrados: any[] = [];
  incompatiblesFiltrados: any[] = []

  modalRef: BsModalRef;
  IsWait: boolean = false;
  botonDeshabilitado = false;

  constructor(public modalservice: BsModalService,
    private envaseService: EnvaseService,
    private alerta: AlertaService,
    private tokenservice: TokenService,
    private cdr: ChangeDetectorRef) {
  }



  compatibleSelected = false;
  incompatibleSelected = false;


  ngOnInit(): void {
    this.listarEnvases();

  }

  ngAfterViewChecked() {
    this.cdr.detectChanges();
  }


  listarEnvases(): void {
    this.envaseService.listarActivos().subscribe({
      next: (res) => {
        this.listaEnvases = res.content.map((e: any) => e.name); // solo nombres
      },
      error: (error) => {
        this.alerta.error('error', error.error.mensaje);
      }
    });
  }



  selectEmpleados() {
    this.compatiblesFiltrados.forEach(tapas => tapas.checked = this.compatibleSelected);
  }

  onEmpleadosChange(): void {
    this.compatibleSelected = this.compatiblesFiltrados.every(tapa => tapa.checked);
  }

  selectIncompatibles() {
    this.incompatiblesFiltrados.forEach(tapa => tapa.checked = this.incompatibleSelected);

  }

  onIncompatiblesChange(): void {
    this.incompatibleSelected = this.incompatiblesFiltrados.every(tapa => tapa.checked);
  }


  listarTapasEvent(): void {
    this.isScrolled = true;
    this.compatiblesFiltrados = []
    this.incompatiblesFiltrados = []
    this.listaCompatibles = []
    this.listaIncompatibles = []
    this.listarCompatibles()
    this.listarIncompatibles()
  }

  listarCompatibles(): void {
    this.envaseService.listarTapasCompatibles(this.envaseControl.value)
      .subscribe((data) => {
        this.listaCompatibles = data;
        this.actualizarCompatiblesFiltrados()
      });
  }

  listarIncompatibles(): void {
    this.envaseService.listarTapasIncompatibles(this.envaseControl.value)
      .subscribe((data) => {
        this.listaIncompatibles = data;
        this.actualizarIncompatiblesFiltrados()
      });
  }

  actualizarCompatiblesFiltrados(): void {
    this.compatiblesFiltrados = this.listaCompatibles.filter((tapa: any) =>
      !this.incompatiblesFiltrados.some(incomp => incomp.id === tapa.id)
    );
    this.cdr.detectChanges();
  }

  actualizarIncompatiblesFiltrados(): void {
    this.incompatiblesFiltrados = this.listaIncompatibles.filter((tapa: any) =>
      !this.compatiblesFiltrados.some(comp => comp.id === tapa.id)
    );
    this.cdr.detectChanges();
  }


  agregarIncompatibles(): void {
    const seleccionados = this.compatiblesFiltrados.filter((tapa: TapaModel) => tapa.checked);

    this.incompatiblesFiltrados.push(
      ...seleccionados.map((tapa: TapaModel) => ({ ...tapa, checked: false }))
    );

    this.compatiblesFiltrados.forEach((tapa: TapaModel) => {
      if (tapa.checked) {
        tapa.checked = false;
      }
    });

    this.compatiblesFiltrados = this.listaCompatibles.filter(
      (tapa: TapaModel) => !this.incompatiblesFiltrados.some(incomp => incomp.id === tapa.id)
    );

    this.actualizarCompatiblesFiltrados();
    this.compatibleSelected = false;
    this.incompatibleSelected = false;
    this.cdr.detectChanges();
  }


  quitarIncompatibles2(): void {
    const seleccionados = this.incompatiblesFiltrados.filter((tapa: TapaModel) => tapa.checked);

    if (seleccionados.length > 0) {
      // agregar a compatibles
      this.compatiblesFiltrados.push(
        ...seleccionados.map((tapa: TapaModel) => ({ ...tapa, checked: false }))
      );

      // quitar solo los seleccionados de incompatibles
      this.incompatiblesFiltrados = this.incompatiblesFiltrados.filter(
        (tapa: TapaModel) => !seleccionados.some(sel => sel.id === tapa.id)
      );
    }

    this.compatibleSelected = false;
    this.incompatibleSelected = false;
    this.cdr.detectChanges();
  }


  guardarCompatibles() {
    this.botonDeshabilitado = true;
    let listaCompGuardar: string[] = []
    this.compatiblesFiltrados.forEach(
      tapa => { listaCompGuardar.push(tapa.name) }
    )

    let listaIncompGuardar: string[] = []
    this.incompatiblesFiltrados.forEach(
      tapa => { listaIncompGuardar.push(tapa.name) }
    )

    this.envaseService.guardarIncompatibles(this.envaseControl.value, listaCompGuardar, true).subscribe({
      next: (res) => {
        this.envaseService.guardarIncompatibles(this.envaseControl.value, listaIncompGuardar, false).subscribe({
          error: error => {
            this.alerta.error(error.error.mensaje, '')
          }
        })
        this.alerta.success('Registro exitoso', '');

        //this.CleanView();
        this.modalRef.hide()
        this.botonDeshabilitado = false;
      }, error: error => {
        this.alerta.error(error.error.mensaje, '')
        this.modalRef.hide()
        this.botonDeshabilitado = false;
      }
    })

  }


  configLoading = {
    class: 'modal-dialog-centered'
  }

  openLoading(temple: TemplateRef<any>) {
    try {
      this.modalRef.hide()
    } catch (error) {
    }
    this.IsWait = true
    this.modalRef = this.modalservice.show(temple, this.configLoading)
    this.guardarCompatibles()
  }

}
