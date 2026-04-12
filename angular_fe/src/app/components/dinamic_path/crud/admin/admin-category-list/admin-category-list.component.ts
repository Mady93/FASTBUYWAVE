import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableAction, TreeListLayoutComponent } from 'my-lib-inside';
import { CategoryDTO } from 'src/app/interfaces/dtos/category_dto.interface';
import { PageResponse } from 'src/app/interfaces/page/page_response.interface';
import { Pageable } from 'src/app/interfaces/page/pageable.interface';
import { CategoryService } from 'src/app/services/path/category/category.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  BehaviorSubject,
  catchError,
  finalize,
  map,
  Observable,
  of,
  ReplaySubject,
  take,
} from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ChangeDetectorRef } from '@angular/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { showSnackBar } from 'src/app/utils/snackbar.utils';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SortService } from 'src/app/services/utils/sort/sort.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ICONS_FE_SIDEBAR } from 'src/app/icons/ICONS_FE';
import Swal from 'sweetalert2';

/**
 * @category Components
 * 
 * 
 * @description Component responsible for displaying a paginated, sortable, and expandable list of categories.
 * Supports activating/deactivating individual or all categories, tree expansion, and pagination.
 *
 * Features:
 * - Paginated and sortable category list
 * - Tree-like view with expandable nodes
 * - Toggle active/inactive categories
 * - Activate/deactivate all categories with confirmation dialogs
 * - Header and empty state actions
 *
 * Lifecycle:
 * - Loads categories on OnInit
 * - Tracks loading state and updates tree actions dynamically
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 */
@Component({
  selector: 'app-admin-category-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    TreeListLayoutComponent,
    FontAwesomeModule,
  ],
  templateUrl: './admin-category-list.component.html',
  styleUrl: './admin-category-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCategoryListComponent implements OnInit {
  /**
   * @property category
   * @description The current category passed from the DashboardComponent via `ngComponentOutletInputs`.
   *
   * @source - DashboardComponent template:
   * ```html
   * <ng-container
   *   [ngComponentOutlet]="currentComponent"
   *   [ngComponentOutletInputs]="{ category: currentCategory }">
   * </ng-container>
   * ```
   *
   * @purpose - Represents the current route value (e.g., 'contact-requests', 'products', 'users').
   * @usage - Not directly used in this component's template yet, but available for future logic.
   * @type {string}
   */
  @Input() category!: string;

  /**
   * @description Tracks loading state internally
   */
  private isLoadingSubject = new BehaviorSubject<boolean>(false);

  /**
   * @description Observable exposing loading state
   */
  isLoading$: Observable<boolean> = this.isLoadingSubject.asObservable();

  /**
   * @description Getter function returning current loading state
   */
  get isLoading(): Function {
    return () => this.isLoadingSubject.value;
  }

  /**
   * @description Icon constants for sidebar
   */
  ICONS_FE_SIDEBAR = ICONS_FE_SIDEBAR;

  /**
   * @description Subject holding the categories list
   */
  private categoriesSubject = new ReplaySubject<CategoryDTO[]>(1);

  /**
   * @description Observable exposing the list of categories
   */
  categories$ = this.categoriesSubject.asObservable();

  /**
   * @description Flag indicating if categories data has been loaded
   */
  hasCategoriesData = false;

  /**
   * @description Observable holding pagination information
   */
  pagination$: BehaviorSubject<any> = new BehaviorSubject({
    totalItems: 0,
    totalPages: 0,
    currentPage: 0,
  });

  /**
   * @description Pageable parameters for API requests
   */
  pageable: Pageable = { page: 0, size: 5 };

  /**
   * @description Observable controlling whether to show active categories
   */
  showActive$ = new BehaviorSubject<boolean>(true);

  /**
   * @description Set of currently expanded category IDs
   */
  expandedNodes = new Set<number>();

  /**
   * @description Actions displayed in the tree header
   */
  treeActions: TableAction[] = [];

  /**
   * @description Returns true if categories list is empty
   */
  isEmptyState: () => boolean = () => !this.hasCategoriesData;

  /**
   * @description Returns the logo image source
   */
  getLogoSrc: () => string = () => 'logo_blue-removebg.png';

  /**
   * @description Handles click on tree action buttons (toggle view or deactivate/activate all)
   * @param actionId ID of the clicked action
   */
  onTreeActionClicked(actionId: string): void {
    if (actionId === 'toggle-view') this.toggleCategoriesView();
    else if (actionId === 'deactivate-all')
      this.deactivateOrActivateAllCategories();
  }

  /**
   * @description Updates the tree header actions dynamically based on state
   */
  private updateTreeActions(): void {
    const isActive = this.showActive$.value;
    const isLoading = this.isLoadingSubject.value;
    const isEmpty = !this.hasCategoriesData;

    this.treeActions = [
      {
        id: 'deactivate-all',
        label: isActive ? 'Deactivate All' : 'Activate All',
        icon: isActive ? '🗑' : '✅',
        type: isActive ? 'danger-outline' : 'secondary',
        disabled: isLoading || isEmpty,
        loading: isLoading,
      },
      {
        id: 'toggle-view',
        label: isActive ? 'Show Inactive' : 'Show Active',
        icon: '👁',
        type: 'secondary',
        disabled: isLoading,
        loading: isLoading,
      },
    ];
    this.cdr.markForCheck();
  }

  // ───────────────────────────────────────────── SERVICES ─────────────────────────────────────────────

  /**
   * @description ChangeDetectorRef for manual UI updates
   */
  private cdr = inject(ChangeDetectorRef);

  /**
   * @description Service for category CRUD operations
   */
  private categoryService = inject(CategoryService);

  /**
   * @description MatSnackBar service for notifications
   */
  private snackBar = inject(MatSnackBar);

  /**
   * @description Service for sorting categories alphabetically
   */
  private sortService = inject(SortService);

  /**
   * @inheritdoc
   * @description Called on component initialization. Loads categories.
   */
  ngOnInit(): void {
    this.loadCategories();
  }

  /**
   * @description Toggles expansion of a category node and collapses descendants if needed
   * @param categoryId ID of the category node
   */
  toggleNode(categoryId: number): void {
    if (this.expandedNodes.has(categoryId)) {
      // Chiude il nodo e collassa tutti i discendenti ricorsivamente
      this.expandedNodes.delete(categoryId);
      this.collapseDescendants(categoryId);
    } else {
      this.expandedNodes.add(categoryId);
    }
    this.cdr.markForCheck();
  }

  /**
   * @description Collapses all descendant nodes of a given category
   * @param categoryId Parent category ID
   */
  private collapseDescendants(categoryId: number): void {
    // Cerca il nodo nell'albero corrente e rimuove tutti i figli dall'expandedNodes
    this.categoriesSubject.pipe(take(1)).subscribe((categories) => {
      const node = this.findNode(categories, categoryId);
      if (node?.children?.length) {
        this.removeExpanded(node.children);
      }
    });
  }

  /**
   * @description Recursively removes children from expanded nodes
   * @param children Array of child categories
   */
  private removeExpanded(children: CategoryDTO[]): void {
    for (const child of children) {
      this.expandedNodes.delete(child.categoryId!);
      if (child.children?.length) {
        this.removeExpanded(child.children);
      }
    }
  }

  /**
   * @description Finds a category node recursively by ID
   * @param nodes Array of categories
   * @param id Category ID to find
   * @returns CategoryDTO or null if not found
   */
  private findNode(nodes: CategoryDTO[], id: number): CategoryDTO | null {
    for (const node of nodes) {
      if (node.categoryId === id) return node;
      if (node.children?.length) {
        const found = this.findNode(node.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  /**
   * @description Loads categories from the API and updates observables
   */
  loadCategories(): void {
    this.isLoadingSubject.next(true);
    this.updateTreeActions();

    const showActive = this.showActive$.value;
    const observable = showActive
      ? this.categoryService.getActiveCategoriesPaginated(this.pageable)
      : this.categoryService.getNotActiveCategoriesPaginated(this.pageable);

    observable
      .pipe(
        map((response: PageResponse<CategoryDTO>) => {
          this.pagination$.next({
            totalItems: response.totalElements,
            totalPages: response.totalPages,
            currentPage: response.pageNumber,
          });
          const categories = response.content || [];
          this.hasCategoriesData = categories.length > 0;
          return this.sortService.sortCategoriesAlphabetically(categories);
        }),
        catchError(() => {
          this.categoriesSubject.next([]);
          return of([]);
        }),
        finalize(() => {
          this.isLoadingSubject.next(false);
          this.updateTreeActions();
          this.cdr.markForCheck();
        }),
      )
      .subscribe((categories) => {
        this.categoriesSubject.next(categories);
      });
  }

  /**
   * @description Toggles between active and inactive categories view
   */
  toggleCategoriesView(): void {
    const current = this.showActive$.value;
    this.showActive$.next(!current);
    this.pageable.page = 0;
    this.loadCategories();
  }

  /**
   * @description Handles page change from pagination controls
   * @param event Event containing pageIndex and pageSize
   */
  onPageChanged(event: any): void {
    this.pageable.page = event.pageIndex;
    this.pageable.size = event.pageSize;
    this.loadCategories();
  }

  /**
   * @description Updates a single category
   * @param categoryId ID of the category
   * @param label Label of the category
   * @param icon Icon of the category
   * @param active Active status
   * @param link Link of the category
   * @param name Name of the category
   */
  updateCategory(
    categoryId: number,
    label: string,
    icon: string,
    active: boolean,
    link: string,
    name: string,
  ): void {
    this.isLoadingSubject.next(true);

    const updatedCategory: CategoryDTO = {
      categoryId,
      label,
      icon,
      link,
      active,
      name,
    };

    this.categoryService
      .updateCategory(updatedCategory)
      .pipe(
        finalize(() => {
          this.isLoadingSubject.next(false);
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: () => {
          this.loadCategories();
          this.cdr.markForCheck();
        },
        error: () => {},
      });
  }

  /**
   * @description Activates or deactivates all categories with confirmation
   */
  deactivateOrActivateAllCategories(): void {
    const showActive = this.showActive$.value;

    Swal.fire({
      title: showActive
        ? 'Deactivate all categories?'
        : 'Activate all categories?',
      text: showActive
        ? 'All active categories will be deactivated.'
        : 'All inactive categories will be activated.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: showActive
        ? 'Yes, deactivate all'
        : 'Yes, activate all',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.isLoadingSubject.next(true);
      this.updateTreeActions();

      const action$ = showActive
        ? this.categoryService.deactivateAllCategories()
        : this.categoryService.activateAllCategories();

      action$
        .pipe(
          finalize(() => {
            this.isLoadingSubject.next(false);
            this.updateTreeActions();
            this.cdr.markForCheck();
          }),
        )
        .subscribe({
          next: () => {
            const message = showActive
              ? 'All categories deactivated successfully'
              : 'All categories activated successfully';

            showSnackBar(this.snackBar, message);
            this.categoryService.notifyCategoriesUpdate();
            this.loadCategories();
          },
          error: () => {
            const message = showActive
              ? 'Failed to deactivate categories'
              : 'Failed to activate categories';

            showSnackBar(this.snackBar, message);
          },
        });
    });
  }

  /**
   * @description Toggles active status of a single category with confirmation
   * @param category The category to toggle
   */
  toggleActive(category: CategoryDTO): void {
    const updatedActiveStatus = !category.active;

    Swal.fire({
      title: updatedActiveStatus
        ? 'Activate category?'
        : 'Deactivate category?',
      text: `Category "${category.label}" will be ${updatedActiveStatus ? 'activated' : 'deactivated'}.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: updatedActiveStatus
        ? 'Yes, activate'
        : 'Yes, deactivate',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
    }).then((result) => {
      if (!result.isConfirmed) return;

      const updatedCategory: CategoryDTO = {
        ...category,
        active: updatedActiveStatus,
      };

      this.isLoadingSubject.next(true);

      this.categoryService
        .updateCategory(updatedCategory)
        .pipe(
          finalize(() => {
            this.isLoadingSubject.next(false);
            this.cdr.markForCheck();
          }),
        )
        .subscribe({
          next: () => {
            const statusMessage = updatedActiveStatus
              ? 'activated'
              : 'deactivated';
            showSnackBar(
              this.snackBar,
              `Category ${statusMessage} successfully`,
            );
            this.categoryService.notifyCategoriesUpdate();
            this.loadCategories();
          },
          error: () => {
            const statusMessage = updatedActiveStatus
              ? 'activate'
              : 'deactivate';
            showSnackBar(
              this.snackBar,
              `Error trying to ${statusMessage} category`,
            );
          },
        });
    });
  }

  /**
   * @description Checks if a category can toggle its active status (only if parent is active)
   * @param category The category to check
   * @returns {boolean} True if toggling is allowed
   */
  canToggleActive(category: CategoryDTO): boolean {
    if (!category.parent) return false;
    return category.parent.active;
  }

  /**
   * @description TrackBy function for ngFor to optimize rendering
   * @param _index Index (ignored)
   * @param item CategoryDTO item
   * @returns {number} Category ID
   */
  trackById(_index: number, item: CategoryDTO): number {
    return item.categoryId!;
  }
}
