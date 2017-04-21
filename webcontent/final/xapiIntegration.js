
ADL.launch( function( err, launchdata, xAPIWrapper )
{
	if ( !err )
	{

		initialize( xAPIWrapper, launchdata.actor, launchdata.customData.content );

		console.log( "--- content launched via xAPI Launch ---\n", xAPIWrapper, "\n", launchdata );
	}
	else
	{

		alert( "This was not initialized via xAPI Launch. Defaulting to hard-coded credentials" );

        ADL.XAPIWrapper.changeConfig(
        {
            "endpoint": "https://lrs.adlnet.gov/xapi/",
            "user": "xapi-workshop",
            "password": "password1234"
        } );

		var defaultActor = {
			account:
			{
				homePage: "http://anon.ymo.us/server",
				name: "unknown-user"
			},
			name: "unknown"
		}

		initialize( ADL.XAPIWrapper, defaultActor, "http://adlnet.gov/event/xapiworkshop/non-launch" );

		console.log( "--- content not launched ---\n", ADL.XAPIWrapper.lrs );
	}
}, true );

function initialize( xAPIWrapper, myactor, baseuri )
{

	var theQuiz = window.getQuizController();

	var statement_base = {
		actor: myactor,
		object:
		{
			id: baseuri + "/quiz",
			definition:
			{
				name:
				{
					"en-US": "Cyber Security Quiz"
				},
				description:
				{
					"en-US": "a simple mulitple choice quiz to demonstrate xAPI"
				},
				type: "http://activitystrea.ms/schema/1.0/quiz"
			}
		},
		context:
		{
			contextActivities:
			{
				"grouping": [
				{
					"id": baseuri + "/dev/web"
				},
				{
					"id": baseuri
				} ]
			}
		}
	};

	function getBaseStatement()
	{
		return JSON.parse( JSON.stringify( statement_base ) );
	};

    var attemptGUID = null;
	theQuiz.on( "started", function( starttime )
	{

		attemptGUID = ADL.ruuid();
		var stmt = getBaseStatement();
		stmt.verb = {
			id: baseuri + "/verb/started",
			display:
			{
				"en-US": "started"
			}
		};
		stmt.timestamp = starttime.toISOString();
		stmt.context.registration = attemptGUID;
		ADL.XAPIWrapper.sendStatement( stmt, function( resp )
		{
			console.log( resp.status + " - statement id: " + resp.response );
		} );

	} )
	theQuiz.on( "answered", function( questionNumber, questionText, answerText, result )
	{
		var stmt = getBaseStatement();
		stmt.verb = {
			id: baseuri + "/verb/answered",
			display:
			{
				"en-US": "answered"
			}
		};
		stmt.object = {
			id: baseuri + "/question" + questionNumber,
			definition:
			{
				name:
				{
					"en-US": "question" + questionNumber
				},
				description:
				{
					"en-US": questionText
				},
				type: "http://adlnet.gov/expapi/activities/cmi.interaction",
                interactionType: "choice",
			}
		};
		stmt.timestamp = ( new Date() ).toISOString();
		stmt.context.registration = attemptGUID;
		stmt.result = {
			response: answerText,
            success:result
		};
		ADL.XAPIWrapper.sendStatement( stmt, function( resp )
		{
			console.log( resp.status + " - statement id: " + resp.response );
		} );

	} )
	theQuiz.on( "ended", function( stats )
	{
		var stmt = getBaseStatement();
		stmt.verb = {
			id: baseuri + "/verb/ended",
			display:
			{
				"en-US": "ended"
			}
		};
		stmt.timestamp = stats.endedAt.toISOString();
		stmt.context.registration = attemptGUID;

		stmt.result = {
			extensions:
			{}
		};
		stmt.result.extensions[ baseuri + "/guess-the-number/ext/min" ] = stats.min;
		stmt.result.extensions[ baseuri + "/guess-the-number/ext/max" ] = stats.max;
		stmt.result.extensions[ baseuri + "/guess-the-number/ext/guesses" ] = stats.guesses;
		stmt.result.extensions[ baseuri + "/guess-the-number/ext/number" ] = stats.number;
		stmt.result.extensions[ baseuri + "/guess-the-number/ext/startedAt" ] = stats.startedAt.toISOString();
		stmt.result.extensions[ baseuri + "/guess-the-number/ext/endedAt" ] = stats.endedAt.toISOString();

		ADL.XAPIWrapper.sendStatement( stmt, function( resp )
		{
			console.log( resp.status + " - statement id: " + resp.response );
		} );
	} )
}