var nhl = require('./nhl.js');

nhl.getNHLScoreboard();
setTimeout( () => {
    console.dir( nhl.getFormattedGameScores() );
}, 5000 );
