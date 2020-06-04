 const Hapi = require('hapi');
 const mongodb = require('mongodb');

 const mongoClient = mongodb.MongoClient;
 const mongoUrl = "mongodb://localhost";
 const mongodbName = 'testdb';
 const bucketName = "DeepIntel"
 const Boom = require('boom');
 const fs = require('fs');
const MemoryStream = require('memorystream');

const init = async () => {

    const server = Hapi.server({
        port: 3000,
        host: 'localhost',
        routes: {
            cors: true
        }
    });

    server.route({
        method: 'GET',
        path: '/',
        handler: (request, h) => {


            const msg = request.query.msg
            // if(msg.startsWith("x")){
            //     return Boom.badRequest();
            // }
            // else{
            //     return "Hello " + msg;
            // }
            return new Promise((resolve, reject) => {

                setTimeout(() => {
                    if (!msg.startsWith('x')) {
                        resolve('Hello World! ' + msg);
                    }
                    else {
                        //reject('Rejected ' +msg)
                        //h.response("").code(400);
                        resolve(Boom.badRequest());
                    }

                }, 1000);


            })



        }
    });

    server.route({
        method: 'POST',
        path: '/fetchImage',
        handler: async (request, h) => {

            
            return new Promise(async (resolve, reject) => {

                const fileName = request.payload.fileName;
                console.log(`Fetching ${fileName}`);
                const client = await mongoClient.connect(mongoUrl, { useUnifiedTopology: true });
                await client.connect();
                const db = await client.db(mongodbName);
                const bucket = new mongodb.GridFSBucket(db, { bucketName: bucketName });
                const count = await bucket.find({ filename: fileName }).count();
                console.log(`Count: ${count}`)
                let image;
                if (count !== 1) {
                    console.log("Not found");
                    resolve(Boom.notFound());
                }
                else {
                    console.log("Downloading...")
                    const tempStream = new MemoryStream();
                    bucket
                        .openDownloadStreamByName(fileName)
                        .pipe(tempStream)
                        .on("error", () => {
                            console.log("Error downloading");
                            client.close();
                            resolve(Boom.internal());
                        })
                        // .on("data", (data) => {
                        //     console.log("data", data);
                        //     image = data;
                        // })
                        .on("finish", () => {
                            console.log("Finished downloading")
                            client.close();
                            const resp = h.response(tempStream).type("image/jpg");
                            resolve(resp);
                        });

                }
            })
        }
    });

    server.route({
        method: 'POST',
        path: '/fetchDocument',
        handler: async (request, h) => {

            
            return new Promise(async (resolve, reject) => {

                const fileName = request.payload.fileName;
                console.log(`Fetching ${fileName}`);
                const client = await mongoClient.connect(mongoUrl, { useUnifiedTopology: true });
                await client.connect();
                const db = await client.db(mongodbName);
                const bucket = new mongodb.GridFSBucket(db, { bucketName: bucketName });
                const count = await bucket.find({ filename: fileName }).count();
                console.log(`Count: ${count}`)
                let image;
                if (count !== 1) {
                    console.log("Not found");
                    resolve(Boom.notFound());
                }
                else {
                    console.log("Downloading...")
                    const tempStream = new MemoryStream();
                    bucket
                        .openDownloadStreamByName(fileName)
                        //.pipe(fs.createWriteStream("test.jpg"))
                        //.pipe(response)
                        .pipe(tempStream)
                        .on("error", () => {
                            console.log("Error downloading");
                            client.close();
                            //h.response("").code(500);
                            
                            resolve(Boom.internal());
                        })
                        // .on("data", (data) => {
                        //     console.log("data", data);
                        //     image = data;
                        // })
                        .on("finish", () => {
                            console.log("Finished downloading")
                            client.close();
                            //h.response(image).code(200);
                            //fs.writeFileSync("test.jpg", image);
                            //tempStream.pipe(fs.createWriteStream("abc.jpg"));
                            const resp = h.response(tempStream).type("application/octet-stream");
                            resolve(resp);
                        });

                }
            })
        }
    });

    server.route({
        method: 'POST',
        path: '/fetchMedia',
        handler: async (request, h) => {

            
            return new Promise(async (resolve, reject) => {

                const fileName = request.payload.fileName;
                console.log(`Fetching ${fileName}`);
                const client = await mongoClient.connect(mongoUrl, { useUnifiedTopology: true });
                await client.connect();
                const db = await client.db(mongodbName);
                const bucket = new mongodb.GridFSBucket(db, { bucketName: bucketName });
                const count = await bucket.find({ filename: fileName }).count();
                console.log(`Count: ${count}`)
                let image;
                if (count !== 1) {
                    console.log("Not found");
                    resolve(Boom.notFound());
                }
                else {
                    console.log("Downloading...")
                    const tempStream = new MemoryStream();
                    bucket
                        .openDownloadStreamByName(fileName)
                        .pipe(tempStream)
                        .on("error", () => {
                            console.log("Error downloading");
                            client.close();
                            resolve(Boom.internal());
                        })
                        .on("finish", () => {
                            console.log("Finished downloading")
                            client.close();
                            const resp = h.response(tempStream).type("application/octet-steram");
                            resolve(resp);
                        });

                }
            })
        }
    });

   await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();