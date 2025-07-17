export class TurnoModel {
    idTurno: number;
    nombre: string;
    horaInicio: string;
    horaInicioBreak: string;
    horaFinBreak: string;
    horaFin: string;
    pasaOtroDia: boolean;
    tiempoBreak: number
    holguraEntrada: number
    holguraSalida: number
    toleranciaEntrada: number
    toleranciaSalida: number
    turnoPartido: boolean
}
