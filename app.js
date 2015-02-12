var request = require('request'),
	 xml2js = require('xml2js'),
		 jf = require('jsonfile'),
	   util = require('util');

var parser = new xml2js.Parser();

var languages = jf.readFileSync('data/languages.json');
// console.log(languages);

var services = jf.readFileSync('data/services.json');
// console.log(services);

var firstLetter = String.fromCharCode(65);

callAutocomplete(firstLetter, 'images', 'fr');


/*-------------------- FUNCTIONS --------------------*/

function callAutocomplete(query, site, language){
	
	var url = concatenateUrl(query, site, language);

	request(url, function (error, response, body) {
		// console.log(error);
		// console.log(response);
		// console.log(body);
		if (!error && response.statusCode == 200) {

			var data;
			parser.parseString(body, function (err, result) {
				data = result.toplevel.CompleteSuggestion;
			});
			// console.log(data);
			var suggestions = [];
			data.forEach(function(element, index, array){
				// console.log(element.suggestion[0]['$']['data']);
				suggestions.push(element.suggestion[0]['$']['data']);
			});		
			// console.log(suggestions);

			var newRecord = createRecord(site, language, suggestions);
			console.log(newRecord);

			var index = query.charCodeAt();
			console.log(index);
			index++;
			if(index < 91){
				var newQuery = String.fromCharCode(index);
				callAutocomplete(newQuery, 'images', 'fr');
			}
		}
	});
}

function concatenateUrl(query, site, language){
	// console.log('q: ' + query + ', site: ' + site);
	var service = services[site];
	// console.log(service);	
	var requestUrl = 'https://clients1.google.com/complete/search?' +
					 '&client=toolbar'+
					 '&q=' + query +
					 '&hl=' + language +
					 '&ds=' + service.ds;

	// console.log(requestUrl);
	return requestUrl;
}

function createRecord(site, language, suggestions){
	var date = new Date();
	var obj = {
		date: date.getTime(),
		service: site,
		language: language,
		letter: suggestions[0].charAt(0),
		results: suggestions
	};
	return obj;
}