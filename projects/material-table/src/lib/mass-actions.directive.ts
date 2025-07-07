import {Directive, TemplateRef} from '@angular/core';

@Directive({
  selector: '[mtMassActions]',
})
export class MassActionsDirective {
  constructor(public readonly template: TemplateRef<any>) { }
}
