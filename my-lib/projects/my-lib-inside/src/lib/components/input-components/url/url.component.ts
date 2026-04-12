import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'lib-url',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    
  ],
  templateUrl: './url.component.html',
  styleUrl: './url.component.scss'
})
export class UrlComponent {

}
