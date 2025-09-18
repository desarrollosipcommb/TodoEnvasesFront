import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ItemTypeLabel'
})
export class ItemTypeLabel implements PipeTransform {

  transform(value: string): string {
    switch (value) {
      case 'CAP': return 'Tapa';
      case 'JAR': return 'Envase';
      case 'QUIMICO': return 'Químico';
      case 'EXTRACTO': return 'Extracto';
      default: return value;
    }
  }

}

@Pipe({
  name: 'transactionTypeLabel'
})
export class transactionTypeLabel implements PipeTransform {

  transform(value: string): string {
    switch (value) {
      case 'restock': return 'reabastecimiento';
      case 'adjustment': return 'Ajuste';
      case 'sale': return 'Venta';
      case 'damage': return 'Daños';
      default: return value;
    }
  }
}


