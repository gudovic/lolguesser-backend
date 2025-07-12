const fs = require('fs');
const path = require('path');

let cachedDate = null;
let cachedChampion = null;

function getDailyChampion() {
  const today = new Date().toISOString().split('T')[0];

  if (cachedDate === today && cachedChampion) {
    return cachedChampion;
  }


  const hashString = str => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  };

  const dataPath = path.join(__dirname, '..', 'champions.json'); 
  const champList = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  const seed = hashString(today);
  const index = seed % champList.length;
  cachedChampion = champList[index];
  cachedDate = today;

  return cachedChampion;
}

module.exports = getDailyChampion;
