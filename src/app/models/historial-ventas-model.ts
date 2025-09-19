export class HistorialVentasModel {
    sellerName: string
    saleDate: string
    clientName: string
    clientEmail: string
    clientPhone: string
    totalPrice: number
    saleItems: saleItem[]
}

export class saleItem {
    name: string
    quantity: number
    unitPrice: number
    subtotal: number
}
