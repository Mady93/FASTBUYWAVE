/**
 * @category Interfaces
 * 
 * @fileoverview Data Transfer Object (DTO) representing a brief summary of a product.
 * Contains essential product information such as title, price, stock, condition, country, and optional image or currency symbol.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @interface ProductSummaryDTO
 * @property {number} productId - Unique identifier of the product.
 * @property {string} title - Title or name of the product.
 * @property {number} price - Price of the product.
 * @property {string} condition - Condition of the product (e.g., new, used).
 * @property {number} stockQuantity - Number of items available in stock.
 * @property {string} [imageUrl] - Optional URL to the product image.
 * @property {string} productCountry - Country where the product is located.
 * @property {string} [productCurrencySymbol] - Optional symbol of the currency for the product price.
 */
export interface ProductSummaryDTO {
  productId: number;
  title: string;
  price: number;
  condition: string;
  stockQuantity: number;
  imageUrl?: string;
  productCountry: string;
  productCurrencySymbol?: string;
}