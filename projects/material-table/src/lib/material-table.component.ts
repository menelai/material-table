import {
  AfterContentInit,
  computed,
  ContentChild,
  ContentChildren,
  Directive,
  inject,
  input,
  OnDestroy,
  OnInit,
  output,
  QueryList,
  signal
} from '@angular/core';
import {ExtraColumnDirective} from './extra-column.directive';
import {startWith, Subscription} from 'rxjs';
import {MatBottomSheet, MatBottomSheetRef} from '@angular/material/bottom-sheet';
import {MassActionsDirective} from './mass-actions.directive';
import {SelectionModel} from '@angular/cdk/collections';
import type {MatTableDataSource} from '@angular/material/table';
import type {MatPaginator} from '@angular/material/paginator';

@Directive()
export class MaterialTableComponent<T = any> implements OnInit, AfterContentInit, OnDestroy {
  @ContentChildren(ExtraColumnDirective) extra: QueryList<ExtraColumnDirective>;

  @ContentChild(MassActionsDirective, {static: true}) massActions?: MassActionsDirective;

  readonly multiple = input(false);

  readonly selectable = input(false);

  readonly current = input<null | string | string[]>();

  readonly extraColumns = signal<ExtraColumnDirective[]>([]);

  readonly dataSource = signal<MatTableDataSource<T, MatPaginator> | undefined>(undefined);

  readonly isSelectedByFilter = signal(false);

  readonly selection = signal(new SelectionModel<T>(true, []));

  readonly isAllSelected = computed((): boolean => {
    const numSelected = this.selection().selected.length;
    const numRows = this.dataSource()?.data.length;
    return numSelected === numRows && !this.isSelectedByFilter();
  });

  readonly selected = output();

  readonly basicColumns: string[];

  columns: string[];

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
    this.selection.update(v => {
      v.clear();
      this.dataSource()?.data.forEach(row => v.select(row));
      return new SelectionModel(true, v.selected);
    });
    this.isSelectedByFilter.set(true);
    this.handleBottomSheet();
  }

  masterToggle(): void {
    this.isSelectedByFilter.set(false);

    this.selection.update(v => {
      if (this.isAllSelected()) {
        v.clear();
      } else {
        v.clear();
        this.dataSource()?.data!.forEach(row => v.select(row));
      }

      return new SelectionModel(true, v.selected);
    });

    this.handleBottomSheet();
  }

  toggle(id: T): void {
    this.selection.update(v => {
      v.toggle(id);
      return new SelectionModel(true, v.selected);
    });

    this.handleBottomSheet();
    this.isSelectedByFilter.set(false);
  }

  clearSelection(): void {
    this.selection.update(v => {
      v.clear();

      return new SelectionModel(true, v.selected);
    });
    this.handleBottomSheet();
    this.isSelectedByFilter.set(false);
  }

  handleBottomSheet(): void {
    if (this.massActions?.template && !this.bs && !this.selection().isEmpty()) {
      this.bs = this.bottomSheet.open(this.massActions.template, {
        restoreFocus: true,
        autoFocus: false,
        hasBackdrop: false,
        disableClose: true,
      });
    } else if (this.bs && this.selection().isEmpty()) {
      this.bs.dismiss();
      delete this.bs;
    }
  }

  protected buildColumns(): void {
    this.extraColumns.set(this.extra?.toArray() ?? []);
    this.columns = [
      ...this.multiple() ? ['select'] : [],
      ...this.basicColumns,
      ...this.extraColumns().map(d => d.mtExtraColumn()),
    ];
  }
}
