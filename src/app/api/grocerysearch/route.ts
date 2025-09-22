import { NextRequest, NextResponse } from 'next/server';
import { createApiClient } from '@/lib/supabase/server';
import { getEmbedding } from '@/lib/embeddings';

// Database interface for products (matching actual schema)
interface ProductRow {
  product_id: string;
  name: string;
  price: string;
  supermarket: string;
  quantity: string;
  promotion_description?: string;
  product_url?: string;
  image_url?: string;
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

interface SearchResponse {
  results: GroceryItem[];
  query: string;
  resultCount: number;
  searchMethod: 'semantic' | 'text' | 'empty' | 'error';
  message?: string;
}

// Convert database row to frontend format
function convertToGroceryItem(product: ProductRow): GroceryItem {
  return {
    id: product.product_id,
    name: product.name,
    price: product.price || 'Price not available',
    store: product.supermarket,
    quantity: product.quantity,
    description: product.promotion_description,
    imageUrl: product.image_url,
    productUrl: product.product_url,
    promotion: product.promotion_description,
  };
}



export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10');
    const supermarket = searchParams.get('supermarket');
    
    console.log(`[SEARCH] Starting embedding-only search for: "${query}", limit: ${limit}`);

    if (!query.trim()) {
      console.log('[SEARCH] Empty query');
      return NextResponse.json({
        results: [],
        query: '',
        resultCount: 0,
        searchMethod: 'empty'
      } as SearchResponse);
    }

    try {
      console.log('[SEARCH] Creating Supabase client');
      const supabase = createApiClient();
      
      console.log('[SEARCH] Generating embedding for query');
      const queryEmbedding = await getEmbedding(query, { type: 'query' });
      
      if (!queryEmbedding) {
        console.warn('[SEARCH] Failed to generate embedding');
        return NextResponse.json({
          results: [],
          query,
          resultCount: 0,
          searchMethod: 'error',
          message: 'Failed to generate embedding'
        } as SearchResponse);
      }
      
      console.log(`[SEARCH] Embedding generated, length: ${queryEmbedding.length}`);

      console.log('[SEARCH] Performing embedding search');
      const { data: semanticResults, error: semanticError } = await supabase.rpc(
        'match_products_by_embedding_with_filter',
        {
          query_embedding: queryEmbedding,
          match_threshold: 0.5,
          match_count: limit,
          exclude_supermarkets: null
        }
      );

      if (semanticError) {
        console.error('[SEARCH] Semantic search error:', semanticError);
        return NextResponse.json({
          results: [],
          query,
          resultCount: 0,
          searchMethod: 'error',
          message: 'Semantic search failed'
        } as SearchResponse);
      }

      console.log(`[SEARCH] Embedding search returned ${semanticResults?.length || 0} results`);

      if (!semanticResults || semanticResults.length === 0) {
        console.log('[SEARCH] No embedding results found');
        return NextResponse.json({
          results: [],
          query,
          resultCount: 0,
          searchMethod: 'semantic'
        } as SearchResponse);
      }

      let filteredProducts = semanticResults as ProductRow[];
      if (supermarket) {
        filteredProducts = filteredProducts.filter(product => 
          product.supermarket.toLowerCase().includes(supermarket.toLowerCase())
        );
        console.log(`[SEARCH] Filtered to ${supermarket}: ${filteredProducts.length} results`);
      }

      console.log('[SEARCH] Using semantic similarity ranking (database already ranked by relevance)');
      // Take only the requested limit since results are already ranked by semantic similarity
      const rankedProducts = filteredProducts.slice(0, limit);
      const finalResults = rankedProducts.map((product: ProductRow) => convertToGroceryItem(product));

      console.log(`[SEARCH] Final results: ${finalResults.length} products ranked by semantic similarity`);

      return NextResponse.json({
        results: finalResults,
        query,
        resultCount: finalResults.length,
        searchMethod: 'semantic'
      } as SearchResponse);

    } catch (dbError) {
      console.error('[SEARCH] Database error:', dbError);
      return NextResponse.json({
        results: [],
        query,
        resultCount: 0,
        searchMethod: 'error',
        message: 'Database error'
      } as SearchResponse);
    }

  } catch (error) {
    console.error('[SEARCH] Top-level error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query = '', limit = 10, supermarket } = body;
    
    if (typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query must be a string' },
        { status: 400 }
      );
    }

    const searchParams = new URLSearchParams();
    searchParams.set('q', query);
    searchParams.set('limit', limit.toString());
    if (supermarket) searchParams.set('supermarket', supermarket);
    
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
        error: 'Invalid request body'
      },
      { status: 400 }
    );
  }
}
