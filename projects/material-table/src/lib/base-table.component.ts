import {AfterContentInit, ContentChildren, Directive, Input, OnDestroy, OnInit, QueryList} from '@angular/core';
import {ExtraColumnDirective} from './extra-column.directive';
import {startWith, Subscription} from 'rxjs';

@Directive()
export class BaseTableComponent implements OnInit, AfterContentInit, OnDestroy {
  @ContentChildren(ExtraColumnDirective) extra: QueryList<ExtraColumnDirective>;

  @Input() multiple = false;

  readonly basicColumns: string[];

  columns: string[];

  extraColumns: ExtraColumnDirective[] = [];

  private subs: Subscription;

  ngOnInit(): void {
    this.buildColumns();
  }

  ngAfterContentInit(): void {
    this.extra.changes.pipe(
      startWith(null),
    ).subscribe(() => {
      this.buildColumns();
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  protected buildColumns(): void {
    this.extraColumns = this.extra?.toArray() ?? [];
    this.columns = [
      ...this.multiple ? ['checkbox'] : [],
      ...this.basicColumns,
      ...this.extraColumns.map(d => d.mtExtraColumn),
    ];
  }
}
