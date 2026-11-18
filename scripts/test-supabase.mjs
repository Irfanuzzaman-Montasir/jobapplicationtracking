import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Load .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local')
let envConfig = {}
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf-8')
  content.split('\n').forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/)
    if (match) {
      envConfig[match[1].trim()] = match[2].trim()
    }
  })
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || envConfig.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('--- Checking Supabase Configuration ---')
console.log('Supabase URL:', supabaseUrl ? (supabaseUrl.startsWith('http') && !supabaseUrl.includes('your_supabase_project_url') ? supabaseUrl : '[Not set or placeholder]') : '[Missing]')
console.log('Anon Key:', supabaseAnonKey ? (!supabaseAnonKey.includes('your_supabase_anon_key') ? '[Key provided]' : '[Placeholder]') : '[Missing]')

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your_supabase_project_url') || supabaseAnonKey.includes('your_supabase_anon_key')) {
  console.log('\n❌ Supabase credentials in .env.local are currently placeholders.')
  console.log('Please paste your real Supabase Project URL and Anon Key into .env.local.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  console.log('\nTesting connection to Supabase...')
  
  // 1. SELECT
  const { data: selectData, error: selectError } = await supabase
    .from('applications')
    .select('*')
    .limit(5)

  if (selectError) {
    console.error('❌ Failed to query applications table:', selectError.message)
    if (selectError.message.includes('relation "public.applications" does not exist')) {
      console.log('👉 Make sure you ran the SQL from supabase/schema.sql in your Supabase SQL Editor!')
    }
    process.exit(1)
  }

  console.log(`✅ Successfully queried 'applications' table! Found ${selectData.length} records.`)

  // 2. INSERT
  console.log('Testing INSERT operation...')
  const testApp = {
    company_name: '__Test Company__',
    position: 'QA Engineer',
    application_date: new Date().toISOString().split('T')[0],
    response_received: false,
    response_outcome: 'na',
    job_type: 'remote',
    application_source: 'website',
    comments: 'Automated test record',
  }

  const { data: insertData, error: insertError } = await supabase
    .from('applications')
    .insert([testApp])
    .select()
    .single()

  if (insertError) {
    console.error('❌ Failed to insert test application:', insertError.message)
    process.exit(1)
  }
  console.log('✅ Successfully inserted test record with ID:', insertData.id)

  // 3. UPDATE
  console.log('Testing UPDATE operation...')
  const { error: updateError } = await supabase
    .from('applications')
    .update({ comments: 'Automated test record - updated' })
    .eq('id', insertData.id)

  if (updateError) {
    console.error('❌ Failed to update test application:', updateError.message)
    process.exit(1)
  }
  console.log('✅ Successfully updated test record!')

  // 4. DELETE
  console.log('Testing DELETE operation...')
  const { error: deleteError } = await supabase
    .from('applications')
    .delete()
    .eq('id', insertData.id)

  if (deleteError) {
    console.error('❌ Failed to delete test application:', deleteError.message)
    process.exit(1)
  }
  console.log('✅ Successfully cleaned up test record!')

  console.log('\n🎉 ALL SUPABASE CRUD OPERATIONS VERIFIED SUCCESSFULLY!')
}

testConnection().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
