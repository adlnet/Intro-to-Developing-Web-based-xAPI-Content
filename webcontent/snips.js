// -- step 5 --
            // ADL.XAPIWrapper.changeConfig({
            //     "endpoint": "https://lrs.adlnet.gov/xapi/",
            //     "user": "xapi-workshop",
            //     "password": "password1234"
            // });
            //
            // myXAPI.baseuri = "http://adlnet.gov/event/xapiworkshop/non-launch";
            // launchdata = {
            //     actor: {
            //         account:{
            //             homePage:"http://anon.ymo.us/server",
            //             name: "unknown-user"
            //         },
            //         name: "unknown"
            //     }
            // };
            // -- end step 5 --

//7.2
  // myXAPI.statement = {
        //     actor: myactor,
        //     object: {
        //         id: myXAPI.baseuri + "/guess-the-number",
        //         definition: {
        //             name: {"en-US": "Guess the Number Game"},
        //             description: {"en-US": "Simple guess the number game to demonstrate xAPI"},
        //             type: "http://activitystrea.ms/schema/1.0/game"
        //         }
        //     },
        //     context: {
        //         contextActivities: {
        //             "grouping": [
        //                 {
        //                     "id": myXAPI.baseuri + "/dev/web"
        //                 },
        //                 {
        //                     "id": myXAPI.baseuri
        //                 }
        //             ]
        //         }
        //     }
        // };

//7.4
//     this.attemptGUID = ADL.ruuid();
//     var stmt = this.getBase();
//     stmt.verb = {
//         id: myXAPI.baseuri + "/verb/started",
//         display: {"en-US": "started"}
//     };
//     stmt.timestamp = starttime.toISOString();
//     stmt.context.registration = this.attemptGUID;
//     ADL.XAPIWrapper.sendStatement(stmt, function (resp) {
//         console.log(resp.status + " - statement id: " + resp.response);
//     });

//7.5
 //     var stmt = this.getBase();
        //     stmt.verb = {
        //         id: myXAPI.baseuri + "/verb/ended",
        //         display: {"en-US": "ended"}
        //     };
        //     stmt.timestamp = stats.endedAt.toISOString();
        //     stmt.context.registration = this.attemptGUID;
        //
        //     stmt.result = { extensions: {} };
        //     stmt.result.extensions[myXAPI.baseuri + "/guess-the-number/ext/min"] = stats.min;
        //     stmt.result.extensions[myXAPI.baseuri + "/guess-the-number/ext/max"] = stats.max;
        //     stmt.result.extensions[myXAPI.baseuri + "/guess-the-number/ext/guesses"] = stats.guesses;
        //     stmt.result.extensions[myXAPI.baseuri + "/guess-the-number/ext/number"] = stats.number;
        //     stmt.result.extensions[myXAPI.baseuri + "/guess-the-number/ext/startedAt"] = stats.startedAt.toISOString();
        //     stmt.result.extensions[myXAPI.baseuri + "/guess-the-number/ext/endedAt"] = stats.endedAt.toISOString();
        //
        //     ADL.XAPIWrapper.sendStatement(stmt, function (resp) {
        //         console.log(resp.status + " - statement id: " + resp.response);
        //     });


//7.6
//     var stmt = this.getBase();
        //     stmt.verb = {
        //         id: myXAPI.baseuri + "/verb/guessed",
        //         display: {"en-US": "guessed"}
        //     };
        //     stmt.object = {
        //         id: myXAPI.baseuri + "/number",
        //         definition: {
        //             name: {"en-US": "a number"},
        //             description: {"en-US": "Represents a number guessed in the guess a number game"},
        //             type: myXAPI.baseuri + "/activity/type/number"
        //         }
        //     };
        //     stmt.timestamp = (new Date()).toISOString();
        //     stmt.context.registration = this.attemptGUID;
        //     stmt.result = { response: num.toString() };
        //     ADL.XAPIWrapper.sendStatement(stmt, function (resp) {
        //         console.log(resp.status + " - statement id: " + resp.response);
        //     });


 		ADL.launch(function(err, launchdata, xAPIWrapper) {
        if (!err) {

            // -- step 4 --
            // ADL.XAPIWrapper = xAPIWrapper;
            // myXAPI.baseuri = launchdata.customData.content;
            // -- end step 4 --

            console.log("--- content launched via xAPI Launch ---\n", xAPIWrapper, "\n", launchdata);
        } else {
            alert("This was not initialized via xAPI Launch. Defaulting to hard-coded credentials");

            

            console.log("--- content not launched ---\n", ADL.XAPIWrapper.lrs);
        } }, true);