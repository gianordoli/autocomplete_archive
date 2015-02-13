var request = require('request'),
		 jf = require('jsonfile'),
	   util = require('util'),
	  iconv = require('iconv-lite');

var languages = jf.readFileSync('data/languages.json');
// console.log(languages);

var services = jf.readFileSync('data/services.json');
// console.log(services);

var dailySearch = [];

var service = services[0];
var firstLetter = String.fromCharCode(65);
// callAutocomplete(firstLetter, service, 'en');

callAutocomplete('U', services[6], 'en');


/*-------------------- MAIN FUNCTION --------------------*/

function callAutocomplete(query, service, language){

	var url = {
		uri: concatenateUrl(query, service, language),
		encoding: null
	};

	request(url, function (error, response, body) {
		// console.log(error);
		// console.log(response);
		// console.log(body);

		if (!error && response.statusCode == 200) {

			var charset = getCharset(response);
			// console.log(charset);

			var data = JSON.parse(iconv.decode(body, 'ISO-8859-1'));
			// console.log(data);
			var suggestions = data[1];
			// console.log(suggestions);
			// console.log(suggestions.length);

			// If there's any suggestion at all...
			if(suggestions.length > 0){

				// Create a new record and save
				var newRecord = createRecord(service, language, suggestions);
				console.log(newRecord);

				// Save current result
				dailySearch.push(newRecord);
			}

			// Next iteration
			var letterIndex = query.charCodeAt();
			var serviceIndex = parseInt(currIndex(service, services));

			// New letter
			if(letterIndex < 90){
				letterIndex++;
				var newQuery = String.fromCharCode(letterIndex);
				callAutocomplete(newQuery, service, language);
			}

			// New service
			else if(serviceIndex < services.length - 1){
				var newQuery = String.fromCharCode(65);
				var newService = services[serviceIndex + 1];
				// console.log('called letter ['+newQuery+'] in ['+newService+']');
				callAutocomplete(newQuery, newService, language);
			
			
			}

			// End
			else{
				// console.log(dailySearch);				
				saveToDB();
			}
		}
	});
}

/*-------------------- FUNCTIONS --------------------*/

// Creates url for reqquest, concatenating the parameters
function concatenateUrl(query, service, language){
	// console.log(service.ds);	
	var requestUrl = 'https://clients1.google.com/complete/search?' +
					 '&client=firefox'+
					 '&q=' + query +
					 '&hl=' + language +
					 '&ds=' + service.ds;

	// console.log(requestUrl);
	return requestUrl;
}

// Returns a record
function createRecord(service, language, suggestions){

	var obj = {
		date: new Date(),
		site: service.site,
		language: language,
		letter: suggestions[0].charAt(0),
		results: suggestions
	};
	return obj;
}

// Returns the current index of a given object inside an array.
// Utilized here to check if all services
// and languages were already retrieved
function currIndex(obj, array){
	for(var i = 0; i < array.length; i++){
		// console.log(i);
		if(array[i] == obj){
			return i;
		}		
	}
}

// Scrapes the server's response to detect the charset
function getCharset(response){
	var headers = response.headers;
	var contentType = headers['content-type'];
	var charset = contentType.substring(contentType.lastIndexOf('=') + 1);
	// console.log(charset);
	return charset;
}

// Saves results to file
function saveToDB(){
	console.log('-----------------------------------------');
	var file = 'db/data.json'
	var obj = dailySearch;
	 
	jf.writeFile(file, obj, function(err) {
	  // console.log(err);
	  if(!err){
	  	console.log('Results successfully saved at ' + file);
	  }
	});
}
