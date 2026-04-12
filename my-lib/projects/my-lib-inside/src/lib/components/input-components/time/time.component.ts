import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'lib-time',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    
  ],
  templateUrl: './time.component.html',
  styleUrl: './time.component.scss'
})
export class TimeComponent {

}
