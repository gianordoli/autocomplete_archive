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
	    $('#search').off('click').on('click', function() {
	        // Ajax call
	        $.post('/search', {
	            query: 'all'
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
		// for(var i = 0; i < data.length; i++){
		// 	var newDiv = $('<div>' + data[i] + '<div>');
		// 	$('body').append(newDiv);
		// }
	}
}

app.init();