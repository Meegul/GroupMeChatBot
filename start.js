const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const app = express();

const port = process.env.PORT || 3000;
const botID = process.env.BOT_ID;
const url = "https://api.groupme.com/v3/bots/";
const groupID = process.env.GROUP_ID;

const isTrump = process.env.TRUMP;
let heightOfWall = 0;

const trumpChinaQuotes = ["We can’t continue to allow China to rape our country",
    "Listen, you motherfuckers, we’re going to tax you 25 percent!",
    "They are taking our jobs. China is taking our jobs. It is not going to happen anymore, folks!",
    "We’ve gone from a tremendous power that is respected all over the world to somewhat of a laughing stock and all of a sudden, people are talking about China and India and other places. That was the beginning of China.",
    "You have to bring in jobs, you have to take the jobs back from China, you have to take the jobs back from Mexico."];

const dict = new Map();
dict.set("aids", "You may get AIDS by kissing.");
dict.set("beauty", "Part of the beauty of me is that I am very rich.");
dict.set("blacks", ["I have a great relationship with the blacks", "Did you know my name is in more black songs than any other name in hip-hop? Black entertainers love Donald Trump. Russell Simmons told me that."]);
dict.set("bing", "Bing bing, bong bong, bing bing bing.");
dict.set("china", trumpChinaQuotes);
dict.set("coke", "I have never seen a thin person drinking Diet Coke.");
dict.set("daughter", "https://i.redd.it/y0mscagubhdx.jpg");
dict.set("global warming", ["Believe me, the concept of global warming was created by and for the Chinese in order to make U.S. manufacturing non-competitive.", "It's freezing and snowing in New York - we need global warming!"]);
dict.set("hillary", "Crooked Hillary is a disgrace. Sad!");
dict.set("immigrant", "They're not sending their best. They're bringing drugs, they're bringing crime, they're rapists... And some, I assume, are good people.");
dict.set("iowa", "How stupid are the people of Iowa?");
dict.set("japanese", "I have tremendous respect for the Japanese people, I mean, you can respect somebody that’s beating the hell out of you.");
dict.set("jeb", ["Excuse me, JEB!", "Please clap."]);
dict.set("kick", "We got some BAD HOMBRES. OUT, OUT, OUT!");
dict.set("lightbulb", "The boob job is terrible. They look like two lightbulbs coming out of her body.");
dict.set("lying", "Lyin' Ted is a complete and total failure.");
dict.set("marco", "Don't worry about it, Little Marco.");
dict.set("mexico", ["When are we going to beat Mexico at the border? They're laughing at us.", "They're bringing drugs. They're bringing crime. They're rapists..."]);
dict.set("money", "Black guys counting my money! I hate it. The only kind of people I want counting my money are little short guys that wear yarmulkes every day.");
dict.set("muslim", "Donald J. Trump is calling for a total and complete shutdown of Muslims entering the United States until our country's representatives can figure out what the hell is going on.");
dict.set("rug", "I don’t wear a ‘rug’—it’s mine. And I promise not to talk about your massive plastic surgeries that didn’t work.");
dict.set("sad", "SAD!");
dict.set("shoot", "I could stand in the middle of 5th Avenue and shoot somebody and I wouldn't lose voters.");
dict.set("stupid", "Sorry losers and haters, but my I.Q. is one of the highest - and you all know it! Please don't feel so stupid or insecure, it's not your fault.");
dict.set("suspense", "I'll keep you in suspense.");
dict.set("ted", "Lyin' Ted would have been a total DISASTER.");
dict.set("who do we have", "We got some BAD HOMBRES. OUT, OUT, OUT!");
dict.set("woman", ["You know, it doesn’t really matter what the media writes as long as you’ve got a young and beautiful piece of ass."]);
dict.set("viagra", "With the proper woman, you don't need Viagra.");
dict.set("vietnam", "It is a dangerous world out there — it’s scary, like Vietnam. Sort of like the Vietnam era. It is my personal Vietnam. I feel like a great and very brave soldier.");

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
    if (isTrump && req.body.sender_type !== "bot") {
        const buildTheWall = "the wall";
        const wallIndex = req.body.text.toLowerCase().indexOf(buildTheWall);
        if (wallIndex != -1) {
            heightOfWall += 10;
            sendMessage(botID, `The wall just got 10ft higher. It's now ${heightOfWall}ft high.`);
        }
        for (const [key, value] of dict) {
            let index;
            if (!key.includes(" ")) {
                index = req.body.text.toLowerCase().split(/[\W\d]+/).indexOf(key);
            } else {
                index = req.body.text.toLowerCase().indexOf(key);
            }
            if (index != -1) {
                if (typeof(value) === "string") {
                    sendMessage(botID, value);
                } else if (typeof(value) === "object") {
                    sendMessage(botID, value[Math.floor(Math.random() * (value.length))]);
                } else {
                    console.log("Type error.");
                }
            }
        }
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

