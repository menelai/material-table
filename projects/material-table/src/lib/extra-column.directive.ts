import {Directive, input, TemplateRef} from '@angular/core';

@Directive({
  selector: '[mtExtraColumn]',
})
export class ExtraColumnDirective {
  readonly mtExtraColumn = input.required<string>();

  readonly title = input('');

  constructor(public template: TemplateRef<any>) { }
}
