import {
  AfterContentInit,
  ContentChild,
  ContentChildren,
  Directive,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  QueryList
} from '@angular/core';
import {ExtraColumnDirective} from './extra-column.directive';
import {startWith, Subscription} from 'rxjs';
import {MatBottomSheet, MatBottomSheetRef} from '@angular/material/bottom-sheet';
import {MassActionsDirective} from './mass-actions.directive';
import {SelectionModel} from '@angular/cdk/collections';
import {MatTableDataSource} from '@angular/material/table';

@Directive()
export class MaterialTableComponent<T = any> implements OnInit, AfterContentInit, OnDestroy {
  @ContentChildren(ExtraColumnDirective) extra: QueryList<ExtraColumnDirective>;

  @ContentChild(MassActionsDirective, {static: true}) massActions?: MassActionsDirective;

  @Input() multiple = false;

  @Input() selectable = false;

  @Input() current: null | string | string[];

  @Output() readonly selected = new EventEmitter();

  readonly basicColumns: string[];

  readonly selection = new SelectionModel<T>(true, []);

  dataSource?: MatTableDataSource<T>;

  columns: string[];

  extraColumns: ExtraColumnDirective[] = [];

  isSelectedByFilter = false;

  protected readonly bottomSheet = inject(MatBottomSheet);

  protected bs?: MatBottomSheetRef<unknown, any>;

  private subs: Subscription;

  ngOnInit(): void {
    this.buildColumns();
  }

  ngAfterContentInit(): void {
    this.subs = this.extra.changes.pipe(
      startWith(null),
    ).subscribe(() => {
      this.buildColumns();
    });
  }

  ngOnDestroy(): void {
    this.subs?.unsubscribe();
    this.bs?.dismiss();
  }

  selectEverything(): void {
    this.selection.clear();
    this.dataSource?.data.forEach(row => this.selection.select(row));
    this.isSelectedByFilter = true;
    this.handleBottomSheet();
  }

  masterToggle(): void {
    this.isSelectedByFilter = false;
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.selection.clear();
      this.dataSource?.data!.forEach(row => this.selection.select(row));
    }
    this.handleBottomSheet();
  }

  toggle(id: T): void {
    this.selection.toggle(id);
    this.handleBottomSheet();
    this.isSelectedByFilter = false;
  }

  clearSelection(): void {
    this.selection.clear();
    this.handleBottomSheet();
    this.isSelectedByFilter = false;
  }

  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource?.data.length;
    return numSelected === numRows && !this.isSelectedByFilter;
  }

  handleBottomSheet(): void {
    if (this.massActions?.template && !this.bs && !this.selection.isEmpty()) {
      this.bs = this.bottomSheet.open(this.massActions.template, {
        restoreFocus: true,
        autoFocus: false,
        hasBackdrop: false,
        disableClose: true,
      });
    } else if (this.bs && this.selection.isEmpty()) {
      this.bs.dismiss();
      delete this.bs;
    }
  }

  protected buildColumns(): void {
    this.extraColumns = this.extra?.toArray() ?? [];
    this.columns = [
      ...this.multiple ? ['select'] : [],
      ...this.basicColumns,
      ...this.extraColumns.map(d => d.mtExtraColumn),
    ];
  }
}
