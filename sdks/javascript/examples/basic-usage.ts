/**
 * Basic usage example for Guardian API JavaScript/TypeScript SDK
 */
import { GuardianClient, GuardianAPIError } from '../src';

async function main() {
  // Initialize client
  const client = new GuardianClient({
    baseUrl: 'http://localhost:8000'
  });

  console.log('=== Guardian API JavaScript/TypeScript SDK Example ===\n');

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

  // Get model info
  console.log('2. Getting model information...');
  try {
    const models = await client.getModels();
    for (const model of models.models) {
      const status = model.loaded ? '✓' : '✗';
      console.log(`   ${status} ${model.name} (v${model.version})`);
    }
    console.log();
  } catch (error) {
    if (error instanceof GuardianAPIError) {
      console.log(`   Error: ${error.message}\n`);
    }
  }

  // Moderate single text
  console.log('3. Moderating single text...');
  const testTexts = [
    'This is a completely normal and harmless message.',
    'Women are terrible at coding and should stick to cooking.',
    'You\'re an idiot and I hope you fail at everything.'
  ];

  for (const text of testTexts) {
    try {
      const result = await client.moderateText(text);
      const score = result.ensemble.score;
      const severity = result.ensemble.severity;
      const primaryIssue = result.ensemble.primary_issue;

      console.log(`   Text: ${text.substring(0, 50)}...`);
      console.log(`   Score: ${score.toFixed(3)} | Severity: ${severity} | Issue: ${primaryIssue}`);
      console.log(`   Summary: ${result.ensemble.summary}`);
      console.log();
    } catch (error) {
      if (error instanceof GuardianAPIError) {
        console.log(`   Error: ${error.message}\n`);
      }
    }
  }

  // Batch moderation
  console.log('4. Batch moderation...');
  try {
    const batchResult = await client.moderateBatch(testTexts);
    console.log(`   Processed: ${batchResult.total_processed} texts`);
    console.log(`   Time: ${batchResult.processing_time_ms}ms`);
    console.log();

    for (let i = 0; i < batchResult.results.length; i++) {
      const result = batchResult.results[i];
      console.log(`   Text ${i + 1}: Score ${result.ensemble.score.toFixed(3)}`);
    }
  } catch (error) {
    if (error instanceof GuardianAPIError) {
      console.log(`   Error: ${error.message}\n`);
    }
  }

  // Health check
  console.log('5. Quick health check...');
  const isHealthy = await client.isHealthy();
  console.log(`   API is ${isHealthy ? 'healthy' : 'unhealthy'}\n`);
}

main().catch(console.error);

