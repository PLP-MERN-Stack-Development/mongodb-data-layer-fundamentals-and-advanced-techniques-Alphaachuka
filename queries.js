
// Import MongoDB client
const { count } = require('console');
const { MongoClient } = require('mongodb');

// Connection URI
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);
// Database and collection names
const dbName = 'plp_bookstore';
const collectionName = 'books';

async function runQueries() {
    try {
        await client.connect();
        const db = client.db(dbName);
        const books = db.collection(collectionName);

        console.log("\n ---- CONNECTED TO DATABASE ----\n");

        
    // TAsk 2: BAsic Queries


    console.log("\n1. Find all books in Fantasy");
    console.log(await books.find({genre: "Fantasy"}).toArray());

    console.log("\n2. Find books published after 2000");
    console.log(await books.find({published_year: {$gt: 2000}}).toArray());

    console.log("\n3. Books by Gearge Orwell");
    console.log(await books.find({author: "George Orwell"}).toArray());

    console.log("\n4. Updating price of '1984'..");
    await books.updateOne(
        { title: "1984" },
        { $set: { price: 1400 } }
    );
    console.log("Price updated");


    console.log("\n5. Deleting 'the Great Gatsby'...");
    await books.deleteOne({ title: "The Great Gatsby" });
    console.log("Book deleted");


    // TASK 3: ADVANCED QUERIES

    console.log("\nBooks in stock AND published after 2010");
    console.log(await books.find({
        in_stock: true,
        published_year: {$gt: 2010}
    }).toArray());

    console.log("\nProjection (title,author,price");
    console.log(await books.find({}, {
        projection: { title: 1, author: 1, price:1, _id: 0}
    }).toArray());

    console.log("\nBooks sorted by price (ASC):");
    console.log(await books.find().sort({price: 1}).toArray());

    console.log("\nbooks sorted by price (DESC):");
    console.log(await books.find().sort({price: -1}).toArray());

    console.log("\npagination - page 1(5 books):");
    console.log(await books.find().skip(0).limit(5).toArray()); 

    console.log("\npagination - page 2(skip 5):");
    console.log(await books.find().skip(5).limit(5).toArray());

    // AGGREGATION QUERIES

    console.log("\nAverage price by genre:");
    console.log(await books.aggregate([
        {
            $group: {_id: "$genre", averagePrice: { $avg: "$price" } }
        }
    ]).toArray());

    console.log("\nAuthor with most books:");
    console.log(await books.aggregate([
        {
            $group: {_id: "$author", Count: { $sum: 1 } }
        },
        {
            $sort: { Count: -1 }
        },
        {
            $limit: 1
        }
    ]).toArray());

    console.log("\nBooks grouped by decade:");
    console.log(await books.aggregate([
        {
            $project: {
                decade: {
                    $concat: [
                        {
                            $toString: {
                                $multiply: [
                                    { $floor: { $divide: ["$published_year", 10] } },
                                    10
                                ]
                            }
                        },
                        "s"
                    ]
                }

            }
        },
        { $group: { _id: "$decade", count: { $sum: 1 } }  }
    ]).toArray());


    //TASK 4: INDEXING

    console.log("\ncreating index on title...");
    await books.createIndex({ title: 1});

    console.log("\nCreating compound index on author + year...");
    await books.createIndex({ author: 1, published_year: -1});

    console.log("\nEXPLAIN() for title search:");
    console.log(await books.find({ title: "1984" }).explain("executionStats"));

    console.log("\nEXPLAIN() for compound index:");
    console.log(await books.find({
        author: "J.K. Rowling",
        published_year: { $gt: 2000 }
    }).explain("executionStats")
    );

    console.log("\n ---- QUERIES COMPLETED ----\n");
                

                
            

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await client.close();
    }
}

runQueries();


    

      
             

