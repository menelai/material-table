# @kovalenko/material-table

Lightweight base component for building reusable Angular Material tables with:

- row selection via `SelectionModel`
- single and multiple selection modes
- dynamic extra columns through directives
- bottom-sheet mass actions
- signal-based state management
- Angular 19+ support

## Installation

```bash
npm install @kovalenko/material-table
```

## Peer Dependencies

The library requires:

- `@angular/core >= 19`
- `@angular/common >= 19`
- `@angular/material >= 19`
- `@angular/cdk >= 19`

## Overview

The library exposes:

- `MaterialTableComponent`
- `ExtraColumnDirective`
- `MassActionsDirective`

The intended usage pattern is:

1. Create your own table component.
2. Extend `MaterialTableComponent<T, R>`.
3. Configure base columns and datasource.
4. Optionally project extra columns and mass actions.

---

# Basic Example

## Component

```ts
import {Component, effect, signal} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';

import {MaterialTableComponent} from '@kovalenko/material-table';

interface User {
  id: string;
  name: string;
  email: string;
}

@Component({
  selector: 'app-users-table',
  standalone: true,
  templateUrl: './users-table.component.html',
})
export class UsersTableComponent extends MaterialTableComponent<User, string> {
  readonly users = signal<User[]>([]);

  constructor() {
    super();

    this.basicColumns.set(['name', 'email']);

    effect(() => {
      this.dataSource.set(new MatTableDataSource(this.users()));
    });
  }

  override transformItem(user: User): string {
    return user.id;
  }
}
```

## Template

```html
<table mat-table [dataSource]="dataSource()">
  @if (multiple()) {
    <ng-container matColumnDef="select">
      <th mat-header-cell *matHeaderCellDef>
        <mat-checkbox
          [checked]="isAllSelected()"
          (change)="masterToggle()"
        />
      </th>

      <td mat-cell *matCellDef="let row">
        <mat-checkbox
          [checked]="selection().isSelected(transformItem(row))"
          (change)="toggle(transformItem(row))"
        />
      </td>
    </ng-container>
  }

  <ng-container matColumnDef="name">
    <th mat-header-cell *matHeaderCellDef>Name</th>
    <td mat-cell *matCellDef="let row">{{ row.name }}</td>
  </ng-container>

  <ng-container matColumnDef="email">
    <th mat-header-cell *matHeaderCellDef>Email</th>
    <td mat-cell *matCellDef="let row">{{ row.email }}</td>
  </ng-container>

  <tr mat-header-row *matHeaderRowDef="columns()"></tr>
  <tr mat-row *matRowDef="let row; columns: columns()"></tr>
</table>
```

---

# API

## MaterialTableComponent<T, R>

Base abstract directive for building reusable tables.

### Generics

| Generic | Description |
|---|---|
| `T` | Row model type |
| `R` | Selection value type |

Example:

```ts
MaterialTableComponent<User, string>
```

Where:

- `User` — table row type
- `string` — selection identifier type

---

## Inputs

### `multiple`

```ts
readonly multiple = input(false)
```

Enables multiple row selection.

---

### `selectable`

```ts
readonly selectable = input(false)
```

Indicates that rows are selectable.

---

### `current`

```ts
readonly current = input<null | string | string[]>()
```

Can be used for external selection state synchronization.

---

## Signals

### `basicColumns`

```ts
readonly basicColumns = signal<string[]>([])
```

Defines standard table columns.

---

### `columns`

```ts
readonly columns = computed(() => [...])
```

Combined columns list including:

- selection column
- basic columns
- projected extra columns

---

### `selection`

```ts
readonly selection = signal(new SelectionModel<R>(true, []))
```

Angular CDK selection model.

---

### `isAllSelected`

Computed signal for header checkbox state.

---

### `isSelectedByFilter`

Flag indicating that all rows matching a filter are logically selected.

---

## Methods

### `toggle(value: R)`

Toggle single row selection.

---

### `masterToggle()`

Toggle selection for all currently visible rows.

---

### `selectEverything()`

Marks all filtered rows as selected.

---

### `clearSelection()`

Clears current selection.

---

### `transformItem(item: T): R`

Transforms row data into selection value.

Override this method when the selected value differs from the row object.

Example:

```ts
override transformItem(user: User): string {
  return user.id;
}
```

---

# Extra Columns

`ExtraColumnDirective` allows consumers to dynamically project columns into a table.

## Example

```html
<ng-template mtExtraColumn="actions" let-row>
  <button mat-button>Edit</button>
</ng-template>
```

## API

### Input: `mtExtraColumn`

```ts
input.required<string>()
```

Column name.

---

### Input: `title`

```ts
input('')
```

Optional column title.

---

# Mass Actions

`MassActionsDirective` provides a template that is automatically shown in a `MatBottomSheet` when rows are selected.

## Example

```html
<ng-template mtMassActions>
  <div class="actions">
    <button mat-raised-button color="primary">
      Delete selected
    </button>
  </div>
</ng-template>
```

The bottom sheet:

- opens automatically when selection becomes non-empty
- closes automatically when selection is cleared

---

# Selection Flow

## Single Selection

```html
<app-users-table />
```

```html
<app-users-table [multiple]="false" />
```

---

## Multiple Selection

```html
<app-users-table [multiple]="true" />
```

---

# Integration Notes

The library does not render Material table markup automatically.

It provides:

- selection state
- projected column management
- mass action lifecycle
- signals-based table infrastructure

Rendering remains fully controlled by the consumer.

This approach makes the library flexible and compatible with:

- server-side pagination
- virtual scrolling
- custom row rendering
- expandable rows
- grouped tables
- advanced filtering

---

# Exported Symbols

```ts
export * from './lib/material-table.component';
export * from './lib/extra-column.directive';
export * from './lib/mass-actions.directive';
```

---

# License

MIT

