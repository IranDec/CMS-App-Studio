/**
 * Represents the configuration needed to connect to a CMS platform.
 */
export interface CMSConfig {
  /**
   * The type of CMS platform (e.g., Prestashop, WooCommerce).
   */
  platform: string;
  /**
   * The API URL of the CMS.
   */
  apiUrl: string;
  /**
   * The API key for authentication.
   */
  apiKey: string;
}

/**
 * Represents a generic product from a CMS system.
 */
export interface Product {
  /**
   * The unique identifier of the product.
   */
  id: string;
  /**
   * The name of the product.
   */
  name: string;
  /**
   * The description of the product.
   */
  description: string;
  /**
   * The price of the product.
   */
  price: number;
  /**
   * The URL of the product image.
   */
  imageUrl: string;
}

/**
 * Asynchronously retrieves a list of products from the specified CMS.
 *
 * @param config The configuration for connecting to the CMS.
 * @returns A promise that resolves to an array of Product objects.
 */
export async function getProducts(config: CMSConfig): Promise<Product[]> {
  // TODO: Implement this by calling an API.
  console.log('getProducts', config);
  return [
    {
      id: '1',
      name: 'Sample Product 1',
      description: 'This is a sample product.',
      price: 25.00,
      imageUrl: 'https://example.com/product1.jpg',
    },
    {
      id: '2',
      name: 'Sample Product 2',
      description: 'This is another sample product.',
      price: 30.00,
      imageUrl: 'https://example.com/product2.jpg',
    },
  ];
}
