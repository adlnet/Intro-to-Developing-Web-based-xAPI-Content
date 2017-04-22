
//Launch snip

function initialize( XAPIWrapper, myactor, baseuri )
{

	var theQuiz = window.getQuizController();
    
    //statement base and attempt uuid

	theQuiz.on( "started", function( starttime )
	{

		//started

	} )
	theQuiz.on( "answered", function( questionNumber, questionText, answerText, result )
	{
		//answered

	} )
	theQuiz.on( "ended", function( stats )
	{
		//ended
	} )
}