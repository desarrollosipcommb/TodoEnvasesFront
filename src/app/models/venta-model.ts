export class VentaModel {
    clientName: string
    clientEmail: string
    clientPhone: string
    descripion: string
    paymentMethod: string
    saleDate: string
    items: itemsModel
}

export class itemsModel {
    comboName: string
    jarName: string
    capName: string
    capColor: string
    diameter: string
    quantity: number
    quimicoName: string
    extractoName: string
}