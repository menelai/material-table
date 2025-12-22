import {SelectionModel} from '@angular/cdk/collections';
import {
  booleanAttribute,
  computed,
  contentChild,
  contentChildren,
  Directive,
  effect,
  inject,
  input,
  OnDestroy,
  output,
  signal,
} from '@angular/core';
import {MatBottomSheet, MatBottomSheetRef} from '@angular/material/bottom-sheet';
import type {MatPaginator} from '@angular/material/paginator';
import type {MatTableDataSource} from '@angular/material/table';

import {ExtraColumnDirective} from './extra-column.directive';
import {MassActionsDirective} from './mass-actions.directive';

@Directive()
export class MaterialTableComponent<T = any> implements OnDestroy {
  readonly basicColumns = signal<string[]>([]);

  readonly extraColumns = contentChildren(ExtraColumnDirective);

  readonly massActions = contentChild(MassActionsDirective);

  readonly multiple = input(false, {transform: booleanAttribute});

  readonly selectable = input(false, {transform: booleanAttribute});

  readonly current = input<null | string | string[]>();

  readonly dataSource = signal<MatTableDataSource<T, MatPaginator> | undefined>(undefined);

  readonly isSelectedByFilter = signal(false);

  readonly selection = signal(new SelectionModel<T>(true, []));

  readonly isAllSelected = computed(() => {
    const numSelected = this.selection().selected.length;
    const numRows = this.dataSource()?.data.length;
    return numSelected === numRows && !this.isSelectedByFilter();
  });

  readonly selected = output<T | T[]>();

  readonly columns = computed(() => [
    ...this.multiple() ? ['select'] : [],
    ...this.basicColumns(),
    ...this.extraColumns().map(d => d.mtExtraColumn()),
  ]);

  protected readonly bottomSheet = inject(MatBottomSheet);

  protected bs?: MatBottomSheetRef<unknown, any>;

  constructor() {
    effect(this.handleBottomSheet);
  }

  ngOnDestroy(): void {
    this.bs?.dismiss();
  }

  selectEverything(): void {
    this.selection.update(v => {
      v.clear();
      this.dataSource()?.data.forEach(row => v.select(row));
      return new SelectionModel(true, v.selected);
    });
    this.isSelectedByFilter.set(true);
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
  }

  toggle(id: T): void {
    this.selection.update(v => {
      v.toggle(id);
      return new SelectionModel(true, v.selected);
    });

    this.isSelectedByFilter.set(false);
  }

  clearSelection(): void {
    this.selection.update(v => {
      v.clear();

      return new SelectionModel(true, v.selected);
    });

    this.isSelectedByFilter.set(false);
  }

  readonly handleBottomSheet = (): void => {
    if (this.massActions()?.template && !this.bs && !this.selection().isEmpty()) {
      this.bs = this.bottomSheet.open(this.massActions()!.template, {
        restoreFocus: true,
        autoFocus: false,
        hasBackdrop: false,
        disableClose: true,
      });
    } else if (this.bs && this.selection().isEmpty()) {
      this.bs.dismiss();
      delete this.bs;
    }
  };
}
