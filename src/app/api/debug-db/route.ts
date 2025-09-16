import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase/config';
import { getEmbedding } from '@/lib/embeddings';

// Interface matching your schema
interface ProductRow {
  product_id: string;
  name: string;
  price: string;
  supermarket: string;
  quantity: string;
  promotion_description?: string;
  promotion_end_date?: string;
  product_url?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export async function GET() {
  try {
    console.log('[DB_CHECK] Starting comprehensive database and RPC check');
    
    // Test 1: Basic products table query
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('product_id, name, price, supermarket, quantity')
      .limit(3);
    
    // Test 2: Check if embedding column exists and has data
    const { data: embeddingData, error: embeddingError } = await supabase
      .from('products')
      .select('product_id, embedding')
      .not('embedding', 'is', null)
      .limit(1);
    
    // Test 3: Test embedding generation
    let embeddingTest = null;
    let embeddingTestError = null;
    try {
      const testEmbedding = await getEmbedding('apple', { type: 'query' });
      embeddingTest = {
        success: !!testEmbedding,
        length: testEmbedding?.length,
        sample: testEmbedding?.slice(0, 3)
      };
    } catch (error) {
      embeddingTestError = error instanceof Error ? error.message : 'Unknown embedding error';
    }
    
    // Test 4: Try match_products_by_embedding_with_filter RPC (the one that exists)
    let rpcTest1 = null;
    let rpcError1 = null;
    try {
      const testEmbedding = new Array(768).fill(0.1);
      const { data: rpcData1, error: rpcErr1 } = await supabase.rpc(
        'match_products_by_embedding_with_filter',
        {
          query_embedding: testEmbedding,
          match_threshold: 0.5,
          match_count: 1,
          exclude_supermarkets: null
        }
      );
      rpcTest1 = { success: !rpcErr1, resultCount: rpcData1?.length || 0, data: rpcData1?.slice(0, 2) };
      rpcError1 = rpcErr1?.message;
    } catch (error) {
      rpcError1 = error instanceof Error ? error.message : 'Unknown RPC error';
    }
    
    // Test 5: Try match_products_by_embedding_with_filter RPC
    let rpcTest2 = null;
    let rpcError2 = null;
    try {
      const testEmbedding = new Array(768).fill(0.1);
      const { data: rpcData2, error: rpcErr2 } = await supabase.rpc(
        'match_products_by_embedding_with_filter',
        {
          query_embedding: testEmbedding,
          match_threshold: 0.5,
          match_count: 1,
          exclude_supermarkets: null
        }
      );
      rpcTest2 = { success: !rpcErr2, resultCount: rpcData2?.length || 0 };
      rpcError2 = rpcErr2?.message;
    } catch (error) {
      rpcError2 = error instanceof Error ? error.message : 'Unknown RPC error';
    }
    
    // Test 6: Get table schema
    const { data: schemaData, error: schemaError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'products')
      .eq('table_schema', 'public');
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      checks: {
        productsTable: {
          success: !productsError,
          error: productsError?.message,
          sampleData: productsData?.slice(0, 2),
          recordCount: productsData?.length || 0
        },
        embeddingColumn: {
          success: !embeddingError,
          error: embeddingError?.message,
          hasEmbeddingData: (embeddingData?.length || 0) > 0,
          embeddingRecords: embeddingData?.length || 0
        },
        embeddingGeneration: {
          success: !embeddingTestError,
          error: embeddingTestError,
          details: embeddingTest
        },
        rpcFunctions: {
          match_products_by_embedding_with_filter_test1: {
            success: !rpcError1,
            error: rpcError1,
            details: rpcTest1
          },
          match_products_by_embedding_with_filter_test2: {
            success: !rpcError2,
            error: rpcError2,
            details: rpcTest2
          }
        },
        tableSchema: {
          success: !schemaError,
          error: schemaError?.message,
          columns: schemaData?.map(col => ({
            name: col.column_name,
            type: col.data_type,
            nullable: col.is_nullable === 'YES'
          }))
        }
      },
      recommendations: {
        needsRpcFunction: !!rpcError1 && !!rpcError2,
        needsEmbeddingData: (embeddingData?.length || 0) === 0,
        needsEmbeddingService: !!embeddingTestError
      }
    });
    
  } catch (error) {
    console.error('[DB_CHECK] Comprehensive check failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
