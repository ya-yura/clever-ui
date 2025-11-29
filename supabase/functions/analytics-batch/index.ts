// supabase/functions/analytics-batch/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { z } from "https://deno.land/x/zod@v3.21.4/mod.ts"

// --- Configuration ---
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
}

// --- Zod Schema ---
const ActivityEventSchema = z.object({
  id: z.string().uuid(),
  eventType: z.string().min(1),
  timestamp: z.number().int().positive(),
  userId: z.string().optional(),
  deviceId: z.string().optional(),
  payload: z.record(z.any()).optional().default({}),
})

const BatchSchema = z.object({
  events: z.array(ActivityEventSchema).min(1).max(100),
})

// --- Main Handler ---
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  try {
    // 1. Initialize Supabase Client
    // Access environment variables directly in Deno
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 2. Parse & Validate Body
    const body = await req.json()
    const validationResult = BatchSchema.safeParse(body)

    if (!validationResult.success) {
      console.error('Validation error:', validationResult.error)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Validation failed', 
          details: validationResult.error.issues 
        }),
        { 
          status: 400, 
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { events } = validationResult.data

    // 3. Transform for DB (snake_case mapping)
    const dbEvents = events.map(e => ({
      id: e.id,
      event_type: e.eventType,
      timestamp: e.timestamp,
      user_id: e.userId,
      device_id: e.deviceId,
      payload: e.payload,
      server_received_at: new Date().toISOString()
    }))

    // 4. Batch Insert with Upsert (Ignore duplicates)
    const { error } = await supabase
      .from('activity_events')
      .upsert(dbEvents, { 
        onConflict: 'id', 
        ignoreDuplicates: true 
      })

    if (error) {
      console.error('Database error:', error)
      throw error
    }

    // 5. Success Response
    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: events.length 
      }),
      { 
        status: 200, 
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Internal error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } 
      }
    )
  }
})


