var request = require('request'),
		 jf = require('jsonfile'),
	   util = require('util'),
	  iconv = require('iconv-lite');

var languages = jf.readFileSync('data/languages.json');
// console.log(languages);

var services = jf.readFileSync('data/services.json');
// console.log(services);

var firstLetter = String.fromCharCode(65);
// var site = 

var dailySearch = [];

callAutocomplete(firstLetter, services[1], 'fr');


/*-------------------- FUNCTIONS --------------------*/

function callAutocomplete(query, service, language){
	
	console.log(concatenateUrl(query, service, language));

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

			var newRecord = createRecord(service, language, suggestions);
			console.log(newRecord);

			// Save current result
			dailySearch.push(newRecord);

			// new iteration
			var index = query.charCodeAt();
			// console.log(index);
			index++;
			if(index < 91){			
					var newQuery = String.fromCharCode(index);
					callAutocomplete(newQuery, service, language);
			}else{
				// console.log(dailySearch);
				saveToDB();
			}
		}
	});
}

function getCharset(response){
	var headers = response.headers;
	var contentType = headers['content-type'];
	var charset = contentType.substring(contentType.lastIndexOf('=') + 1);
	// console.log(charset);
	return charset;
}

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