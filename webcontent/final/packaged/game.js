        var thegame = new game(),
        	won = false,
        	help_messages = [
        	{
        		text: "Higher",
        		class: "has-error"
        	},
        	{
        		text: "Winner!",
        		class: "has-success"
        	},
        	{
        		text: "Lower",
        		class: "has-error"
        	}];
        thegame.events = {};
        thegame.on =function(event,handler)
        {
            thegame.events[event] = handler;
        }
        thegame.raise = function(event,arg)
        {
            if(thegame.events[event])
                thegame.events[event](arg);
        }
        // local functions
        function startGame(event)
        {
        	$('#start-btn').attr("disabled", true);
        	$('#start-btn').removeClass('btn-warning').addClass('btn-default')
        	thegame.start();
        	resetInput();
        	hideStats();
        	$('#number-range').html(thegame.range);
        	$('#number-guess').attr('min', thegame.stats.min);
        	$('#number-guess').attr('max', thegame.stats.max);
        	$('#number-guess').removeAttr('readonly');
        	$('#number-guess').focus();
        	won = false;

        	
            thegame.raise("started",thegame.stats.startedAt);

        }

        function handleResult(result, number)
        {
        	var jq_help = $('#number-help');
        	jq_help.html(help_messages[result + 1].text + " (you guessed " + number + ")");
        	$('#number-group').addClass(help_messages[result + 1].class);
        	if (result == 0)
        	{
        		$('#number-guess').attr('readonly', 'true');
        		$('#start-btn').attr("disabled", false);
        		$('#start-btn').removeClass('btn-default').addClass('btn-warning');
        		won = true;
        		thegame.end();
        		showStats();

                thegame.raise("ended",thegame.stats);

        		alert('You won');
        	}
        }

        function resetInput()
        {
        	$('#number-group').removeClass(help_messages[0].class + " " + help_messages[1].class);
        	$('#number-guess').val('');
        	$('#number-help').html('');
        }

        function showStats()
        {
        	var dur = moment.duration(thegame.stats.endedAt - thegame.stats.startedAt);
        	$('#stats-number').html(thegame.stats.number);
        	$('#stats-range').html(thegame.range);
        	$('#stats-guesses').html(thegame.stats.guesses.length + "  (" + thegame.stats.guesses + ")");
        	$('#stats-duration').html(dur.humanize() + "  (" + dur.toJSON() + ")");
        	$('#stats-row').show();
        }

        function hideStats()
        {
        	$('#stats-row').hide();
        	$('#stats-number').html('');
        	$('#stats-range').html('');
        	$('#stats-guesses').html('');
        	$('#stats-duration').html('');
        }

        // set events
        $('#start-btn').on('click', startGame);

        $('#number-form').submit(function(event)
        {
        	var num = parseInt(event.target['number-guess'].value);
        	try
        	{
        		var res = thegame.evalGuess(num);

                thegame.raise("guessed",num);

        	}
        	catch (e)
        	{
        		// if error, game is over, start again
        		startGame();
        		return false;
        	}
        	if (won) return false;
        	resetInput();
        	handleResult(res, num);
        	return false;
        });

      