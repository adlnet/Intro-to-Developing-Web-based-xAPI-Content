# Adding xAPI to the Game

## Purpose
This small tutorial will allow you to see how to store interactions with 
the game in an xAPI LRS. It uses the [ADL xAPIWrapper](https://github.com/adlnet/xAPIWrapper) to make sending statements to the 
LRS easier. Although this is a small tutorial it shows you how to:  
  1.  include the xAPI Wrapper in an HTML page,  
  2.  configure the xAPI Wrapper with the LRS and client credentials,  
  3.  send statements to the LRS,  
  4.  include extensions in the statement, and  
  5.  use registration and context activities to group statements.

## Step 1 - Include the xAPI Wrapper in Game.html  
The first step is to download the xAPI Wrapper file. The easiest way is to download the minified version on GitHub.  
  1.  Download the latest [xapiwrapper.min.js release](https://github.com/adlnet/xAPIWrapper/releases/tag/v1.5.0)
  2.  Save `xapiwrapper.min.js` in the webcontent folder with `game.html` (You can save it anywhere you wish, just change the source link accordingly)
  3.  Add a `<script>` tag in the `<head>` of the `game.html` to include the xAPI Wrapper. (right between 'moment.js' and 'guess-number.js')
  ``` html
  ...
  <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.10.3/moment.min.js"></script>
  
  <script src="xapiwrapper.min.js"></script>
    
  <script src="lib/guess-number.js"></script>
    
  <script>
    $(document).ready(function () {
    ...  
  ```
  
## Step 2 - Configure the xAPI Wrapper  
Next you have to [configure the xAPI Wrapper](https://github.com/adlnet/xAPIWrapper/blob/master/README.md#configuration). By default, the xAPI Wrapper is configured to communicate with an lrs at localhost. We want to send statements to the ADL LRS, so:  
  1.  Add a `<script>` tag to the `game.html` after the xapiwrapper `<script>` tag
  2.  Put in the configuration values. If you have ADL LRS credentials, you may use them for the `user` and `password` values. If not, you may use `tom` and `1234`  
  ``` html
  ...
  <script src="xapiwrapper.min.js"></script>
  <script>
      var conf = {
        "endpoint" : "https://lrs.adlnet.gov/xapi/",
        "user" : "tom",
        "password" : "1234",
      };
      ADL.XAPIWrapper.changeConfig(conf);
  </script> 
  
  <script src="lib/guess-number.js"></script>
  ...  
  ```  
  
## Step 3 - Creating myXAPI
The xAPIWrapper was created to simplify connecting to and communicating with an LRS. This means the work of creating a 
statement - generating the JSON properly and setting the correct values - is up to the developer. In this step you will 
create an object that will contain a base statement and some helper functions to simplify sending xAPI statements.

  1. Create myXAPI with Base Statement just after `ADL.XAPIWrapper.changeConfig(conf);`  
  ``` javascript
  ...
  ADL.XAPIWrapper.changeConfig(conf);
  
  var myXAPI = {};
  </script>
  ```  
  
  2. Add the base statement to the myXAPI object with actor and object. This is the object we will use for the started and 
  ended statements. When it comes to reporting guesses, we will change the object. Change the actor's account name to 
  something unique to you.
  ``` javascript
  ...
  ADL.XAPIWrapper.changeConfig(conf);
  
  var myXAPI = {
    statement: {
      actor: { 
          account: { 
              homePage: "http://adlnet.gov/accounts", 
              name: "<change this>" 
          } 
      },
      object: { 
          id: "http://adlnet.gov/event/2015/xapibootcamp/guess-the-number",
          definition: {
              name: {"en-US": "Guess the Number Game"},
              description: {"en-US": "Simple guess the number game to demonstrate xAPI"},
              type: "http://adlnet.gov/event/2015/xapibootcamp/activity/type/game"
          }
      }
    }
  };
  </script>
  ``` 
  
  3. Add context activity grouping and category activities to the base statement. These are used to tag these statements 
  as being part of this xAPI Bootcamp, and part of the web development session. (We can use those values later to retrieve 
  statements from the LRS)  
  ``` javascript
  ...
  ADL.XAPIWrapper.changeConfig(conf);
  
  var myXAPI = {
      statement: {
          actor: { 
              account: { 
                  homePage: "http://adlnet.gov/accounts", 
                  name: "<change this>" 
              } 
          },
          object: { 
              id: "http://adlnet.gov/event/2015/xapibootcamp/guess-the-number",
              definition: {
                  name: {"en-US": "Guess the Number Game"},
                  description: {"en-US": "Simple guess the number game to demonstrate xAPI"},
                  type: "http://adlnet.gov/event/2015/xapibootcamp/activity/type/game"
              }
          },
          context: {
              contextActivities: {
                  "grouping": [
                      {
                          "id": "http://adlnet.gov/event/2015/xapibootcamp/dev/web"
                      }
                  ],
                  "category": [
                      {
                          "id": "http://adlnet.gov/event/2015/xapibootcamp"
                      }
                  ]
              }
          }
      }
  };
  </script>
  ```

## Step 4 - Adding Helper Methods to myXAPI
We want to report 3 things to the LRS: When someone starts a game, when someone finishes a game, and when someone makes 
a guess. Since there are some things that need added to, or changed in the base statement, it would be nice to add methods 
to the myXAPI object to centralize those changes.  
  1.  Before we add the 3 functions, add one that will make a copy of the base statement, so when those 3 functions 
  start changing values, it doesn't change the base statement.  
  ``` javascript
  // right after all of the var myXAPI..
  myXAPI.getBase = function () {
    return JSON.parse(JSON.stringify(this.statement));
  };
  ```  
  
  2.  Next add `started`. It will accept the `starttime` so that the statement and the game stats are in sync. It will set the 
  verb - `http://adlnet.gov/event/2015/xapibootcamp/verb/started` - to the statement, along with the start time. It also 
  generates a GUID for the new attempt. We can then save that in the context registration value, allowing us to link all of 
  statements for this attempt.  
  ``` javascript
  // after getBase
  myXAPI.started = function (starttime) {
      this.attemptGUID = ADL.ruuid();
      var stmt = this.getBase();
      stmt.verb = {
          id: "http://adlnet.gov/event/2015/xapibootcamp/verb/started",
          display: {"en-US": "started"}
      };
      stmt.timestamp = starttime.toISOString();
      stmt.context.registration = this.attemptGUID;
      ADL.XAPIWrapper.sendStatement(stmt, function (resp) {
          console.log(resp.status + " - statement id: " + resp.response);
      });
  };
  ```  
  
  3.  Now add `ended`. This will accept the stats object the game has maintained. Since the values of the stats object 
  don't really fit in any property of a statement, we will use the result `extensions` property to store some of the stats.  
  ``` javascript  
  // after started
  myXAPI.ended = function (stats) {
      var stmt = this.getBase();
      stmt.verb = {
          id: "http://adlnet.gov/event/2015/xapibootcamp/verb/ended",
          display: {"en-US": "ended"}
      };
      stmt.timestamp = stats.endedAt.toISOString();
      stmt.context.registration = this.attemptGUID;
      stmt.result = {
          extensions: {
              "http://adlnet.gov/event/2015/xapibootcamp/guess-the-number/ext/min": stats.min,
              "http://adlnet.gov/event/2015/xapibootcamp/guess-the-number/ext/max": stats.max,
              "http://adlnet.gov/event/2015/xapibootcamp/guess-the-number/ext/guesses": stats.guesses,
              "http://adlnet.gov/event/2015/xapibootcamp/guess-the-number/ext/number": stats.number,
              "http://adlnet.gov/event/2015/xapibootcamp/guess-the-number/ext/startedAt": stats.startedAt.toISOString(),
              "http://adlnet.gov/event/2015/xapibootcamp/guess-the-number/ext/endedAt": stats.endedAt.toISOString()
          }
      };
      ADL.XAPIWrapper.sendStatement(stmt, function (resp) {
          console.log(resp.status + " - statement id: " + resp.response);
      });
  };
  ```  
  
  4.  Finally add a `guessed` function. This accepts the number guessed and sends a statement to the LRS. Since this 
  statement would say something like "player guessed a number" and not "player guessed guess the number game", we need 
  to change the the object of the statement, along with adding the number to the result `response` and setting the verb 
  to `http://adlnet.gov/event/2015/xapibootcamp/verb/guessed`.  
  ``` javascript
  // after ended
  myXAPI.guessed = function (num) {
      var stmt = this.getBase();
      stmt.verb = {
          id: "http://adlnet.gov/event/2015/xapibootcamp/verb/guessed",
          display: {"en-US": "guessed"}
      };
      stmt.object = {
          id: "http://adlnet.gov/event/2015/xapibootcamp/number",
          definition: {
              name: {"en-US": "a number"},
              description: {"en-US": "Represents a number guessed in the guess a number game"},
              type: "http://adlnet.gov/event/2015/xapibootcamp/activity/type/number"
          }
      };
      stmt.timestamp = (new Date()).toISOString();
      stmt.context.registration = this.attemptGUID;
      stmt.result = { response: num.toString() };
      ADL.XAPIWrapper.sendStatement(stmt, function (resp) {
          console.log(resp.status + " - statement id: " + resp.response);
      });
  };
  ```

## Step 5 - Using myXAPI
Now that everything is set up, it's time to call those helper functions during the game.  
  1.  Call `started` at the end of the `startGame` function in `game.html`.
  ``` javascript
  // local functions
  function startGame (event) {
      $('#start-btn').attr("disabled",true);
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
      myXAPI.started(thegame.stats.startedAt);
  }
  ```
  
  2. Call `ended` in the `handleResult` function when the result is 0.
  ``` javascript
  function handleResult (result, number) {
      var jq_help = $('#number-help');
      jq_help.html(help_messages[result + 1].text + " (you guessed " + number + ")");
      $('#number-group').addClass(help_messages[result + 1].class);
      if (result == 0) {
          $('#number-guess').attr('readonly', 'true');
          $('#start-btn').attr("disabled",false);
          $('#start-btn').removeClass('btn-default').addClass('btn-warning');
          won = true;
          thegame.end();
          showStats();
          myXAPI.ended(thegame.stats);
          alert('You won');
      }
  }
  ```  
  
  3. Call `guessed` in the try/catch in the form submit event.
  ``` javascript
  $('#number-form').submit(function (event) {
      var num = parseInt(event.target['number-guess'].value);
      try {
          var res = thegame.evalGuess(num);
          myXAPI.guessed(num);
      } catch (e) { 
          // if error, game is over, start again
          startGame();
          return false; 
      }
      if (won) return false;
      resetInput();
      handleResult(res, num);
      return false;
  });
  ```  
  
## Step 6 - Try the game
The game should report your attempts to the ADL LRS [view here](http://adlnet.github.io/xapi-statement-viewer/).

## Bonus Challenges
If you have extra time and would like to try out more ...  

### Use launch parameters to configure xAPI Wrapper
The xAPI Wrapper can look at the URL parameters for configuration settings.  
  1.  Read about using URL parameters to change the xAPI Wrapper configuration [here](https://github.com/adlnet/xAPIWrapper/blob/master/README.md#launch-parameters)  
  2.  Create a launching page that has a url, with launch parameters, to the game.html page.
  3.  See if the values were changed based on those parameters. (note: our conf and base statement may overwrite 
  the values from launch)

### Add inputs to the page to allow the player to change the actor name
The game currently has the actor hardcoded to whatever you chose as the name during this tutorial. Update the page 
so that a user can change that name.
  1.  Show the current name on the page
  2.  Add an input field to change the name
  3.  Update the base statement to use the new name
  4.  ** Can you change the user name using the URL parameters? **

### Use the xAPI Wrapper to get statements for the current actor  
The xAPI Wrapper can also get statements. There is a session about reporting later in the day but if you have time 
you can try to get statements now. 
  1.  Look at the [get statements](https://github.com/adlnet/xAPIWrapper#get-statements) section of the xAPI Wrapper, specifically [getting statements based on search parameters](https://github.com/adlnet/xAPIWrapper#get-statements-based-on-search-parameters).
  2.  Try to filter the statements based on actor and activity id (see [xAPI Get Statements](https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md#723-getstatements) for the filter parameters)
  3.  Display the results on the game page
