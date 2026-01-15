import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Guard clause: check if environment variables are defined
const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

if (!isSupabaseConfigured) {
    console.warn(
        'Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
    )
}

// Create a mock client that logs operations but doesn't crash
const createMockClient = (): SupabaseClient => {
    const mockResponse = {
        data: null,
        error: { message: 'Supabase not configured', code: 'NOT_CONFIGURED' }
    }

    const mockQueryBuilder: any = {
        select: () => mockQueryBuilder,
        insert: () => mockQueryBuilder,
        update: () => mockQueryBuilder,
        delete: () => mockQueryBuilder,
        eq: () => mockQueryBuilder,
        order: () => mockQueryBuilder,
        single: () => Promise.resolve(mockResponse),
        maybeSingle: () => Promise.resolve(mockResponse),
        then: (resolve: any) => resolve(mockResponse),
    }

    return {
        from: () => mockQueryBuilder,
    } as unknown as SupabaseClient
}

// Export the real client if configured, otherwise a mock that won't crash
export const supabase: SupabaseClient = isSupabaseConfigured
    ? createClient(supabaseUrl, supabaseAnonKey)
    : createMockClient()

export const isSupabaseReady = isSupabaseConfigured
