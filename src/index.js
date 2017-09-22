var nhl = require('./nhl.js');
var RxHttpRequest = require('rx-http-request').RxHttpRequest;

nhl.getNHLScoreboard( RxHttpRequest );
setTimeout( () => {
    console.dir( nhl.getFormattedGameScores() );
}, 5000 );
