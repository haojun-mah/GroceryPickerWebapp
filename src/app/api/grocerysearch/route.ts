import { NextRequest, NextResponse } from 'next/server';
import { createApiClient } from '@/lib/supabase/server';
import { getEmbedding } from '@/lib/embeddings';

// Database interface for products (matching actual schema)
interface ProductRow {
  product_id: string;
  name: string;
  price: string; // Price is text in database
  supermarket: string;
  quantity: string;
  promotion_description?: string;
  promotion_end_date?: string;
  product_url?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

// Frontend-compatible interface
interface GroceryItem {
  id: string;
  name: string;
  price: string;
  store: string;
  quantity: string;
  description?: string;
  imageUrl?: string;
  productUrl?: string;
  promotion?: string;
}

// Convert database row to frontend format
function convertToGroceryItem(product: ProductRow): GroceryItem {
  return {
    id: product.product_id,
    name: product.name,
    price: product.price || 'Price not available', // Keep as string
    store: product.supermarket,
    quantity: product.quantity,
    description: product.promotion_description,
    imageUrl: product.image_url,
    productUrl: product.product_url,
    promotion: product.promotion_description,
  };
}

// Mock grocery data for fallback testing
const mockGroceryData: GroceryItem[] = [
  {
    id: "1",
    name: "Red Apples",
    price: "2.99",
    quantity: "Per lb",
    store: "Fresh Market",
    description: "Fresh crisp red apples, perfect for snacking or baking.",
    promotion: "Fresh Produce"
  },
  {
    id: "2",
    name: "Organic Bananas",
    price: "2.99",
    quantity: "Per lb",
    store: "Fresh Market",
    description: "Fresh organic bananas, perfect for smoothies, baking, or snacking.",
    promotion: "Organic Special"
  },
  {
    id: "3", 
    name: "Whole Milk",
    price: "3.49",
    quantity: "1 Gallon",
    store: "SuperMart",
    description: "Fresh whole milk from local farms.",
    promotion: "Dairy Fresh"
  },
  {
    id: "4",
    name: "Whole Wheat Bread",
    price: "2.79",
    quantity: "24oz Loaf",
    store: "Corner Store",
    description: "Freshly baked whole wheat bread.",
    promotion: "Bakery Special"
  },
  {
    id: "5",
    name: "Greek Yogurt",
    price: "4.99",
    quantity: "32oz",
    store: "Fresh Market",
    description: "Creamy Greek yogurt with probiotics.",
    promotion: "Probiotic Power"
  },
  {
    id: "6",
    name: "Avocados",
    price: "1.99",
    quantity: "Each",
    store: "SuperMart",
    description: "Ripe avocados perfect for guacamole and toast.",
    promotion: "Fresh Produce"
  },
  {
    id: "7",
    name: "Chicken Breast",
    price: "8.99",
    quantity: "Per lb",
    store: "Fresh Market",
    description: "Fresh boneless chicken breast.",
    promotion: "Meat Fresh"
  },
  {
    id: "8",
    name: "Green Apples",
    price: "3.29",
    quantity: "Per lb",
    store: "SuperMart",
    description: "Tart green apples, great for cooking and baking.",
    promotion: "Cooking Apples"
  },
  {
    id: "9",
    name: "Orange Juice",
    price: "4.29",
    quantity: "64oz",
    store: "Corner Store",
    description: "Fresh squeezed orange juice with pulp.",
    promotion: "Fresh Squeezed"
  },
  {
    id: "10",
    name: "Pasta Sauce",
    price: "2.49",
    quantity: "24oz",
    store: "SuperMart",
    description: "Traditional marinara pasta sauce with herbs.",
    promotion: "Italian Style"
  }
];

interface SearchResponse {
  results: GroceryItem[];
  query: string;
  resultCount: number;
  searchMethod: 'text' | 'semantic' | 'combined' | 'empty' | 'error';
}



export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10');
    const supermarket = searchParams.get('supermarket');
    
    console.log(`[SEARCH] Starting hybrid search for: "${query}", limit: ${limit}, supermarket: ${supermarket}`);

    if (!query.trim()) {
      console.log('[SEARCH] Empty query, returning mock data');
      return NextResponse.json({
        results: mockGroceryData.slice(0, limit),
        query: '',
        resultCount: mockGroceryData.length,
        searchMethod: 'empty'
      } as SearchResponse);
    }

    try {
      // Step 1: Get Supabase client
      console.log('[SEARCH] Step 1: Creating Supabase client');
      const supabase = createApiClient();
      console.log('[SEARCH] Supabase client created successfully');
      
      // Step 2: Generate embedding for the search query
      console.log('[SEARCH] Step 2: Generating embedding for query');
      const queryEmbedding = await getEmbedding(query, { type: 'query' });
      
      if (!queryEmbedding) {
        console.warn('[SEARCH] Failed to generate embedding for query, falling back to text search');
        return performTextSearch(query, limit, supermarket);
      }
      
      console.log(`[SEARCH] Embedding generated successfully, length: ${queryEmbedding.length}`);

      // Step 3: Perform vector similarity search in Supabase
      console.log('[SEARCH] Step 3: Performing vector similarity search');
      const { data: semanticResults, error: semanticError } = await supabase.rpc(
        'match_products_by_embedding_with_filter',
        {
          query_embedding: queryEmbedding,
          match_threshold: 0.5,
          match_count: limit, // Get more than needed for deduplication
          exclude_supermarkets: supermarket ? null : null // Could filter here if needed
        }
      );

      if (semanticError) {
        console.error('[SEARCH] Semantic search error:', semanticError);
        console.error('[SEARCH] Error details:', JSON.stringify(semanticError, null, 2));
        return performTextSearch(query, limit, supermarket);
      }
      
      console.log(`[SEARCH] Semantic search returned ${semanticResults?.length || 0} results`);

      // Step 4: Perform regex/text search for exact matches
      console.log('[SEARCH] Step 4: Performing text search');
      const searchTerms = query.toLowerCase().split(' ');
      const { data: textResults, error: textError } = await supabase
        .from('products')
        .select('*')
        .or(
          searchTerms.map(term => 
            `name.ilike.%${term}%,supermarket.ilike.%${term}%,quantity.ilike.%${term}%,promotion_description.ilike.%${term}%`
          ).join(',')
        )
        .limit(limit);

      if (textError) {
        console.error('[SEARCH] Text search error:', textError);
        console.error('[SEARCH] Text error details:', JSON.stringify(textError, null, 2));
      } else {
        console.log(`[SEARCH] Text search returned ${textResults?.length || 0} results`);
      }

      // Step 5: Combine and deduplicate results
      const seenProductIds = new Set<string>();
      const finalResults: GroceryItem[] = [];

      // Add text search results first (exact matches have priority)
      if (textResults) {
        for (const product of textResults as ProductRow[]) {
          if (!seenProductIds.has(product.product_id)) {
            seenProductIds.add(product.product_id);
            finalResults.push(convertToGroceryItem(product));
          }
        }
      }

      // Fill remaining slots with semantic search results
      if (semanticResults && finalResults.length < limit) {
        for (const product of semanticResults as ProductRow[]) {
          if (finalResults.length >= limit) break;
          if (!seenProductIds.has(product.product_id)) {
            seenProductIds.add(product.product_id);
            finalResults.push(convertToGroceryItem(product));
          }
        }
      }

      // Apply supermarket filter if specified
      let filteredResults = finalResults;
      if (supermarket) {
        filteredResults = finalResults.filter(item => 
          item.store.toLowerCase().includes(supermarket.toLowerCase())
        );
      }

      // Ensure we don't exceed the limit
      const limitedResults = filteredResults.slice(0, limit);

      console.log(`[SEARCH] Final hybrid search results: ${limitedResults.length} results (${textResults?.length || 0} text + ${semanticResults?.length || 0} semantic)`);
      
      if (limitedResults.length === 0) {
        console.warn('[SEARCH] No results found in database, falling back to mock data');
        return performTextSearch(query, limit, supermarket);
      }

      return NextResponse.json({
        results: limitedResults,
        query,
        resultCount: limitedResults.length,
        searchMethod: 'combined'
      } as SearchResponse);

    } catch (dbError) {
      console.error('[SEARCH] Database connection error, falling back to mock data:', dbError);
      console.error('[SEARCH] DB error details:', JSON.stringify(dbError, null, 2));
      return performTextSearch(query, limit, supermarket);
    }

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { 
        results: [], 
        query: '', 
        resultCount: 0, 
        searchMethod: 'error',
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// Fallback function for text search using mock data
function performTextSearch(query: string, limit: number, supermarket?: string | null): NextResponse {
  console.log(`[FALLBACK] Performing text search on mock data for: "${query}"`);
  const searchTerms = query.toLowerCase().split(' ');
  const filteredResults = mockGroceryData.filter(item => {
    const searchText = `${item.name} ${item.description} ${item.quantity} ${item.store} ${item.promotion || ''}`.toLowerCase();
    return searchTerms.some(term => searchText.includes(term));
  });
  
  console.log(`[FALLBACK] Mock data filtered results: ${filteredResults.length}`);

  let finalResults = filteredResults;
  if (supermarket) {
    finalResults = filteredResults.filter(item => 
      item.store.toLowerCase().includes(supermarket.toLowerCase())
    );
  }

  const limitedResults = finalResults.slice(0, limit);

  return NextResponse.json({
    results: limitedResults,
    query,
    resultCount: limitedResults.length,
    searchMethod: 'text'
  } as SearchResponse);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      query = '', 
      limit = 10, 
      supermarket,
      exclude 
    } = body;
    
    // Validate request body
    if (typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query must be a string' },
        { status: 400 }
      );
    }

    // Create URLSearchParams to reuse GET logic
    const searchParams = new URLSearchParams();
    searchParams.set('q', query);
    searchParams.set('limit', limit.toString());
    if (supermarket) searchParams.set('supermarket', supermarket);
    if (exclude && Array.isArray(exclude)) {
      searchParams.set('exclude', exclude.join(','));
    }
    
    // Create a new request with the search parameters
    const searchUrl = new URL(request.url);
    searchUrl.search = searchParams.toString();
    const mockRequest = new NextRequest(searchUrl.toString());
    
    return await GET(mockRequest);
    
  } catch (error) {
    console.error('POST search error:', error);
    return NextResponse.json(
      { 
        results: [], 
        query: '', 
        resultCount: 0, 
        searchMethod: 'error',
        error: 'Invalid request body or internal error' 
      },
      { status: 400 }
    );
  }
}
