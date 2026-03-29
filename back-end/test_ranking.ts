import { calculateHotScore } from './src/lib/algorithms/ranking';

function testHotScore() {
  console.log("🧪 Testing Hot Score Algorithm (Gravity 1.8)\n");

  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Case 1: Fresh photo with 5 votes
  const score1 = calculateHotScore(5, 0, oneHourAgo);
  
  // Case 2: 1-day old photo with 50 votes
  const score2 = calculateHotScore(50, 0, oneDayAgo);
  
  // Case 3: 1-week old photo with 500 votes
  const score3 = calculateHotScore(500, 0, oneWeekAgo);

  console.log(`📸 Photo 1 (1h ago, 5 upvotes):   Score = ${score1.toFixed(4)}`);
  console.log(`📸 Photo 2 (24h ago, 50 upvotes): Score = ${score2.toFixed(4)}`);
  console.log(`📸 Photo 3 (7d ago, 500 upvotes):  Score = ${score3.toFixed(4)}`);

  if (score1 > score2) {
    console.log("\n✅ Success: Fresh content outranks yesterday's popular content.");
  } else {
    console.log("\nℹ️  Moderate decay: Popularity still wins over extreme freshness.");
  }
}

testHotScore();
