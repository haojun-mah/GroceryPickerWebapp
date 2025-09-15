import { NextRequest, NextResponse } from 'next/server';
import { createApiClient } from '@/lib/supabase/server';
import { getEmbedding } from '@/lib/embeddings';

// Database interface for products (matching your actual schema)
interface ProductRow {
  product_id: string;
  name: string;
  price: string; // Note: price is text in your database
  supermarket: string;
  quantity: string;
  promotion_description?: string;
  promotion_end_date?: string;
  product_url?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

// Frontend suggestion interface
interface Suggestion {
  id: string;
  name: string;
  price: number;
  store: string;
  quantity: string;
  promotion?: string;
}

// Convert database row to suggestion format
function convertToSuggestion(product: ProductRow): Suggestion {
  return {
    id: product.product_id,
    name: product.name,
    price: parseFloat(product.price) || 0, // Convert string price to number
    store: product.supermarket,
    quantity: product.quantity,
    promotion: product.promotion_description,
  };
}

// Mock suggestions data for fallback
const mockSuggestions = [
  {
    id: "1",
    name: "Red Apples",
    price: 2.99,
    store: "Fresh Market",
    quantity: "Per lb",
    promotion: "Fresh Produce"
  },
  {
    id: "2",
    name: "Apple Juice",
    price: 3.49,
    store: "SuperMart",
    quantity: "64oz",
    promotion: "Beverages"
  },
  {
    id: "3",
    name: "Apple Pie",
    price: 8.99,
    store: "Corner Store",
    quantity: "9inch",
    promotion: "Bakery Special"
  },
  {
    id: "4",
    name: "Green Apples",
    price: 3.25,
    store: "Fresh Market",
    quantity: "Per lb",
    promotion: "Fresh Produce"
  },
  {
    id: "5",
    name: "Organic Bananas",
    price: 2.99,
    store: "Fresh Market",
    quantity: "Per lb",
    promotion: "Organic Special"
  },
  {
    id: "6", 
    name: "Whole Milk",
    price: 3.49,
    store: "SuperMart",
    quantity: "1 Gallon",
    promotion: "Dairy"
  },
  {
    id: "7",
    name: "Orange Juice",
    price: 4.29,
    store: "Corner Store",
    quantity: "64oz",
    promotion: "Fresh Squeezed"
  },
  {
    id: "8",
    name: "Pasta Sauce",
    price: 2.49,
    store: "SuperMart",
    quantity: "24oz",
    promotion: "Italian Style"
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '5');

    console.log(`[SUGGESTIONS] Starting suggestions request for: "${query}", limit: ${limit}`);

    if (!query.trim() || query.length < 2) {
      console.log('[SUGGESTIONS] Query too short, returning empty array');
      return NextResponse.json([]);
    }

    try {
      // Step 1: Get Supabase client
      console.log('[SUGGESTIONS] Step 1: Creating Supabase client');
      const supabase = createApiClient();
      console.log('[SUGGESTIONS] Supabase client created successfully');
      
      // Step 2: Perform regex/text search first (for quick autocomplete)
      console.log('[SUGGESTIONS] Step 2: Performing text search');
      const searchTerms = query.toLowerCase().split(' ');
      console.log('[SUGGESTIONS] Search terms:', searchTerms);
      
      const { data: textResults, error: textError } = await supabase
        .from('products')
        .select('product_id, name, price, supermarket, quantity, promotion_description')
        .or(
          searchTerms.map(term => 
            `name.ilike.%${term}%`
          ).join(',')
        )
        .limit(Math.min(limit, 10)); // Limit for performance
        
      if (textError) {
        console.error('[SUGGESTIONS] Text search error:', textError);
        console.error('[SUGGESTIONS] Text error details:', JSON.stringify(textError, null, 2));
      } else {
        console.log(`[SUGGESTIONS] Text search returned ${textResults?.length || 0} results`);
      }

      console.log('[SUGGESTIONS] Step 3: Processing text search results');
      let suggestions: Suggestion[] = [];
      const seenProductIds = new Set<string>();

      // Add regex matches first
      if (textResults && !textError) {
        console.log(`[SUGGESTIONS] Processing ${textResults.length} text results`);
        for (const product of textResults as ProductRow[]) {
          if (suggestions.length >= limit) break;
          if (!seenProductIds.has(product.product_id)) {
            seenProductIds.add(product.product_id);
            suggestions.push(convertToSuggestion(product));
          }
        }
        console.log(`[SUGGESTIONS] Added ${suggestions.length} text-based suggestions`);
      } else {
        console.log('[SUGGESTIONS] No text results to process');
      }

      // Step 4: If we have fewer than requested, use semantic search to fill up
      if (suggestions.length < limit) {
        console.log(`[SUGGESTIONS] Step 4: Need more suggestions (${suggestions.length}/${limit}), trying semantic search`);
        
        console.log('[SUGGESTIONS] Generating embedding for semantic search');
        const queryEmbedding = await getEmbedding(query, { type: 'query' });
        
        if (queryEmbedding) {
          console.log(`[SUGGESTIONS] Embedding generated successfully, length: ${queryEmbedding.length}`);
          
          const { data: semanticResults, error: semanticError } = await supabase.rpc(
            'match_products_by_embedding',
            {
              query_embedding: queryEmbedding,
              match_threshold: 0.6, // Higher threshold for suggestions
              match_count: limit - suggestions.length + 2, // Get a few extra for deduplication
            }
          );

          if (semanticError) {
            console.error('[SUGGESTIONS] Semantic search error:', semanticError);
            console.error('[SUGGESTIONS] Semantic error details:', JSON.stringify(semanticError, null, 2));
          } else {
            console.log(`[SUGGESTIONS] Semantic search returned ${semanticResults?.length || 0} results`);
          }

          if (semanticResults && !semanticError) {
            console.log(`[SUGGESTIONS] Processing ${semanticResults.length} semantic results`);
            for (const product of semanticResults as ProductRow[]) {
              if (suggestions.length >= limit) break;
              if (!seenProductIds.has(product.product_id)) {
                seenProductIds.add(product.product_id);
                suggestions.push(convertToSuggestion(product));
              }
            }
            console.log(`[SUGGESTIONS] Total suggestions after semantic search: ${suggestions.length}`);
          }
        } else {
          console.warn('[SUGGESTIONS] Failed to generate embedding for semantic search');
        }
      } else {
        console.log(`[SUGGESTIONS] Already have enough suggestions (${suggestions.length}/${limit}), skipping semantic search`);
      }

      console.log(`[SUGGESTIONS] Final result: returning ${suggestions.length} suggestions from database`);
      console.log('[SUGGESTIONS] Final suggestions:', suggestions.map(s => `${s.name} ($${s.price})`));
      return NextResponse.json(suggestions);

    } catch (dbError) {
      console.error('[SUGGESTIONS] Database error, falling back to mock data:', dbError);
      console.error('[SUGGESTIONS] DB error details:', JSON.stringify(dbError, null, 2));
      
      // Fallback to mock data
      console.log('[SUGGESTIONS] Step 5: Using mock data fallback');
      const filteredSuggestions = mockSuggestions
        .filter(item => 
          item.name.toLowerCase().includes(query.toLowerCase()) ||
          item.store.toLowerCase().includes(query.toLowerCase()) ||
          (item.promotion && item.promotion.toLowerCase().includes(query.toLowerCase()))
        )
        .slice(0, limit);
      
      console.log(`[SUGGESTIONS] Returning ${filteredSuggestions.length} mock suggestions`);
      console.log('[SUGGESTIONS] Mock suggestions:', filteredSuggestions.map(s => `${s.name} ($${s.price})`));
      return NextResponse.json(filteredSuggestions);
    }

  } catch (error) {
    console.error('[SUGGESTIONS] Top-level API error:', error);
    console.error('[SUGGESTIONS] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
