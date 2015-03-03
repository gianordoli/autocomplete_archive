var request = require('request'),
		 fs = require('fs'),
		 jf = require('jsonfile'),
	   util = require('util'),
	  iconv = require('iconv-lite'),
MongoClient = require('mongodb').MongoClient,
     format = require('util').format,
    CronJob = require('cron').CronJob
		  _ = require('underscore');

console.log('--------------------------------------------');
console.log('App started running');
console.log('--------------------------------------------');

var countries = jf.readFileSync('data/countries_domains_languages.json');
// console.log(countries);

// For now, only latin-script languages...
countries = _.filter(countries, function(obj){
	return obj.language_a_script == 'latin';
});
// console.log(countries);

var services = jf.readFileSync('data/services.json');
// console.log(services);

var letters = [];
for(var i = 65; i <= 90; i++){
	letters.push(String.fromCharCode(i));
}
// console.log(letters);

// All results from this day
var domainResults = [];
var letterIndex, serviceIndex, countryIndex, errorCount;
countryIndex = 0;

var isRunning = false;

new CronJob('* 25 16 * * *', function(){
	// console.log(new Date());
	if(!isRunning){
		restart(true);
		isRunning = true;	
	}
}, null, true, 'UTC');


/*-------------------- MAIN FUNCTIONS --------------------*/

// This is used both to START (1st time) and RESTART the calls
// Latter might be due to:
// a) Finished scraping a given country
// (in that case, it wouldn't be necessary to reset the variables...
// b) errorCount > 5, so skip to the next country
function restart(resetVars){
	if(resetVars){
		letterIndex = 0;
		serviceIndex = 0;		
	}
	domainResults = [];
	errorCount = 0;
	var msg = '\nStarted scraping ' + countries[countryIndex].domain +
			  '\n' + services[serviceIndex].site + ', ';
	saveLog(msg);
	callAutocomplete(letters[letterIndex], services[serviceIndex], countries[countryIndex]);
}

function callAutocomplete(query, service, country){
	console.log('Called callAutocomplete.')

	var url = {
		uri: concatenateUrl(query, service, country),
		encoding: null
	};

	request(url, function (error, response, body) {
		// console.log(error);
		// console.log(response);
		// console.log(body);

		if (!error && response.statusCode == 200) {

			// var charset = getCharset(response);
			// console.log(charset);

			var data = JSON.parse(iconv.decode(body, 'ISO-8859-1'));
			// console.log(data);
			var suggestions = data[1];
			// console.log(suggestions);
			// console.log(suggestions.length);

			// Create a new record and store
			createRecord(service, country, suggestions, function(err, obj){
				if(!err){
					console.log(obj);	
					domainResults.push(obj);						
				}
				// Call next iteration if err == true
				// Might be the case that no suggestions were retrieved,
				// so just jump to the next letter
				nextIteration();				
			});
		}else{
			console.log(error);
			saveLog(error);
			errorCount ++;
			console.log('errorCount: ' + errorCount);
			// Try at least 5 times
			if(errorCount < 5){
				setTimeout(function(){
					console.log('Calling autocomplete again.');
					callAutocomplete(letters[letterIndex], services[serviceIndex], countries[countryIndex]);
				}, 5000);				
			}else{
				countryIndex ++; // skip to the next country
				restart(true);	 // reset letter and service
			}

		}
	});
}

/*-------------------- FUNCTIONS --------------------*/

function nextIteration(){

	// New letter...
	letterIndex ++;
	if(letterIndex < letters.length){
		// var msg = letters[letterIndex] + ', ';
		// saveLog(msg);
		// setTimeout(function(){	// Delay to prevent Google's shut down		
			callAutocomplete(letters[letterIndex], services[serviceIndex], countries[countryIndex]);
		// }, 500);
	
	}else{

		// New service...
		letterIndex = 0;
		serviceIndex ++;
		if (serviceIndex < services.length) {
			var msg = services[serviceIndex].site + ', ';
			saveLog(msg);
			// setTimeout(function(){	// Delay to prevent Google's shut down
				callAutocomplete(letters[letterIndex], services[serviceIndex], countries[countryIndex]);
			// }, 500);
	
		}else{
			
			// Save data / new country
			serviceIndex  = 0;
			countryIndex ++;
			var msg = '\nFinished scraping ' +
					  countries[countryIndex - 1].domain;
			saveLog(msg);
			console.log(msg);

			// Save JSON
			saveToJSON(countries[countryIndex - 1], function(err){

				if(!err){
					var msg = '\nSaved JSON file.';
					saveLog(msg);
					console.log(msg);

					// Save mongoDB
					saveToMongoDB(function(err){

						if(!err){
							var msg = '\nSaved to mongoDB.' +
									  '\n--------------------------------------------';
							saveLog(msg);
							console.log(msg);

							// New country
							if(countryIndex < countries.length){
								setTimeout(function(){
									restart(false);	// no need to reset letter and service
								}, 120000);
							}else{
								isRunning = false;
							}
						}
					});
				}
			});
		}
	}	
}

// Creates url for reqquest, concatenating the parameters
function concatenateUrl(query, service, country){
	console.log('Called concatenateUrl');
	// console.log(service.ds);	
	var requestUrl = 
					'https://www.'+country.domain+'/complete/search?' +
					 '&client=firefox'+
					 '&q=' + query +
					 '&ds=' + service.ds +
					 '&hl=' + country.language_a_code;

	// console.log(requestUrl);
	console.log('Returning ' + requestUrl);
	return requestUrl;
}

// Returns a record
function createRecord(service, country, suggestions, callback){
	console.log('Called createRecord');
	// console.log('Received:');
	// console.log(service);
	// console.log(language);	
	// console.log(suggestions);
	var obj;
	if(suggestions.length > 0){	

		var now = new Date();
		now.setHours(0);
		now.setMinutes(0);
		now.setSeconds(0);
		// console.log(now);

		obj = {
			date: now,
			service: service.site,
			domain: country.domain,
			language: country.language_a_code,
			letter: suggestions[0].charAt(0),
			results: suggestions
			// results: suggestionToObj(service, suggestions)
		};
		// console.log('Returning ' + obj);
		callback(false, obj);
	}else{
		callback(true);	// err
	}
}

function saveLog(msg){
	console.log('Called saveLog')
	fs.appendFile('db/log.txt', msg, function (err) {
	  if (err){
	  	throw err;	
	  }else{
	  	console.log('Log succesfully saved.');	
	  }
	});
}

// Saves results to JSON file
function saveToJSON(country, callback){
	console.log('Saving data to JSON file.')
	var date = new Date();
	var timestamp = date.getTime();
	var domain = country.domain;
	while(domain.indexOf('.') > -1){
		domain = domain.replace('.', '_');
	}
	var file = 'db/data_'+domain+'_'+timestamp+'.json'
	var obj = domainResults;
	 
	jf.writeFile(file, obj, function(err) {
	  // console.log(err);
	  if(!err){
	  	console.log('Results successfully saved at ' + file);
	  	callback(false);	// error = false
	  }else{
	  	console.log('Failed to save JSON file.');
	  }
	});
}

// Save results to mongoDB
function saveToMongoDB(callback){
	console.log('Saving data to mongoDB.')

	MongoClient.connect('mongodb://127.0.0.1:27017/autocomplete', function(err, db) {
		console.log('Connecting to DB...');
		if(err) throw err;
		console.log('Connected.');
		var collection = db.collection('records');
		var index = 0;
		insertObject(domainResults[index]);

		function insertObject(obj){
			console.log('Called insertObject.');
			// console.log(obj);
			collection.insert(obj, function(err, docs) {
				if(err){
					throw err;
				}else{
					console.log('Obj succesfully saved to DB.');	
					// Next iteration
					if(index < domainResults.length - 1){
						index++;
						var obj = domainResults[index];
						insertObject(obj);					
					}else{
						db.close();			// close database						
						callback(false);	// err = false						
					}					
				}
			});
		}
	});
}


/*-------------------- NOT IN USE -------------------*/

// Changes the array of suggestions to an array of obj
// [ { query: , search: }, {} ]
function suggestionToObj(service, list){
	console.log('Called suggestionToObj.')
	// console.log('Received:');
	// console.log(service);
	// console.log(list);

	var suggestionsObj = [];
	for(var i = 0; i < list.length; i++){
		var newObj = {
			query: list[i],
			search: getSearchableLink(list[i], service)
		}
		suggestionsObj.push(newObj);
	}
	// console.log('Returning ' + suggestionsObj);
	return suggestionsObj;
}

// Combines search address with query to get searchable link
// Ex.: www.google.com?q=amtrak
function getSearchableLink(query, service){
	console.log('Called getSearchableLink.');
	// console.log(query);
	// console.log(service);
	while(query.indexOf(' ') > -1){
		query = query.replace(' ', '+') 
	}
	// console.log(query);
	var searchableLink = service['search-address']
							    .replace('X', query);
	// console.log('Returning '+searchableLink);
	return searchableLink;
}

// Returns the current index of a given object inside an array.
// Utilized here to check if all services
// and languages were already retrieved
function currIndex(obj, array){
	console.log('Called currIndex.');
	for(var i = 0; i < array.length; i++){
		// console.log(i);
		if(array[i] == obj){
			// console.log('Returning '+i);
			return i;
		}		
	}
}

// Scrapes the server's response to detect the charset
function getCharset(response){
	console.log('Called getCharset.');
	var headers = response.headers;
	var contentType = headers['content-type'];
	var charset = contentType.substring(contentType.lastIndexOf('=') + 1);
	// console.log('Returning '+charset);
	return charset;
}