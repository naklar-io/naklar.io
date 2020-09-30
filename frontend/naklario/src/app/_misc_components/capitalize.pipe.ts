import { Pipe, PipeTransform } from '@angular/core';
/**
 * Capitalize the first letter of the string
 */
@Pipe({
  name: 'capitalize'
})
export class CapitalizePipe implements PipeTransform {

  transform(value: string): string {
    const result = value.substr(0, 1).toUpperCase() + value.substr(1);
    return result;
  }

}
