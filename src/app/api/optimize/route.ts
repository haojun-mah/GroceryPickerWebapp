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
  similarity?: number; // Added for RAG search results
}

// Response interface for the API
interface PriceSearchResult {
  id: string;
  name: string;
  price: number;
  priceText: string;
  store: string;
  quantity: string;
  description?: string;
  imageUrl?: string;
  productUrl?: string;
  promotion?: string;
  similarity?: number;
}

// Convert database row to response format with price parsing
function convertToPriceSearchResult(product: ProductRow): PriceSearchResult | null {
  // Extract numeric price from price string
  const priceMatch = product.price?.match(/[\d.,]+/);
  const numericPrice = priceMatch ? parseFloat(priceMatch[0].replace(',', '')) : 0;
  
  // Skip products with no valid price
  if (numericPrice === 0 && product.price !== '0') {
    return null;
  }

  return {
    id: product.product_id,
    name: product.name,
    price: numericPrice,
    priceText: product.price || 'Price not available',
    store: product.supermarket,
    quantity: product.quantity,
    description: product.promotion_description,
    imageUrl: product.image_url,
    productUrl: product.product_url,
    promotion: product.promotion_description,
    similarity: product.similarity,
  };
}

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { query } = body;

    // Validate the query parameter
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query parameter is required and must be a string' },
        { status: 400 }
      );
    }

    // Sanitize the query
    const sanitizedQuery = query.trim();
    if (sanitizedQuery.length === 0) {
      return NextResponse.json(
        { error: 'Query cannot be empty' },
        { status: 400 }
      );
    }

    if (sanitizedQuery.length > 500) {
      return NextResponse.json(
        { error: 'Query is too long (max 500 characters)' },
        { status: 400 }
      );
    }

    // Generate embedding for the query
    const queryEmbedding = await getEmbedding(sanitizedQuery, { type: 'query' });
    
    if (!queryEmbedding) {
      console.error('Failed to generate embedding for query:', sanitizedQuery);
      return NextResponse.json(
        { error: 'Failed to process query embedding' },
        { status: 500 }
      );
    }

    // Create Supabase client
    const supabase = createApiClient();

    // Perform RAG search to get top related items
    // Using a larger initial search to have more items to sort by price
    const { data: searchResults, error: searchError } = await supabase.rpc(
      'match_products_by_embedding_with_filter',
      {
        query_embedding: queryEmbedding,
        match_threshold: 0.3, // Lower threshold to get more results
        match_count: 20, // Get more results initially
        exclude_supermarkets: null, // No exclusions
      }
    );

    if (searchError) {
      console.error('RAG search error:', searchError);
      return NextResponse.json(
        { error: 'Failed to search products' },
        { status: 500 }
      );
    }

    if (!searchResults || searchResults.length === 0) {
      return NextResponse.json({
        results: [],
        message: 'No products found matching your query',
        query: sanitizedQuery
      });
    }

    // Convert to response format and filter valid prices
    const convertedResults: PriceSearchResult[] = [];
    
    for (const product of searchResults as ProductRow[]) {
      const converted = convertToPriceSearchResult(product);
      if (converted && converted.price > 0) {
        convertedResults.push(converted);
      }
    }

    // Sort by price from cheapest to most expensive
    convertedResults.sort((a, b) => a.price - b.price);

    // Return top 5 items
    const topFiveResults = convertedResults.slice(0, 5);

    return NextResponse.json({
      results: topFiveResults,
      total: convertedResults.length,
      query: sanitizedQuery,
      message: `Found ${topFiveResults.length} products sorted by price`
    });

  } catch (error) {
    console.error('Price search API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Handle GET requests with query parameters
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter is required' },
      { status: 400 }
    );
  }

  // Redirect to POST method by calling the same logic
  return POST(new NextRequest(request.url, {
    method: 'POST',
    body: JSON.stringify({ query }),
    headers: { 'Content-Type': 'application/json' }
  }));
}