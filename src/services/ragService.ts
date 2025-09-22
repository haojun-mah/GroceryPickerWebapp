import supabase from '@/lib/supabase/config';
import { getEmbedding } from '@/lib/embeddings';

// Interface definitions
export interface ProductRow {
  product_id: string;
  name: string;
  price: number;
  supermarket?: string;
  quantity?: string;
  image_url?: string;
  product_url?: string;
  promotion_description?: string;
  promotion_end_date_text?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SupermarketFilter {
  exclude?: string[];
  include?: string[];
}

export class ControllerError extends Error {
  public statusCode: number;
  public details?: string;

  constructor(statusCode: number, message: string, details?: string) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'ControllerError';
  }
}

/**
 * RAG Service for retrieving products using vector embeddings
 * Performs semantic search against product embeddings stored in the database
 */
export class RagService {
  /**
   * Fetch products using vector similarity search
   * @param userQuery - Natural language query from user
   * @param matchThreshold - Minimum similarity threshold (0-1)
   * @param matchCount - Maximum number of results to return
   * @param supermarketFilter - Optional filter to include/exclude supermarkets
   * @returns Array of matching products or error
   */
  static async fetchProductPrices(
    userQuery: string,
    matchThreshold: number = 0.5,
    matchCount: number = 10,
    supermarketFilter?: SupermarketFilter,
  ): Promise<ProductRow[] | ControllerError> {
    // Generate embedding for the user query
    const queryEmbedding = await getEmbedding(userQuery, { type: 'query' });
    if (!queryEmbedding) {
      return new ControllerError(
        500,
        'Failed to generate query embedding for price retrieval.',
      );
    }

    try {
      // Use database-level filtering for better performance and guaranteed result count
      const { data, error } = await supabase.rpc(
        'match_products_by_embedding_with_filter',
        {
          query_embedding: queryEmbedding,
          match_threshold: matchThreshold,
          match_count: matchCount,
          exclude_supermarkets: supermarketFilter?.exclude || null,
        },
      );

      if (error) {
        console.error('Error during filtered vector search:', error.message);
        return new ControllerError(
          500,
          'Failed to retrieve product prices.',
          error.message,
        );
      }

      // Results are already filtered and limited at database level
      const products = Array.isArray(data) ? (data as ProductRow[]) : [];
      
      // Remove duplicates (though this should be rare with proper database design)
      const uniqueProducts: ProductRow[] = [];
      const seenIds = new Set<string>();
      
      for (const product of products) {
        if (product && typeof product === 'object' && product.product_id && !seenIds.has(product.product_id)) {
          uniqueProducts.push(product);
          seenIds.add(product.product_id);
        }
      }
      
      return uniqueProducts;
    } catch (error: any) {
      console.error('Unexpected error during price retrieval:', error.message);
      return new ControllerError(
        500,
        'An unexpected error occurred during price retrieval.',
        error.message,
      );
    }
  }

  /**
   * Alternative method for basic vector similarity search without complex filtering
   * @param userQuery - Natural language query from user
   * @param matchThreshold - Minimum similarity threshold (0-1)
   * @param matchCount - Maximum number of results to return
   * @returns Array of matching products or error
   */
  static async searchProductsByEmbedding(
    userQuery: string,
    matchThreshold: number = 0.7,
    matchCount: number = 10,
  ): Promise<ProductRow[] | ControllerError> {
    const queryEmbedding = await getEmbedding(userQuery, { type: 'query' });
    if (!queryEmbedding) {
      return new ControllerError(
        500,
        'Failed to generate query embedding for search.',
      );
    }

    try {
      // Basic vector similarity search
      const { data, error } = await supabase.rpc('match_products_by_embedding_with_filter', {
        query_embedding: queryEmbedding,
        match_threshold: matchThreshold,
        match_count: matchCount,
        exclude_supermarkets: null,
      });

      if (error) {
        console.error('Error during vector search:', error.message);
        return new ControllerError(
          500,
          'Failed to search products by embedding.',
          error.message,
        );
      }

      return Array.isArray(data) ? (data as ProductRow[]) : [];
    } catch (error: any) {
      console.error('Unexpected error during embedding search:', error.message);
      return new ControllerError(
        500,
        'An unexpected error occurred during embedding search.',
        error.message,
      );
    }
  }

  /**
   * Find similar products to a given product using vector similarity
   * @param productId - ID of the product to find similar items for
   * @param matchThreshold - Minimum similarity threshold (0-1)
   * @param matchCount - Maximum number of similar products to return
   * @returns Array of similar products or error
   */
  static async findSimilarProducts(
    productId: string,
    matchThreshold: number = 0.8,
    matchCount: number = 5,
  ): Promise<ProductRow[] | ControllerError> {
    try {
      const { data, error } = await supabase.rpc('find_similar_products', {
        target_product_id: productId,
        match_threshold: matchThreshold,
        match_count: matchCount,
      });

      if (error) {
        console.error('Error finding similar products:', error.message);
        return new ControllerError(
          500,
          'Failed to find similar products.',
          error.message,
        );
      }

      return Array.isArray(data) ? (data as ProductRow[]) : [];
    } catch (error: any) {
      console.error('Unexpected error finding similar products:', error.message);
      return new ControllerError(
        500,
        'An unexpected error occurred while finding similar products.',
        error.message,
      );
    }
  }

  /**
   * Format products for LLM consumption or display
   * @param products - Array of products to format
   * @returns Formatted string representation of products
   */
  static formatProductsForLLMSelection(products: ProductRow[]): string {
    if (products.length === 0) {
      return 'No products available.';
    }
    
    return products
      .map((product, index) => {
        const store = product.supermarket || 'Unknown store';
        const quantity = product.quantity || 'N/A';
        const promotion = product.promotion_description 
          ? ` (${product.promotion_description})` 
          : '';
        
        return `${index + 1}. ${product.name} - $${product.price} at ${store} (${quantity})${promotion}`;
      })
      .join('\n');
  }

  /**
   * Format products as JSON for API responses
   * @param products - Array of products to format
   * @returns Structured product data for frontend consumption
   */
  static formatProductsForAPI(products: ProductRow[]): any[] {
    return products.map(product => ({
      id: product.product_id,
      name: product.name,
      price: product.price,
      store: product.supermarket,
      quantity: product.quantity,
      imageUrl: product.image_url,
      productUrl: product.product_url,
      promotion: product.promotion_description,
      promotionEndDate: product.promotion_end_date_text,
      inStock: true, // Assuming in-stock if returned from search
    }));
  }

  /**
   * Get search suggestions for autocomplete
   * @param query - Partial search term
   * @param limit - Maximum number of suggestions to return
   * @returns Array of products for suggestions or error
   */
  static async getSearchSuggestions(
    query: string,
    limit: number = 5,
  ): Promise<ProductRow[] | ControllerError> {
    if (query.length < 2) {
      return [];
    }

    try {
      // Use a simple text search in the database for suggestions
      // This is faster than vector search for autocomplete
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .ilike('name', `%${query}%`)
        .limit(limit);

      if (error) {
        console.error('Search suggestions error:', error);
        return new ControllerError(
          500,
          'Failed to get search suggestions.',
          error.message,
        );
      }

      return data || [];
    } catch (error: any) {
      console.error('Unexpected error getting suggestions:', error.message);
      return new ControllerError(
        500,
        'An unexpected error occurred while getting suggestions.',
        error.message,
      );
    }
  }

  /**
   * Get product recommendations based on user's search history or preferences
   * This would typically use collaborative filtering + vector search
   * @param userPreferences - Array of previously searched/purchased items
   * @param matchCount - Number of recommendations to return
   * @returns Recommended products or error
   */
  static async getRecommendations(
    userPreferences: string[],
    matchCount: number = 10,
  ): Promise<ProductRow[] | ControllerError> {
    if (userPreferences.length === 0) {
      return new ControllerError(400, 'No user preferences provided for recommendations.');
    }

    try {
      // Create a combined query from user preferences
      const combinedQuery = userPreferences.join(' ');
      
      // Use semantic search to find related products
      return await this.searchProductsByEmbedding(combinedQuery, 0.6, matchCount);
    } catch (error: any) {
      console.error('Error generating recommendations:', error.message);
      return new ControllerError(
        500,
        'Failed to generate product recommendations.',
        error.message,
      );
    }
  }
}
