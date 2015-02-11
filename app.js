var request = require('request'),
	 xml2js = require('xml2js');

var parser = new xml2js.Parser();

var services = {
youtube: { client: 'youtube', ds: 'yt', address: 'https://www.youtube.com/results?search_query=X' },
books: { client: 'books', ds: 'bo', address: 'https://www.google.com/search?q=X&tbm=bks' },
products: { client: 'products-cc', ds: 'sh', address: 'https://www.google.com/#q=X&tbm=shop' },
news: { client: 'news-cc', ds: 'n', address: 'https://www.google.com/#q=X&tbm=nws' },
images: { client: 'img', ds: 'i', address: 'https://www.google.com/search?site=imghp&tbm=isch&q=X&' },
web: { client: 'psy', ds: '', address: 'https://www.google.com/#q=X' },
recipes: { client: 'psy', ds: 'r', address: 'https://www.google.com/search?q=X&tbs=rcp'  }
};

var value = 'a';	

var service = services['images'];

// // Creating an api
// var http = require('http');

// var server = http.createServer(function(req, res) {
// 	if(req.url === '/api') {
// 		console.log('Called...');

// 		request(
// 			{	url: 'https://clients1.google.com/complete/search',
// 			    dataType: 'jsonp',
// 			    data: {
// 					q: value,
// 					nolabels: 't',
// 					client: service.client,
// 					ds: service.ds
// 			    }
// 			},
// 			function(request, response, body){
// 				console.log(JSON.stringify(response));
// 			}
// 		);

// 	}
// });

// server.listen(3000, function() {
// 	console.log('--> server listening to port: ' + 3000);
// });

// var labels = ['web', 'youtube', 'recipes', 'products', 'news', 'images', 'books'];

// var opts = $.extend({service: 'web', secure: false}, opts);

// var value = $(this).val();
// var value = 'a';
// console.log(value);

// var service = services[labels[0]];

// var url = 'https://clients1.google.com/complete/search?';
// var options = [
// 	{ param: 'q', value: 'a'},
// 	{ param: 'client', value: 'toolbar'},
// 	{ param: 'ds', value: ''}
// ];

// var services = {
// 	images: {
// 		url: 'https://www.google.com/search?site=imghp&tbm=isch',
// 		options:
// 		[	{ param: 'client', value: 'toolbar'},
// 			{ param: 'ds', value: 'i'}	]
// 	}
// }
// console.log(services.images.options);
// var requestUrl = url;

// console.log(requestUrl);

function autocomplete(query, site){
	// console.log('q: ' + query + ', site: ' + site);
	var service = services[site];
	// console.log(service);	
	var requestUrl = 'https://clients1.google.com/complete/search?' +
					 '&client=toolbar'+
					 '&q=' + query +
					 '&ds=' + service.ds;

	// console.log(requestUrl);
	return requestUrl;
}



// request(autocomplete('a', 'images'), function (error, response, body) {
	// console.log(error);
	// console.log(response);
	// console.log(body);
// 	if (!error && response.statusCode == 200) {

// 		var data;
// 		parser.parseString(body, function (err, result) {
// 			data = result.toplevel.CompleteSuggestion;
// 		});
// 		// console.log(data);
// 		var suggestions = [];
// 		data.forEach(function(element, index, array){
// 			// console.log(element.suggestion[0]['$']['data']);
// 			suggestions.push(element.suggestion[0]['$']['data']);
// 		});		
// 		console.log(suggestions);
// 	}
// });