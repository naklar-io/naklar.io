import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollSpyDirective } from './directives/scroll-spy.directive';

@NgModule({
    declarations: [ScrollSpyDirective],
    imports: [CommonModule],
    exports: [ScrollSpyDirective, ],
})
export class SharedModule {}
