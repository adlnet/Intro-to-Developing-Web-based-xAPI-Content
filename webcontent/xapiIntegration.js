 var myXAPI = {};

 //step 5
 
 //buildMyXAPI(launchdata.actor);
 startGame();

 function buildMyXAPI(myactor)
 {

 	// -- step 7.2 --

 	myXAPI.getBase = function()
 	{
 		return JSON.parse(JSON.stringify(this.statement));
 	};

 	myXAPI.started = function(starttime)
 	{
 		//7.4
 	};

 	myXAPI.ended = function(stats)
 	{
 		// -- step 7.5 --
 	};

 	myXAPI.guessed = function(num)
 	{
 		// -- step 7.6 --
 	};
 }