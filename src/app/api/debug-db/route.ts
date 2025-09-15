import { NextResponse } from 'next/server';
import { createApiClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createApiClient();
    
    console.log('[DB_CHECK] Starting database capabilities check');
    
    // Test 1: Check if products table exists and has data
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('count')
      .single();
    
    // Test 2: Try to call the RPC function to see if it exists
    const { data: functionsData, error: functionsError } = await supabase
      .rpc('match_products_by_embedding', {
        query_embedding: new Array(768).fill(0.1),
        match_threshold: 0.5,
        match_count: 1
      });
    
    // Test 3: Check if pgvector extension is available
    const { data: extensionsData, error: extensionsError } = await supabase
      .from('pg_extension')
      .select('extname')
      .eq('extname', 'vector');
    
    // Test 4: Check what columns exist in products table
    const { data: columnsData, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'products');
    
    // Test 5: Sample product data
    const { data: sampleData, error: sampleError } = await supabase
      .from('products')
      .select('*')
      .limit(1)
      .single();
    
    return NextResponse.json({
      success: true,
      checks: {
        productsTable: {
          hasData: !productsError,
          error: productsError?.message,
          count: productsData
        },
        rpcFunction: {
          exists: !functionsError,
          error: functionsError?.message
        },
        pgvectorExtension: {
          enabled: !extensionsError && extensionsData?.length > 0,
          error: extensionsError?.message
        },
        tableStructure: {
          columns: columnsData,
          error: columnsError?.message
        },
        sampleData: {
          data: sampleData,
          error: sampleError?.message
        }
      }
    });
    
  } catch (error) {
    console.error('[DB_CHECK] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
