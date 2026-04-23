/**
 * High-Performance Import Script: Upload 90k+ questions into Supabase
 * 
 * Usage:
 *   npx tsx supabase/bulk-import.ts path/to/large-questions.json
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const { Chain } = require('stream-chain');
const Parser = require('stream-json/parser');
const StreamArray = require('stream-json/streamers/stream-array');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing environment variables. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const BATCH_SIZE = 1000;

async function bulkImport() {
  const jsonPath = process.argv[2];
  if (!jsonPath) {
    console.error('Please provide path to JSON file: npx tsx supabase/bulk-import.ts ./questions.json');
    process.exit(1);
  }

  console.log(`🚀 Starting bulk import from ${jsonPath}...`);
  
  const pipeline = new Chain([
    fs.createReadStream(jsonPath),
    Parser(),
    StreamArray()
  ]);


  let batch: any[] = [];
  let totalImported = 0;
  let totalProcessed = 0;

  for await (const { value } of pipeline) {
    totalProcessed++;
    
    // Normalize data
    batch.push({
      topic: value.topic,
      subtopic: value.subtopic || '',
      difficulty: value.difficulty || 'medium',
      question: value.question,
      options: value.options, // jsonb
      correct_answer: value.correctAnswer || value.correct_answer,
      explanation: value.explanation || '',
      random_id: Math.random()
    });

    if (batch.length >= BATCH_SIZE) {
      const currentBatch = [...batch];
      batch = [];
      await uploadBatch(currentBatch);
      totalImported += currentBatch.length;
      console.log(`✅ Progress: ${totalImported} / ~90,000 processed`);
    }
  }

  // Upload remaining
  if (batch.length > 0) {
    await uploadBatch(batch);
    totalImported += batch.length;
  }

  console.log(`\n🎉 Bulk import complete! Total records: ${totalImported}`);
}

async function uploadBatch(records: any[]) {
  const { error } = await supabase
    .from('questions')
    .upsert(records, { 
      onConflict: 'question', // Assuming 'question' text is unique, or add a hash column
      ignoreDuplicates: true 
    });

  if (error) {
    console.error(`❌ Error uploading batch:`, error.message);
    // If upsert fails due to unique constraint or other, try smaller chunks
    if (records.length > 1) {
       console.log('🔄 Retrying in smaller chunks...');
       for (let i = 0; i < records.length; i += 100) {
         const chunk = records.slice(i, i + 100);
         const { error: chunkError } = await supabase.from('questions').upsert(chunk, { onConflict: 'question' });
         if (chunkError) console.error(`  ❌ Chunk failed:`, chunkError.message);
       }
    }
  }
}

bulkImport().catch(console.error);
