import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';


@Component({
  selector: 'lib-datetime-local',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    
  ],
  templateUrl: './datetime-local.component.html',
  styleUrl: './datetime-local.component.scss'
})
export class DatetimeLocalComponent {

}
