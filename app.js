var request = require('request'),
		 fs = require('fs'),
		 jf = require('jsonfile'),
	   util = require('util'),
	  iconv = require('iconv-lite'),
MongoClient = require('mongodb').MongoClient,
     format = require('util').format,
	CronJob = require('cron').CronJob
		  _ = require('underscore');

var countries = jf.readFileSync('data/countries_domains_languages.json');
// console.log(countries);

// For now, only latin-script languages...
countries = _.filter(countries, function(obj){
	return obj.language_a_script == 'latin';
});
console.log(countries);

var services = jf.readFileSync('data/services.json');
// console.log(services);

var letters = [];
for(var i = 65; i <= 90; i++){
	letters.push(String.fromCharCode(i));
}
// console.log(letters);

// All results from this day
var dailySearch = [];

console.log('--------------------------------------------');
console.log('App started running');
console.log('--------------------------------------------');
// new CronJob('0 0 22 * * *', function(){
// 	dailySearch = [];
//     callAutocomplete(String.fromCharCode(65), services[0], 'en');
// }, null, true, "America/New_York");

var letterIndex = 0;
var serviceIndex = 0;
var countryIndex = 0;
var msg = 'Started scraping ' + countries[countryIndex].domain +
		  '\n' + services[serviceIndex].site + ': ' +
		  letters[letterIndex] + ', ';
saveLog(msg);

callAutocomplete(letters[letterIndex],
				 services[serviceIndex],
				 countries[countryIndex]);

/*-------------------- MAIN FUNCTION --------------------*/

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

			
			// // If there's any suggestion at all...
			if(suggestions.length > 0){

				// Create a new record and save
				var newRecord = createRecord(service, country, suggestions);
				console.log(newRecord);

				// Save current result
				dailySearch.push(newRecord);
			}

			// New letter...
			letterIndex ++;
			if(letterIndex < letters.length){
				var msg = letters[letterIndex] + ', ';
				saveLog(msg);
				callAutocomplete(letters[letterIndex], services[serviceIndex], countries[countryIndex]);
			
			}else{

				// New service...
				letterIndex = 0;
				serviceIndex ++;
				if (serviceIndex < services.length) {
					var msg = '\n' + services[serviceIndex].site + ': ' +
							  letters[letterIndex] + ', ';;
					saveLog(msg);					
					callAutocomplete(letters[letterIndex], services[serviceIndex], countries[countryIndex]);
			
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
											  '\n--------------------------------------------\n';
									saveLog(msg);
									console.log(msg);

										// Neww country
										if(countryIndex < 3){
											var msg = 'Started scraping ' + countries[countryIndex].domain +
													  '\n' + services[serviceIndex].site + ': ' +
													  letters[letterIndex] + ', ';
											saveLog(msg);
											console.log(msg);

											dailySearch = [];	// reset results
											callAutocomplete(letters[letterIndex], services[serviceIndex], countries[countryIndex]);
										}
								}
							});
						}
					});
			

				}
			}

			// if(letterIndex == letters.length){
			// 	letterIndex = 0;
			// 	serviceIndex ++;
			// 	if (serviceIndex == services.length) {
			// 		serviceIndex = 0;
			// 		countryIndex++;
			// 	}
			// }

			// // Next?
			// if(countryIndex < countries.length){
				
			// }else{	// End
			// 	// console.log(dailySearch);				
			// 	saveToJSON();
			// 	saveToMongoDB();

			// 	console.log('--------------------------------------------');
			// 	console.log('Finshed daily scraping.');
			// 	console.log('--------------------------------------------');
			// }
		}
	});
}

/*-------------------- FUNCTIONS --------------------*/

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
function createRecord(service, country, suggestions){
	console.log('Called createRecord');
	// console.log('Received:');
	// console.log(service);
	// console.log(language);	
	// console.log(suggestions);
	var obj = {
		date: new Date(),
		service: service.site,
		domain: country.domain,
		language: country.language_a_code,
		letter: suggestions[0].charAt(0),
		results: suggestions
		// results: suggestionToObj(service, suggestions)
	};
	// console.log('Returning ' + obj);
	return obj;
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
	var domain = country.domain.replace('.', '_');
	var file = 'db/data_'+domain+'_'+timestamp+'.json'
	var obj = dailySearch;
	 
	jf.writeFile(file, obj, function(err) {
	  // console.log(err);
	  if(!err){
	  	console.log('Results successfully saved at ' + file);
	  	callback(false);	// error = false
	  }else{
	  	callback(true);
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
		var collection = db.collection('country_records');
		var index = 0;
		insertObject(dailySearch[index]);

		function insertObject(obj){
			console.log('Called insertObject.');
			// console.log(obj);
			collection.insert(obj, function(err, docs) {
				if(err) throw err
				console.log('Obj succesfully saved to DB.');

				// Next iteration
				if(index < dailySearch.length - 1){
					index++;
					var obj = dailySearch[index];
					insertObject(obj);					
				}else{

					// Count
					collection.count(function(err, count) {
						console.log(format("count = %s", count));
						db.close();			// close database						
						callback(false);	// err = false						
					});

					// // Locate all the entries using find 
					// collection.find().toArray(function(err, results) {
					// 	console.dir(results);
					// 	// Let's close the db 
					// 	db.close();
					// });	
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