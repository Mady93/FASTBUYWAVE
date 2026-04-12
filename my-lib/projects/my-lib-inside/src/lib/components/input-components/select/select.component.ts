import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'lib-select',
  standalone: true,
  imports: [],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectComponent {

}
