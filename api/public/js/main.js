/* Your code starts here */

var app = {};

app.init = function() {
	console.log('Your code starts here!');

	// A function where we keep all user's interaction listener (buttons, etc)
	var attachEvents = function() {
	    console.log('Attaching Events');

	    // .off() is the same as removeEventListener
	    // it is needed to cancel out any duplications
	    $('#search').off('click').on('click', function() {
	        // Ajax call
	        $.post('/search', {
	            query: 'all'
	        }, function(result) {
	            console.log(result);
	        });
	    });	
	}

	attachEvents();	
}

app.init();