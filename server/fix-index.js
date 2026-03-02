// Quick script to fix stale seatmaps index
require('dotenv').config();
const mongoose = require('mongoose');

async function fix() {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  const col = db.collection('seatmaps');

  const indexes = await col.indexes();
  console.log('Current indexes:');
  indexes.forEach(i => console.log(' ', i.name, JSON.stringify(i.key)));

  // Drop stale 2-field indexes that don't include showDate
  for (const idx of indexes) {
    const keys = Object.keys(idx.key);
    const hasMovie = keys.includes('movie');
    const hasShowTime = keys.includes('showTime');
    const hasShowDate = keys.includes('showDate');
    if (hasMovie && hasShowTime && !hasShowDate) {
      console.log('Dropping stale index:', idx.name);
      await col.dropIndex(idx.name);
    }
  }

  const after = await col.indexes();
  console.log('\nIndexes after cleanup:');
  after.forEach(i => console.log(' ', i.name, JSON.stringify(i.key)));

  await mongoose.disconnect();
  console.log('\nDone');
}

fix().catch(e => { console.error(e); process.exit(1); });