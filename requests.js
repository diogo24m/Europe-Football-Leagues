var request = require("request");

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

function getLeague(country) {
    const options = {
        method: 'GET',
        url: 'https://v3.football.api-sports.io/leagues?country=' + country + '&current=true&type=League',
        headers: {
            'x-rapidapi-host': 'v3.football.api-sports.io',
            'x-rapidapi-key': process.env.API_KEY
        }
    };

    return new Promise((resolve, reject) => {
        request(options, function (error, response, body) {
            if (error) {
                console.log(error);
                return resolve(null);
            }

            let json = JSON.parse(body);
            console.log(json)

            if (json.results) {
                let current = json.response[0];
                json.response.forEach(row => {
                    if (current.league.id > row.league.id)
                        current = row;
                });

                resolve(current);
            } else
                resolve(null);
        });
    });
}

function getStandings(season, league) {
    const options = {
        method: 'GET',
        url: 'https://v3.football.api-sports.io/standings?league=' + league + '&season=' + season,
        headers: {
            'x-rapidapi-host': 'v3.football.api-sports.io',
            'x-rapidapi-key': process.env.API_KEY
        }
    };

    return new Promise((resolve, reject) => {
        request(options, function (error, response, body) {
            if (error) {
                console.log(error);
                return resolve(null);
            }

            let json = JSON.parse(body);
            console.log(json)

            if (json.results) {
                let leader = json.response[0].league.standings.flat().find(item => {
                    return item.rank == 1;
                });
                resolve(leader);
            } else
                resolve(null);
        });
    });
}

const country_list = [
    { name: 'Portugal', short_name: 'PT', long: -8.21038199848332, lat: 39.62723859201575 },
    { name: 'Spain', short_name: 'ES', long: -3.7922713736689526, lat: 39.965383415568546 },
    { name: 'France', short_name: 'FR', long: 2.5761763738112378, lat: 46.70420090263105 },
    { name: 'Germany', short_name: 'DE', long: 10.377524864474472, lat: 50.9974329625674 },
    { name: 'Belgium', short_name: 'BE', long: 4.778988570619414, lat: 50.606108022121404 },
    { name: 'Netherlands', short_name: 'NL', long: 5.627349963139142, lat: 52.064302303390065 },
    { name: 'Italy', short_name: 'IT', long: 13.022695385379954, lat: 42.41515320525962 },
    { name: 'England', short_name: 'GB', long: -1.485171474150188, lat: 51.79207610027454 },
    { name: 'Austria', short_name: 'AT', long: 13.957538791043154, lat: 47.428515195435395 },
    { name: 'Bulgaria', short_name: 'BG', long: 25.259945231266478, lat: 42.659826798934745 },
    { name: 'Cyprus', short_name: 'CY', long: 33.167283003598456, lat: 34.995948537837464 },
    { name: 'Croatia', short_name: 'HR', long: 16.387459471129198, lat: 45.560862848251254 },
    { name: 'Denmark', short_name: 'DK', long: 9.104844196059718, lat: 56.272360344524714 },
    { name: 'Scotland', short_name: 'GB', long: -3.840135575508376, lat: 55.83508290749783 },
    { name: 'Slovakia', short_name: 'SK', long: 19.21700966764659, lat: 48.50957007523026 },
    { name: 'Slovenia', short_name: 'SI', long: 14.672940767213245, lat: 45.84588907190672 },
    { name: 'Greece', short_name: 'GR', long: 22.745236463194168, lat: 39.0383419010334 },
    { name: 'Hungary', short_name: 'HU', long: 19.135375461448128, lat: 46.93468044101377 },
    { name: 'Norway', short_name: 'NO', long: 9.078623231251823, lat: 61.25925392334327 },
    { name: 'Poland', short_name: 'PL', long: 19.134956371372486, lat: 52.15982294231296 },
    { name: 'Czech Rep.', short_name: 'CZ', long: 14.936468941261383, lat: 49.981473683799685 },
    { name: 'Romania', short_name: 'RO', long: 24.74921281861409, lat: 45.6900615475435 },
    { name: 'Russia', short_name: 'RU', long: 35.733627606695464, lat: 54.49308892678966 },
    { name: 'Sweden', short_name: 'SE', long: 14.391036115659775, lat: 59.48826639010216 },
    { name: 'Switzerland', short_name: 'CH', long: 7.992031412059677, lat: 46.87575933552619 },
    { name: 'Turkey', short_name: 'TR', long: 31.664450948966333, lat: 39.02230056870954 },
    { name: 'Ukraine', short_name: 'UA', long: 31.103383092774436, lat: 49.34318861471875 }
];

module.exports = function () {
    return {
        getLeagueLeaders: async function (callback) {
            let promises = country_list.map((el, idx) => new Promise(async (resolve, reject) => {
                // Respect API request limits
                if (idx > 0) await sleep(idx * 10000);

                let result = await getLeague(el.name);
                if (!result) return reject();

                let standings = await getStandings(result.seasons[0].year, result.league.id);
                if (!standings) return reject();

                let team = standings.team.name;
                let image = standings.team.logo;
                let last = '[green]' + standings.all.win + '[/] [yellow]' + standings.all.draw + '[/] [red]' + standings.all.lose + '[/]';
                let pts = standings.points;
                let games = standings.all.played;
                let teams = null;

                resolve({ country: el.name, short_name: el.short_name, long: el.long, lat: el.lat, team, image, last, pts, games, teams });
            }));

            Promise.all(promises).then(res => {
                console.log('Got data at:', new Date());

                callback(res);
            }).catch(error => {
                callback([]);
            });
        }
    }
}