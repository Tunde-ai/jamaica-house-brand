#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applySchema() {
  try {
    console.log('Reading schema file...')
    const schemaPath = path.join(__dirname, 'database', 'schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')

    console.log('Applying schema to Supabase...')

    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('/*'))

    console.log(`Found ${statements.length} SQL statements to execute`)

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'
      console.log(`Executing statement ${i + 1}/${statements.length}...`)

      const { data, error } = await supabase.rpc('exec_sql', { sql: statement })

      if (error) {
        console.error(`Error in statement ${i + 1}:`, error)
        // Continue with other statements - some might be CREATE IF NOT EXISTS
      } else {
        console.log(`✓ Statement ${i + 1} executed successfully`)
      }
    }

    console.log('\nSchema application completed!')
    console.log('Testing database connection...')

    // Test the connection by querying a table
    const { data: customers, error: testError } = await supabase
      .from('customers')
      .select('*')
      .limit(1)

    if (testError) {
      console.error('Test query failed:', testError)
    } else {
      console.log('✓ Database connection test successful!')
    }

  } catch (error) {
    console.error('Failed to apply schema:', error)
    process.exit(1)
  }
}

applySchema()