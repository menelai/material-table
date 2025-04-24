import {Directive, TemplateRef} from '@angular/core';

@Directive({
  selector: '[mtMassActions]',
})
export class MassActionsDirective {
  constructor(public template: TemplateRef<any>) { }
}
