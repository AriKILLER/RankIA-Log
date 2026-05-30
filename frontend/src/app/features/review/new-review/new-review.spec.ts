import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewReview } from './new-review';

describe('NewReview', () => {
  let component: NewReview;
  let fixture: ComponentFixture<NewReview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewReview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewReview);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
