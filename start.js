const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const app = express();

const port = process.env.PORT || 3000;
const botID = process.env.BOT_ID;
const url = "https://api.groupme.com/v3/bots/";
const groupID = process.env.GROUP_ID;

let heightOfWall = 0;

app.use(bodyParser.json());
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

app.post("/", (req, res) => {
    postText = "";
    const toSearchFor = "@giphy ";
    const index = req.body.text.toLowerCase().indexOf(toSearchFor);
    
    //If we found the string we're looking for get results and send them
    if (index != -1) {
        //Get the string we are searching for.
        const toSearch = req.body.text.substring(index + toSearchFor.length);
        
        //Get the total, encoded URL we're going to pass to Giphy to search
        const giphyurl = `http://api.giphy.com/v1/gifs/search?limit=5&q=${encodeURIComponent(toSearch)}&api_key=dc6zaTOxFJmzC`;
        
        request.get(giphyurl, (error, response, body) => {
            const results = JSON.parse(body)["data"];
            //Get up to the top five
            const numTopResults = (results.length < 5) ? results.length : 5;
            if (error || numTopResults === 0) {
                sendMessage(botID, "Nothing found 😥");
            } else {
                const indexSelected = Math.floor(Math.random() * (numTopResults));
                const selected = results[indexSelected].images.original.url;
                console.log(`${toSearch}=>${selected}`);
                sendMessage(botID, selected);
            }
        });
    }
    const buildTheWall = "the wall";
    const wallIndex = req.body.text.toLowerCase().indexOf(buildTheWall);
    if (wallIndex != -1 && req.body.sender_type === "user") {
        heightOfWall += 10;
        sendMessage(botID, `The wall just got 10ft higher. It's now ${heightOfWall}ft high.`);
    }
    const badHombres = "who do we have";
    const hombreIndex = req.body.text.toLowerCase().indexOf(badHombres);
    if ((hombreIndex != -1 || req.body.text.toLowerCase().indexOf("kick")) && req.body.sender_type !== "bot") {
        sendMessage(botID, "We got some BAD HOMBRES. OUT, OUT, OUT!");
    }
    res.end();
});

function sendMessage(botID, text) {
    const toSend = `${url}post?bot_id=${botID}&text=${encodeURIComponent(text)}`;
    request.post(toSend, (error, response, body) => {
        if (error) {
            console.log(error);
        }
    });
}

