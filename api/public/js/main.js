/* Your code starts here */

var app = {};

app.init = function() {
	console.log('Your code starts here!');

	attachEvents();

	/*------------------ FUNCTIONS ------------------*/	
	// A function where we keep all user's interaction listener (buttons, etc)
	function attachEvents() {
	    console.log('Attaching Events');

	    // .off() is the same as removeEventListener
	    // it is needed to cancel out any duplications
	    $('#search-bt').off('click').on('click', function() {
	    	var query = $('#search-box').val().toLowerCase();
	        // Ajax call
	        $.post('/search', {
	            letter: query
	        }, function(response) {
	            // console.log(response);
	            if(response.error) throw response.error
	            // console.log(response.data);
	            printResults(response.data);
	        });
	    });	
	}

	function printResults(data){
		console.log('Called printResults.')
		console.log(data);
		for(var i = 0; i < data.length; i++){
			var newDiv = $('<div class="results"><div>');

			var letter = $('<h2>'+data[i].letter.toUpperCase()+'</h2>');
			var description = $('<p>' + data[i].date + '<br>' +
						  				data[i].domain + '<br>' +
						  				data[i].language + '<br>' + '</p>');
			var predictions = $('<p></p>');
			var predictionsString = '';
			for(var j = 0; j < data[i].results.length; j++){
				predictionsString += data[i].results[j] + '<br>';
			}
			predictions.html(predictionsString);

			$(newDiv).append(letter);
			$(newDiv).append(description);
			$(newDiv).append(predictions);
			$('body').append(newDiv);
		}
	}
}

app.init();