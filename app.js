// Copyright 2016, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

process.env.DEBUG = 'actions-on-google:*';
process.env.GSShopServerHost = "ec2-54-196-242-126.compute-1.amazonaws.com:8080"
let Assistant = require('actions-on-google').ApiAiAssistant;
let express = require('express');
let bodyParser = require('body-parser');

let request = require('request');

let app = express();
app.use(bodyParser.json({type: 'application/json'}));

// [START YourAction]
app.post('/', function (req, res) {
  const assistant = new Assistant({request: req, response: res});
  console.log('Request headers: ' + JSON.stringify(req.headers));
  console.log('Request body: ' + JSON.stringify(req.body));

// Fulfill action business logic
//   function responseHandler (assistant) {
//      // Complete your fulfillment logic and send a response
//      assistant.tell('Hello, World!');
//  }
//
//  actionMap.set(RESPONSE, responseHandler);

    const JYP_INTENT = 'jyp-action';
    function jypHandler(assistant) {
        var i = parseInt(req.body.result.parameters.number);
        // console.log("============ number : " + i*i + " ========");
        assistant.ask("It's power is " + i*i + ".");
        // assistant.ask('I love it.');
    }

    const COMMAND_INTENT = 'command-action';
    function commandHandler(assistant) {
        var korean_part = req.body.result.parameters.command;
        console.log(korean_part);
        assistant.tell("알겠습니다, 기문님! " + korean_part + "");
    }

    const TEST_INTENT = 'test-action';
    function testHandler(assistant) {
        request.get({ "url":"http://" + process.env.GSShopServerHost + "/test","body":"{}"},
            function(error,response,body) {
                console.log(JSON.stringify(response));
                var speech = "";
                console.log(body);
                speech += "You received " + JSON.parse(body).koreanMessage;
                var prompt = "Is there any thing you need more?";
                
                assistant.ask(speech + prompt, prompt);
            });
    }

    let actionMap = new Map();
    actionMap.set(JYP_INTENT, jypHandler);
    actionMap.set(COMMAND_INTENT, commandHandler);
    actionMap.set(TEST_INTENT, testHandler);

    

//   // with single handler only.
//   assistant.handleRequest(responseHandler); 
    assistant.handleRequest(actionMap);
});
// [END YourAction]

app.get("/", function(req, res) {
    res.send("Hello");
    console.log("Request for /");
})

if (module === require.main) {
  // [START server]
  // Start the server
  let server = app.listen(process.env.PORT || 8080, function () {   
    let port = server.address().port;
    console.log('App listening on port %s', port);
  });
  // [END server]
}

module.exports = app;