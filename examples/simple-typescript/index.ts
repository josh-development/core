// You can use "import Josh from 'josh'" instead of this, this is just to access the library instead of installing it.
import Josh from '../../index.js';

// Create a josh
// You can initalize a josh the same way as you initalize a normal javascript josh.
// The benifit of using typescript with josh is being able to see the types, and yeah,
// thats basically the only benifit.
const db = new Josh({
    provider: "@josh-providers/sqlite",
    name: "typescript-example",
});
db.defer.then(() => {
    db.set("Epic", true);
    var epic = db.get("Epic");
    console.log(epic);
});
// this will run before the db.set does because the database needs to be fetched.
console.log("Test!");