/**
 * Basic usage example for Guardian API JavaScript SDK (CommonJS)
 */
const { GuardianClient, GuardianAPIError } = require('../dist');

async function main() {
  // Initialize client
  const client = new GuardianClient({
    baseUrl: 'http://localhost:8000'
  });

  console.log('=== Guardian API JavaScript SDK Example ===\n');

  // Check health
  console.log('1. Checking API health...');
  try {
    const health = await client.healthCheck();
    console.log(`   Status: ${health.status}`);
    console.log(`   Version: ${health.version}`);
    console.log(`   Models loaded: ${health.models_loaded}\n`);
  } catch (error) {
    if (error instanceof GuardianAPIError) {
      console.log(`   Error: ${error.message}\n`);
    }
    return;
  }

  // Moderate single text
  console.log('2. Moderating text...');
  try {
    const result = await client.moderateText('This is a test message');
    console.log(`   Score: ${result.ensemble.score.toFixed(3)}`);
    console.log(`   Severity: ${result.ensemble.severity}`);
    console.log(`   Primary Issue: ${result.ensemble.primary_issue}\n`);
  } catch (error) {
    if (error instanceof GuardianAPIError) {
      console.log(`   Error: ${error.message}\n`);
    }
  }

  // Batch moderation
  console.log('3. Batch moderation...');
  try {
    const batchResult = await client.moderateBatch([
      'Normal text',
      'Harmful text'
    ]);
    console.log(`   Processed: ${batchResult.total_processed} texts`);
    for (let i = 0; i < batchResult.results.length; i++) {
      console.log(`   Text ${i + 1}: Score ${batchResult.results[i].ensemble.score.toFixed(3)}`);
    }
  } catch (error) {
    if (error instanceof GuardianAPIError) {
      console.log(`   Error: ${error.message}\n`);
    }
  }
}

main().catch(console.error);

