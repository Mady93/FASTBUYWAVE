import { ComponentFixture, TestBed, fakeAsync, flush, flushMicrotasks } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError, BehaviorSubject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminCategoryListComponent } from './admin-category-list.component';
import { CategoryService } from 'src/app/services/path/category/category.service';
import { SortService } from 'src/app/services/utils/sort/sort.service';
import { PageResponse } from 'src/app/interfaces/page/page_response.interface';
import { CategoryDTO } from 'src/app/interfaces/dtos/category_dto.interface';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreeListLayoutComponent } from 'my-lib-inside';
import Swal from 'sweetalert2';

// Mock di TreeListLayoutComponent
@Component({
  selector: 'lib-tree-list-layout',
  template: '<ng-content></ng-content>',
  standalone: true,
})
class MockTreeListLayoutComponent {
  @Input() title: string = '';
  @Input() subtitle?: string;
  @Input() actions: any[] = [];
  @Input() loading: boolean = false;
  @Input() pageable: boolean = false;
  @Input() totalItems: number = 0;
  @Input() pageSize: number = 10;
  @Input() currentPage: number = 0;
  @Input() pageSizeOptions: number[] = [5, 10, 15, 20];
  @Input() emptyStateMessage?: string;
  @Input() emptyStateSubtitle?: string;
  @Input() emptyStateLogo?: string;
  @Input() isEmptyStateFn?: () => boolean;
  @Input() getLogoSrcFn?: () => string;
  @Output() actionClicked = new EventEmitter<string>();
  @Output() pageChanged = new EventEmitter<any>();
}

// Mock di MatIcon
@Component({
  selector: 'mat-icon',
  template: '',
  standalone: true,
})
class MockMatIcon {
  @Input() svgIcon: string = '';
}

// Mock di MatTooltip
@Component({
  selector: '[matTooltip]',
  template: '<ng-content></ng-content>',
  standalone: true,
})
class MockMatTooltip {
  @Input() matTooltip: string = '';
  @Input() matTooltipPosition: string = 'above';
}

// Mock di MatProgressSpinner
@Component({
  selector: 'mat-progress-spinner',
  template: '',
  standalone: true,
})
class MockMatProgressSpinner {
  @Input() diameter: number = 40;
  @Input() mode: string = 'indeterminate';
}

// Mock di MatButton
@Component({
  selector: 'button[mat-button]',
  template: '<ng-content></ng-content>',
  standalone: true,
})
class MockMatButton {}

// Mock dei servizi
class MockCategoryService {
  getActiveCategoriesPaginated = jasmine.createSpy().and.returnValue(
    of({
      content: [],
      totalElements: 0,
      totalPages: 0,
      pageNumber: 0,
      pageSize: 5,
      first: true,
      last: true,
      numberOfElements: 0,
    }),
  );
  getNotActiveCategoriesPaginated = jasmine.createSpy().and.returnValue(
    of({
      content: [],
      totalElements: 0,
      totalPages: 0,
      pageNumber: 0,
      pageSize: 5,
      first: true,
      last: true,
      numberOfElements: 0,
    }),
  );
  updateCategory = jasmine.createSpy().and.returnValue(of({}));
  activateAllCategories = jasmine.createSpy().and.returnValue(of([]));
  deactivateAllCategories = jasmine.createSpy().and.returnValue(of([]));
  notifyCategoriesUpdate = jasmine.createSpy();
  categoriesUpdated$ = new BehaviorSubject<void>(undefined);
}

class MockSortService {
  sortCategoriesAlphabetically = jasmine
    .createSpy()
    .and.callFake((categories: any[]) => categories);
}

class MockMatSnackBar {
  open = jasmine.createSpy();
}

describe('AdminCategoryListComponent', () => {
  let component: AdminCategoryListComponent;
  let fixture: ComponentFixture<AdminCategoryListComponent>;
  let categoryService: MockCategoryService;
  let snackBar: MockMatSnackBar;
  let swalSpy: jasmine.Spy;

  const mockCategories: PageResponse<any> = {
    content: [
      {
        categoryId: 1,
        label: 'Electronics',
        icon: 'faMobileAlt',
        active: true,
        link: '/electronics',
        name: 'Electronics',
        children: [
          {
            categoryId: 2,
            label: 'Phones',
            icon: 'faMobile',
            active: true,
            link: '/electronics/phones',
            name: 'Phones',
            parent: { categoryId: 1, label: 'Electronics', active: true },
            children: [],
          },
          {
            categoryId: 3,
            label: 'Computers',
            icon: 'faLaptop',
            active: false,
            link: '/electronics/computers',
            name: 'Computers',
            parent: { categoryId: 1, label: 'Electronics', active: true },
            children: [],
          },
        ],
      },
      {
        categoryId: 4,
        label: 'Clothing',
        icon: 'faTshirt',
        active: true,
        link: '/clothing',
        name: 'Clothing',
        children: [],
      },
    ],
    totalElements: 2,
    totalPages: 1,
    pageNumber: 0,
    pageSize: 5,
    first: true,
    last: true,
    numberOfElements: 2,
  };

  beforeEach(async () => {
    snackBar = new MockMatSnackBar();

    // Crea lo spy per Swal
    swalSpy = spyOn(Swal, 'fire').and.returnValue(
      Promise.resolve({
        isConfirmed: true,
        isDenied: false,
        isDismissed: false,
      }) as any,
    );

    await TestBed.configureTestingModule({
      imports: [CommonModule, NoopAnimationsModule, AdminCategoryListComponent],
      providers: [
        { provide: CategoryService, useClass: MockCategoryService },
        { provide: SortService, useClass: MockSortService },
        { provide: MatSnackBar, useValue: snackBar },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(AdminCategoryListComponent, {
        remove: { imports: [TreeListLayoutComponent] },
        add: { imports: [MockTreeListLayoutComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(AdminCategoryListComponent);
    component = fixture.componentInstance;
    categoryService = TestBed.inject(CategoryService) as any;

    fixture.detectChanges();
  });

  // NON usare afterEach con fixture.destroy() perché causa l'errore

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should load categories on init', () => {
      expect(categoryService.getActiveCategoriesPaginated).toHaveBeenCalled();
    });
  });

  describe('Categories loading', () => {
    it('should load active categories', () => {
      categoryService.getActiveCategoriesPaginated.and.returnValue(
        of(mockCategories),
      );
      component.loadCategories();

      expect(component.hasCategoriesData).toBeTrue();
    });

    it('should load inactive categories when showActive is false', () => {
      component.showActive$.next(false);
      categoryService.getNotActiveCategoriesPaginated.and.returnValue(
        of(mockCategories),
      );
      component.loadCategories();

      expect(
        categoryService.getNotActiveCategoriesPaginated,
      ).toHaveBeenCalled();
    });

    it('should handle empty response', () => {
      categoryService.getActiveCategoriesPaginated.and.returnValue(
        of({
          content: [],
          totalElements: 0,
          totalPages: 0,
          pageNumber: 0,
          pageSize: 5,
          first: true,
          last: true,
          numberOfElements: 0,
        }),
      );
      component.loadCategories();

      expect(component.hasCategoriesData).toBeFalse();
    });

    it('should handle error', () => {
      categoryService.getActiveCategoriesPaginated.and.returnValue(
        throwError(() => new Error('Error')),
      );
      component.loadCategories();

      expect(component.hasCategoriesData).toBeFalse();
    });
  });

  describe('Tree expansion', () => {
    beforeEach(() => {
      categoryService.getActiveCategoriesPaginated.and.returnValue(
        of(mockCategories),
      );
      component.loadCategories();
    });

    it('should toggle node expansion', () => {
      component.toggleNode(1);
      expect(component.expandedNodes.has(1)).toBeTrue();
      component.toggleNode(1);
      expect(component.expandedNodes.has(1)).toBeFalse();
    });

    it('should collapse descendants when closing node', () => {
      component.expandedNodes.add(1);
      component.expandedNodes.add(2);
      component.toggleNode(1);
      expect(component.expandedNodes.has(2)).toBeFalse();
    });
  });

  describe('View toggle', () => {
    it('should toggle between active and inactive view', () => {
      component.toggleCategoriesView();
      expect(component.showActive$.value).toBeFalse();
      expect(
        categoryService.getNotActiveCategoriesPaginated,
      ).toHaveBeenCalled();
    });
  });

  describe('Pagination', () => {
    it('should handle page change', () => {
      const event = { pageIndex: 2, pageSize: 10 };
      component.onPageChanged(event);
      expect(component.pageable.page).toBe(2);
      expect(component.pageable.size).toBe(10);
    });
  });

  describe('Category update', () => {
    it('should update category', () => {
      component.updateCategory(1, 'Test', 'faTest', true, '/test', 'Test');
      expect(categoryService.updateCategory).toHaveBeenCalled();
    });
  });

  describe('Toggle category active status', () => {
    const category: CategoryDTO = {
      categoryId: 1,
      label: 'Test',
      icon: 'faTest',
      active: true,
      link: '/test',
      name: 'Test',
      parent: {
        categoryId: 2,
        label: 'Parent',
        icon: 'faParent',
        active: true,
        link: '/parent',
        name: 'Parent',
        children: [],
      },
      children: [],
    } as any;

    it('should toggle active status with confirmation', fakeAsync(() => {
      component.toggleActive(category);
      flush();
      expect(swalSpy).toHaveBeenCalled();
    }));

    it('should check if category can toggle active status', () => {
      expect(component.canToggleActive(category)).toBeTrue();

      const categoryWithoutParent = { ...category, parent: undefined };
      expect(component.canToggleActive(categoryWithoutParent)).toBeFalse();

      const categoryWithInactiveParent: CategoryDTO = {
        ...category,
        parent: {
          ...category.parent!,
          active: false,
        },
      };
      expect(component.canToggleActive(categoryWithInactiveParent)).toBeFalse();
    });
  });

  describe('Activate/Deactivate all categories', () => {
    it('should deactivate all categories', fakeAsync(() => {
      component.deactivateOrActivateAllCategories();
      flush();
      expect(swalSpy).toHaveBeenCalled();
    }));

    it('should call deactivateAllCategories when confirmed', fakeAsync(() => {
      swalSpy.and.returnValue(Promise.resolve({ isConfirmed: true }));
      component.deactivateOrActivateAllCategories();
      flush();
      flushMicrotasks();
      expect(categoryService.deactivateAllCategories).toHaveBeenCalled();
    }));

    it('should call activateAllCategories when showActive is false', fakeAsync(() => {
      component.showActive$.next(false);
      swalSpy.and.returnValue(Promise.resolve({ isConfirmed: true }));
      component.deactivateOrActivateAllCategories();
      flush();
      flushMicrotasks();
      expect(categoryService.activateAllCategories).toHaveBeenCalled();
    }));
  });

  describe('Tree actions', () => {
    it('should update tree actions based on state', () => {
      component['updateTreeActions']();
      expect(component.treeActions.length).toBe(2);
    });

    it('should handle tree action click', () => {
      const toggleSpy = spyOn(component, 'toggleCategoriesView');
      component.onTreeActionClicked('toggle-view');
      expect(toggleSpy).toHaveBeenCalled();
    });

    it('should handle deactivate all action', () => {
      const deactivateSpy = spyOn(
        component,
        'deactivateOrActivateAllCategories',
      );
      component.onTreeActionClicked('deactivate-all');
      expect(deactivateSpy).toHaveBeenCalled();
    });
  });

  describe('Empty state', () => {
    it('should return true when no data', () => {
      component.hasCategoriesData = false;
      expect(component.isEmptyState()).toBeTrue();
    });

    it('should return false when data exists', () => {
      component.hasCategoriesData = true;
      expect(component.isEmptyState()).toBeFalse();
    });

    it('should get logo source', () => {
      expect(component.getLogoSrc()).toBe('logo_blue-removebg.png');
    });
  });

  describe('Track by function', () => {
    it('should return category ID for tracking', () => {
      const category = { categoryId: 5 };
      expect(component.trackById(0, category as any)).toBe(5);
    });
  });

  describe('Find node', () => {
    it('should find node by ID', () => {
      const node = component['findNode'](mockCategories.content, 2);
      expect(node?.categoryId).toBe(2);
    });

    it('should return null if node not found', () => {
      const node = component['findNode'](mockCategories.content, 999);
      expect(node).toBeNull();
    });
  });

  describe('Loading state', () => {
    it('should have isLoading observable', () => {
      expect(component.isLoading$).toBeTruthy();
    });

    it('should return loading state as function', () => {
      expect(component.isLoading()).toBe(component['isLoadingSubject'].value);
    });
  });
});