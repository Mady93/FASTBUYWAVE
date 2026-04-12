import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardComponent } from './card.component';
import { AdvertisementItem } from '../../../interfaces/advertisement_item.interface';

describe('CardComponent', () => {
  let component: CardComponent;
  let fixture: ComponentFixture<CardComponent>;

  const mockAd: AdvertisementItem = {
    advertisementId: 1,
    imageUrl: 'https://test.com/image.jpg',
    title: 'Test product',
    description: 'Test description',
    price: 10,
    stockQuantity: 5,
    liked: false
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CardComponent);
    component = fixture.componentInstance;
    component.ad = mockAd;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});