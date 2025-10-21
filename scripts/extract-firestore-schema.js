#!/usr/bin/env node

/**
 * Extract Firestore Schema from Production Database
 * 
 * This script connects to the production Firestore database (portfolio)
 * and extracts the schema by sampling documents from each collection.
 * 
 * Usage:
 *   node scripts/extract-firestore-schema.js
 * 
 * Output:
 *   Generates a JSON file with the schema structure that can be used
 *   to create TypeScript interfaces in the shared-types package.
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin with service account
const serviceAccountPath = path.join(__dirname, '..', '.firebase', 'serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Service account key not found at:', serviceAccountPath);
  console.error('   Please ensure .firebase/serviceAccountKey.json exists');
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

// Use the production database
// Initialize with explicit database ID
const db = admin.firestore();
// For named databases in Firestore, we need to create a new settings object
db.settings({
  databaseId: 'portfolio'
});

console.log('🔥 Connected to Firestore database: portfolio (production)');
console.log('');

/**
 * Known collections in the database
 */
const COLLECTIONS = [
  'job-queue',
  'job-matches',
  'companies',
  'content-items',
  'generator-documents',
  'blurbs',
  'experiences',
  'contact-submissions',
  'config',
  'users'
];

/**
 * Get the type of a value
 */
function getType(value) {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (Array.isArray(value)) {
    if (value.length === 0) return 'array';
    // Get unique types in array
    const types = [...new Set(value.map(v => getType(v)))];
    return types.length === 1 ? `${types[0]}[]` : 'array';
  }
  if (value instanceof Date) return 'Date';
  if (value && typeof value === 'object' && value._seconds !== undefined) {
    return 'Timestamp';
  }
  if (typeof value === 'object') return 'object';
  return typeof value;
}

/**
 * Analyze a document to extract its schema
 */
function analyzeDocument(doc) {
  const data = doc.data();
  const schema = {};
  
  for (const [key, value] of Object.entries(data)) {
    const type = getType(value);
    schema[key] = {
      type,
      nullable: value === null,
      sample: type === 'object' || type === 'array' ? 
        JSON.stringify(value, null, 2).substring(0, 200) : 
        String(value).substring(0, 100)
    };
    
    // For nested objects, recursively analyze
    if (type === 'object' && value !== null) {
      schema[key].properties = {};
      for (const [nestedKey, nestedValue] of Object.entries(value)) {
        schema[key].properties[nestedKey] = {
          type: getType(nestedValue),
          nullable: nestedValue === null
        };
      }
    }
  }
  
  return schema;
}

/**
 * Merge multiple schemas to find all possible fields
 */
function mergeSchemas(schemas) {
  const merged = {};
  
  for (const schema of schemas) {
    for (const [field, info] of Object.entries(schema)) {
      if (!merged[field]) {
        merged[field] = {
          types: new Set([info.type]),
          nullable: info.nullable,
          samples: [info.sample],
          properties: info.properties || {}
        };
      } else {
        merged[field].types.add(info.type);
        merged[field].nullable = merged[field].nullable || info.nullable;
        if (!merged[field].samples.includes(info.sample)) {
          merged[field].samples.push(info.sample);
        }
        if (info.properties) {
          merged[field].properties = {
            ...merged[field].properties,
            ...info.properties
          };
        }
      }
    }
  }
  
  // Convert Sets to Arrays for JSON serialization
  for (const field of Object.keys(merged)) {
    merged[field].types = Array.from(merged[field].types);
  }
  
  return merged;
}

/**
 * Extract schema from a collection
 */
async function extractCollectionSchema(collectionName) {
  console.log(`📦 Analyzing collection: ${collectionName}`);
  
  try {
    const snapshot = await db.collection(collectionName).limit(50).get();
    
    if (snapshot.empty) {
      console.log(`   ⚠️  Collection is empty`);
      return null;
    }
    
    console.log(`   Found ${snapshot.size} documents`);
    
    const schemas = [];
    snapshot.forEach(doc => {
      schemas.push(analyzeDocument(doc));
    });
    
    const mergedSchema = mergeSchemas(schemas);
    console.log(`   ✅ Extracted ${Object.keys(mergedSchema).length} unique fields`);
    
    return {
      collectionName,
      documentCount: snapshot.size,
      schema: mergedSchema
    };
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return null;
  }
}

/**
 * Main execution
 */
async function main() {
  const results = {};
  
  for (const collection of COLLECTIONS) {
    const schema = await extractCollectionSchema(collection);
    if (schema) {
      results[collection] = schema;
    }
    console.log('');
  }
  
  // Save results to file
  const outputPath = path.join(__dirname, '..', 'firestore-schema-extracted.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  
  console.log('✅ Schema extraction complete!');
  console.log(`📄 Results saved to: ${outputPath}`);
  console.log('');
  console.log('Next steps:');
  console.log('1. Review the extracted schema');
  console.log('2. Create TypeScript interfaces in job-finder-shared-types');
  console.log('3. Update the shared-types package version');
  
  // Cleanup
  await admin.app().delete();
}

// Run
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

