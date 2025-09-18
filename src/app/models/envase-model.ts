import { TapaModel } from "./tapa-model"

export class EnvaseModel {
    id: number
    name: string
    description: string
    diameter: string
    quantity: number
    unitPrice: number
    docenaPrice: number
    cienPrice: number
    pacaPrice: number
    unitsInPaca: number
    compatibleCaps: TapaModel
    unCompatibleCaps: TapaModel
}
