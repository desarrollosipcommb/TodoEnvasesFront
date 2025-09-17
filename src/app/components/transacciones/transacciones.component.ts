import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Subject, take, takeUntil } from 'rxjs';
import { TransaccionesService } from 'src/app/services/transacciones.service';
import { transactionTypeLabel } from 'src/app/pipes/transactions.pipe';
import { ItemTypeLabel } from 'src/app/pipes/transactions.pipe';

@Component({
  selector: 'app-transacciones',
  templateUrl: './transacciones.component.html',
  styleUrls: ['./transacciones.component.css']
})
export class TransaccionesComponent implements OnInit {

  displayedColumns: string[] = [
    'itemType',
    'quantity',
    'transactionType',
    'notes',
    'transactionDate',
    'userName',
    'userEmail'
  ];
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  page: number = 0;
  size: number = 5;
  buscar: string = '';
  totalItems: number = 0;
  totalPages: number = 0;
  currentPage: number = 0;
  pageSizeOptions = [5, 25, 50];
  showFirstLastButtons = true;
  disabled = false;
  pageEvent: PageEvent;

  private destroy$: Subject<void> = new Subject<void>();

  constructor(private transaccionesService: TransaccionesService) {}

  ngOnInit(): void {
    this.listar();
  }

  itemTypeLabelPipe = new ItemTypeLabel();
  transactionTypeLabelPipe = new transactionTypeLabel();

  selectedItemType: string = '';
  selectedTransactionType: string = '';

  listar(): void {
  this.transaccionesService.listar(
      this.size,
      this.page,
      this.buscar,
      this.selectedItemType,
      this.selectedTransactionType
    )
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: value => {
        this.dataSource = new MatTableDataSource(value.content);
        this.totalItems = value.totalElements;
        this.totalPages = value.totalPages;
        this.currentPage = value.number;
      }
    });
}

  handlePageEvent(e: PageEvent) {
    this.pageEvent = e;
    this.size = e.pageSize;
    this.page = e.pageIndex;
    this.listar();
  }

  applyFilter(event: Event) {
    this.buscar = (event.target as HTMLInputElement).value;
    this.page = 0;
    this.listar();
  }


}
