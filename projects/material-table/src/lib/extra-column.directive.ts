import {Directive, Input, TemplateRef} from '@angular/core';

@Directive({
  selector: '[mtExtraColumn]',
})
export class ExtraColumnDirective {
  @Input() mtExtraColumn: string;

  @Input() title = '';

  constructor(public template: TemplateRef<any>) { }
}
