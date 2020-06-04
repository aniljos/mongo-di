var express = require('express');
var bodyParser = require('body-parser');
//var streams = require('memory-streams')
var app = express();
//const fs = require('fs');
//const path = require('path');
const mongodb = require('mongodb');

const mongoUrl = "mongodb://localhost";
const mongodbName = 'testdb';


//static
app.use("/static", express.static('public'));
// convert request to JSON Object
app.use(bodyParser.json());

//enable Cross-Origin requests
app.use(function (req, resp, next) {

    resp.setHeader("Access-Control-Allow-Origin", "*");
    resp.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    resp.setHeader("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers");
    next();
})


app.get("/hello", function (req, resp) {
    resp.send({ message: "Hello World" });
});

app.post("/fetchMedia", function (req, resp) {


    const body = req.body;
    console.log(body);
    const fileName = body.fileName;
    console.log(`Fetching ${fileName}`);
    const client = new mongodb.MongoClient(mongoUrl, { useUnifiedTopology: true });

    client.connect(async err => {

        if (err) {
            console.log("Failed to connect...");
            resp.status(500).send("Connect Error");
            return;
        }

        console.log("connected");
        const db = client.db(mongodbName);
        const bucket = new mongodb.GridFSBucket(db, { bucketName: "DeepIntel" });

        const count = await bucket.find({ filename: fileName }).count();
        console.log(`Count: ${count}`)
        if (count !== 1) {
            console.log("Not found");
            resp.status(404);
            resp.end();
            return;
        }
        else {
            console.log("Downloading...")
            bucket
                .openDownloadStreamByName(fileName)
                .pipe(resp)
                .on("error", () => {
                    console.log("Error downloading");
                    client.close();
                    resp.status(500).send("error downloading")
                })
                .on("finish", () => {
                    console.log("Finished downloading")
                    client.close();
                    resp.end();
                });

        }



    });
    console.log("Code over");



})


app.listen(9000, () => {
    console.log("App Started at 9000...");
});