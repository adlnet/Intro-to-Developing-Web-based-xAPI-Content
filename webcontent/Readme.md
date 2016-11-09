# Adding xAPI to the Game

## Purpose
This small tutorial will allow you to see how to store interactions with
the game in an xAPI LRS. It uses the [ADL xAPIWrapper](https://github.com/adlnet/xAPIWrapper) to make sending statements to the
LRS easier. Although this is a small tutorial it shows you how to:  
  1.  include the xAPI Wrapper in an HTML page,  
  2.  configure the xAPI Wrapper using xAPI Launch with the LRS and client credentials,  
  3.  send statements to the LRS,  
  4.  include extensions in the statement, and  
  5.  use registration and context activities to group statements, using xAPI Launch information.

## Step 1 - Include the xAPI Wrapper in Game.html  
The first step is to include the xAPIWrapper in the game HTML. The xAPIWrapper is included in the `lib` folder of the project for your convenience. For reference, the xAPIWrapper project is at https://github.com/adlnet/xAPIWrapper.  
  1.  Add a `<script>` tag in the `<body>` of the `game.html` to include the xAPI Wrapper. (right below the game `<script>` tag) And an opening and closing `<script>` tag where we will add the xAPI code.  

  ``` html
    <script src="./lib/xapiwrapper.min.js"></script>
  ```

## Step 2 - Configure the xAPI Wrapper  
Next you have to [configure the xAPI Wrapper](https://github.com/adlnet/xAPIWrapper#xapi-launch-support). By default, the xAPI Wrapper is configured to communicate with an LRS at localhost. We want to
have xAPI Launch tell the content what configuration to use, instead of hardcoding
the LRS and authentication details. By calling ADL.launch, the xAPIWrapper will
do the handshake with xAPI Launch and pass a configured object to the callback.   
  ``` html
  ...
  <script src="./lib/xapiwrapper.min.js"></script>
  <script>
  ADL.launch(function(err, launchdata, xAPIWrapper) {
      if (!err) {
          console.log("--- content launched via xAPI Launch ---\n", xAPIWrapper, "\n", launchdata);
      } else {
          alert("This was not initialized via xAPI Launch. Defaulting to hard-coded credentials");

          console.log("--- content not launched ---\n", ADL.XAPIWrapper.lrs);
      }
  }, true);
  </script>
  ...  
  ```  

## Step 3 - Creating myXAPI
The xAPIWrapper was specifically created to simplify connecting to and communicating with an LRS. This means the work of creating a
statement - generating the JSON properly and setting the correct values - is up to the developer.  

In this step you will
create a `myXAPI` object that will contain a base statement and some helper functions to simplify sending xAPI statements.  

  ``` javascript
    var myXAPI = {};
  ```  

## Step 4 - Initializing the content based on xAPI Launch data  
The xAPI Wrapper has xAPI Launch functionality built in. By calling ADL.launch() with a callback function, we are able
to get a configured xAPIWrapper and additional launch data from the launch server. xAPI Launch sends information (launch data) to the content, which the ADL.launch function sends to the callback. The launchdata.customData object contains content that can be configured in the xAPI Launch server, allowing us to enter a base URI we can use for all places that need a URI. And the xAPIWrapper parameter holds a new xAPIWrapper instance that is configured with settings from the launch server.  

In the `if (!err)` block of the `ADL.launch` call back, set the original `ADL.XAPIWrapper` to the configured one from the launch() method and save the `launchdata.customData.content` value to a baseuri property on `myXAPI`. (we will configure this value on the launch server)  

  ``` javascript
    ADL.XAPIWrapper = xAPIWrapper;
    myXAPI.baseuri = launchdata.customData.content;
  ```

## Step 5 - Adding the else block
The else block is the case when an error occurred trying to talk to the launch server - typically this is because the content wasn't launched by the launch server. In this example we default back to hard coded values, however additional processing or error handling could occur here.  

Call `ADL.XAPIWrapper.changeConfig()` to change the configuration of the `ADL.XAPIWrapper` to hard-coded values. Then, set the baseuri and launchdata to predetermined values.  

  ``` javascript
    ADL.XAPIWrapper.changeConfig({
        "endpoint": "https://lrs.adlnet.gov/xapi/",
        "user": "xapi-workshop",
        "password": "password1234"
    });

    myXAPI.baseuri = "http://adlnet.gov/event/xapiworkshop/non-launch";
    launchdata = {
        actor: {
            account:{
                homePage:"http://anon.ymo.us/server",
                name: "unknown-user"
            },
            name: "unknown"
        }
    };
  ```

## Step 6 - Building the rest of the myXAPI object and callback function
We add functions and a base statement to the myXAPI object to report when actions in
the game take place. The following step will go into the details of those
functions.   

At the end of the callback function, add two function calls. `buildMyXAPI` takes the actor sent from the launch server and will create a base statement and the additional functions for the myAPI object. The second function will call the startGame process.  

  ``` javascript  
    buildMyXAPI(launchdata.actor);
    startGame();
  ```   


## Step 7 - Adding Helper Methods to myXAPI
We want to report 3 things to the LRS: When someone starts a game, when someone finishes a game, and when someone makes
a guess. Since there are some things that need added to, or changed in the base statement, it would be nice to add methods
to the myXAPI object to centralize those changes.  

  1.  Create a function called buildMyXAPI() after the end of the ADL.launch().  
  ``` javascript  
  function buildMyXAPI(myactor) {

  }
  ```  

  2.  In the `buildMyXAPI` function first create a base statement with parts of a statement that don't change much. The `actor` property is set to the value we got from the launch server. The `object` is created with information about the game. We use `myXAPI.baseuri` that was initialized by the launch server to create the IRIs used within the content. And the `context` property is populated with `contextActivities` that allow us to tag these statements as coming from this xAPI Workshop.   

  ``` javascript
    myXAPI.statement = {
        actor: myactor,
        object: {
            id: myXAPI.baseuri + "/guess-the-number",
            definition: {
                name: {"en-US": "Guess the Number Game"},
                description: {"en-US": "Simple guess the number game to demonstrate xAPI"},
                type: "http://activitystrea.ms/schema/1.0/game"
            }
        },
        context: {
            contextActivities: {
                "grouping": [
                    {
                        "id": myXAPI.baseuri + "/dev/web"
                    },
                    {
                        "id": myXAPI.baseuri
                    }
                ]
            }
        }
    };
  ```

  3.  Before we add the 3 functions, add one that will make a copy of the base statement, so when those 3 functions start changing values, it doesn't change the base statement.  

  ``` javascript
    myXAPI.getBase = function () {
        return JSON.parse(JSON.stringify(this.statement));
    };
  ```  

  4.  Next add `started`. It will accept the `starttime` so that the statement and the game stats are in sync. It will set the verb - `myxAPI.baseuri + "/verb/started"` - to the statement, along with the start time. It also generates a GUID for the new attempt. We can then save that in the context registration value, allowing us to link all of statements for this attempt.  

  ``` javascript
    myXAPI.started = function (starttime) {
        this.attemptGUID = ADL.ruuid();
        var stmt = this.getBase();
        stmt.verb = {
            id: myXAPI.baseuri + "/verb/started",
            display: {"en-US": "started"}
        };
        stmt.timestamp = starttime.toISOString();
        stmt.context.registration = this.attemptGUID;
        ADL.XAPIWrapper.sendStatement(stmt, function (resp) {
            console.log(resp.status + " - statement id: " + resp.response);
        });
    };
  ```  

  5.  Now add `ended`. This will accept the stats object the game has maintained. Since the values of the stats object don't really fit in any property of a statement, we will use the result `extensions` property to store some of the stats.  

  ``` javascript  
    myXAPI.ended = function (stats) {
        var stmt = this.getBase();
        stmt.verb = {
            id: myXAPI.baseuri + "/verb/ended",
            display: {"en-US": "ended"}
        };
        stmt.timestamp = stats.endedAt.toISOString();
        stmt.context.registration = this.attemptGUID;

        stmt.result = { extensions: {} };
        stmt.result.extensions[myXAPI.baseuri + "/guess-the-number/ext/min"] = stats.min;
        stmt.result.extensions[myXAPI.baseuri + "/guess-the-number/ext/max"] = stats.max;
        stmt.result.extensions[myXAPI.baseuri + "/guess-the-number/ext/guesses"] = stats.guesses;
        stmt.result.extensions[myXAPI.baseuri + "/guess-the-number/ext/number"] = stats.number;
        stmt.result.extensions[myXAPI.baseuri + "/guess-the-number/ext/startedAt"] = stats.startedAt.toISOString();
        stmt.result.extensions[myXAPI.baseuri + "/guess-the-number/ext/endedAt"] = stats.endedAt.toISOString();

        ADL.XAPIWrapper.sendStatement(stmt, function (resp) {
            console.log(resp.status + " - statement id: " + resp.response);
        });
    };
  ```  

  6.  Finally add a `guessed` function. This accepts the number guessed and sends a statement to the LRS. Since this statement would say something like "player guessed a number" and not "player guessed guess the number game", we need to change the the object of the statement, along with adding the number to the result `response` and setting the verb to `myxAPI.baseuri + "/verb/guessed"`.  

  ``` javascript
    myXAPI.guessed = function (num) {
        var stmt = this.getBase();
        stmt.verb = {
            id: myXAPI.baseuri + "/verb/guessed",
            display: {"en-US": "guessed"}
        };
        stmt.object = {
            id: myXAPI.baseuri + "/number",
            definition: {
                name: {"en-US": "a number"},
                description: {"en-US": "Represents a number guessed in the guess a number game"},
                type: myXAPI.baseuri + "/activity/type/number"
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

## Step 8 - Using myXAPI
Now that everything is set up, it's time to call those helper functions during the game.  

  1.  Call `started` at the end of the `startGame` function in `game.html`.  

  ``` javascript
      myXAPI.started(thegame.stats.startedAt);
  ```

  2. Call `ended` in the `handleResult` function at the end before `alert('You won');` when the result is 0.  

  ``` javascript
      myXAPI.ended(thegame.stats);
  ```  

  3. Call `guessed` in the try/catch in the form submit event after `var res = thegame.evalGuess(num)`.  
  
  ``` javascript
      myXAPI.guessed(num);
  ```  

## Step 9 - Remove startGame  
The last line of the game script is `startGame();`. This is no longer necessary becuase we call it in the launch script now. Remove it so we don't call startGame before we build the myXAPI object.  

## Step 10 - Upload the game  
Launch doesn't require the game to be uploaded. This step is done as a convenience so we don't have to host our game on another server.  

1. Copy `cmi5.xml` from `webcontent/final/packaged/` to `webcontent/`. xAPI Launch has limited support of cmi5's package specification to allow us to package up our game and import on the server. The xml file is already set up, no edits are needed.  
2. Zip cmi5.xml, game.html, lib/, and xapiwrapper.min.js. Make sure not to zip the containing folder (webcontent), just the files and lib/ folder.  
3. On the xAPI Launch server, login and under the Apps drop down select Upload App. Choose your zip and upload.  

## Step 11 - Configure the App  
Before launching our game, we need to configure the launch settings to include our base URI so it can be passed to the game during the launch process.  
1. Select the '...' button beside 'Launch' and choose 'Edit'.  
2. Add `http://adlnet.gov/event/xapiworkshop/<<name>>` in the 'Custom Data' field.  
3. Change 'Launch Type' to 'Popup'.

## Step 12 - Try the game
Launch the game! The game should report your attempts to the ADL LRS [view here](http://adlnet.github.io/xapi-statement-viewer/).

## Bonus Challenges
If you have extra time and would like to try out more ...  

### Use the xAPI Wrapper to get statements for the current actor  
The xAPI Wrapper can also get statements. There is a session about reporting later in the day but if you have time
you can try to get statements now.
  1.  Look at the [get statements](https://github.com/adlnet/xAPIWrapper#get-statements) section of the xAPI Wrapper, specifically [getting statements based on search parameters](https://github.com/adlnet/xAPIWrapper#get-statements-based-on-search-parameters).
  2.  Try to filter the statements based on actor and activity id (see [xAPI Get Statements](https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md#723-getstatements) for the filter parameters)
  3.  Display the results on the game page
