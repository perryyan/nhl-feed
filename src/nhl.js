const moment = require('moment');

var gameScores = [];

module.exports = {
    getNHLScoreboard: function() {
        const RxHttpRequest = require('rx-http-request').RxHttpRequest;
        var date = moment().format('YYYY-MM-DD');
        var observables = [];

        var gameIdsObservable = RxHttpRequest.get(`https://statsapi.web.nhl.com/api/v1/schedule?startDate=${date}&endDate=${date}`)
        .mergeMap( (data) => {
            var games = JSON.parse(data.body).dates[0].games;
            games.forEach( (game) => {
                var id = game.gamePk;
                observables.push( RxHttpRequest.get(`https://statsapi.web.nhl.com/api/v1/game/${id}/feed/live`) );
            });
            return observables;
        })
        .subscribe( 
            (data) => {
                data.subscribe( x => {
                    var linescore = JSON.parse(x.body).liveData.linescore;
                    var gameData = JSON.parse(x.body).gameData;
                    gameScores.push( 
                        {
                            "gameStatus": gameData.status.abstractGameState,
                            "gameStartTime": gameData.datetime.dateTime,
                            "currentPeriod": linescore.currentPeriodOrdinal,
                            "currentPeriodTimeRemaining": linescore.currentPeriodTimeRemaining,
                            "awayTeam": { 
                                "shortName": linescore.teams.away.team.triCode,
                                "goals": linescore.teams.away.goals,
                                "shots": linescore.teams.away.shotsOnGoal,
                                "powerPlay": linescore.teams.away.powerPlay
                            },
                            "homeTeam": { 
                                "shortName": linescore.teams.home.team.triCode,
                                "goals": linescore.teams.home.goals,
                                "shots": linescore.teams.home.shotsOnGoal,
                                "powerPlay": linescore.teams.home.powerPlay
                            }
                        }
                    );
                },
                (error) => console.error(error),
                () => {} 
            );
        },
        (error) => console.error(error),
        () => {}
     );
    },

    // Prints the following format
    // ANA 3 (SOG 10) [PP]  LAK 0 (SOG 10) [PP] / 19:21 2nd 
    getFormattedGameScores: function() {
        var output = '';
        gameScores.forEach( (game) => {
            output += '\n' + game.awayTeam.shortName + ' ' + game.awayTeam.goals + ' (SOG ' + game.awayTeam.shots + ')' + ( game.awayTeam.powerPlay ? '[PP]' : '' );
            output += '  ' + game.homeTeam.shortName + ' ' + game.homeTeam.goals + ' (SOG ' + game.homeTeam.shots + ')' + ( game.awayTeam.powerPlay ? '[PP]' : '' );
            
            if( game.gameStatus === 'Live' ) {
                output += ' / ' + game.currentPeriodTimeRemaining + ' ' + game.currentPeriod;
            }
            else if( game.gameStatus === 'Preview' ) {
                output += ' / Start ' + moment( game.gameStartTime ).format('h:mm A');
            }
            else {
                output += ' / ' + game.gameStatus;
            }
        });
        return output;
    }
};
