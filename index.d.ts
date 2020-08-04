export = Josh;
declare interface joshOptions {
    provider: string;
    name: string;
}
declare class Josh {
    defer: Promise<any>;
    /**
     * Initalize a new Josh.
     * @param options.provider The provider to use with Josh.
     * @param options.name The name of the Josh.
     * @example
     */
    constructor(options: {
        provider: string,
        name: string,
    });

    dec(...args: any[]): void;
    /**
     * 
     * @param keyOrPath The key/path to delete.
     * @see "Enmap Basics" - https://enmap.evie.dev/api#enmap-delete-key-path-enmap
     * @example 
     * // Wait until database is loaded then query.
     * db.defer.then( () => {
     *      db.set("FavouriteFruit", "Apple");
     *      db.delete("FavouriteFruit"); // Deletes "FavouriteFruit" from the database
     *      db.delete(db.all) // Deletes the entire database.
     * })
     */
    delete(keyOrPath: string): void;

    ensure(...args: any[]): void;

    /**
     * 
     * @param keyOrPath The key/path to get. Returns undefined if the key does not exist.
     * @see "Enmap Basics" - https://enmap.evie.dev/api#enmap-get-key-path
     * @returns {any} Value
     * @example 
     * // Wait until database is loaded then query.
     * db.defer.then( () => {
     *      db.set("FavouriteFruit", "Apple");
     *      db.get("FavouriteFruit") // Returns "Apple"
     *      db.get("WorstFruit") // Returns undefined because it doesn't exist.
     * })
     */
    get(keyOrPath: string): any;
    /**
     * 
     * @param keyOrPath The key to check. Returns false if the key does not exist and true if it does.
     * @see "Enmap Basics" - https://enmap.evie.dev/api#enmap-has-key-path-boolean
     * @returns {Boolean} True/False
     * @example 
     * // Wait until database is loaded then query.
     * db.defer.then( () => {
     *      db.set("FavouriteFruit", "Apple");
     *      db.has("FavouriteFruit") // Returns true
     *      db.get("WorstFruit") // Returns false because it doesn't exist
     * })
     */
    has(keyOrPath: string): void;

    inc(...args: any[]): void;

    push(...args: any[]): void;
    /**
     * @param {number} count The amount of random values you want.
     * @default count = 1
     * @returns {Array<any>} An array of values.
     */
    random(count: number = 1): void;
    /**
     * @param {number} count The amount of random keys you want.
     * @default count = 1
     * @returns {Array<string>} An array of keys.
     */
    randomKey(count: number = 1): void;

    readyCheck(...args: any[]): void;

    remove(keyOrPath: string): void;
    /**
     * 
     * @param keyOrPath The name of the key/path.
     * @param value The value to set.
     * @see "Enmap Basics" - https://enmap.evie.dev/api#enmap-set-key-val-path-enmap
     * @example 
     * // Wait until database is loaded then query.
     * db.defer.then( () => {
     *      db.set("FavouriteFruit", "Apple"); // Set "FavouriteFruit" to "Apple"
     *      db.set("WorstFruits", ["Pineapple", "Bannana"]) // Set "WorstFruits" to an array.
     *      db.get("WorstFruits.0") // Get WorstFruits[0], returns "Pineapple"
     *      db.get("FavouriteFruit") // Get "FavouriteFruit," returns "Apple"
     * })
     */
    set(keyOrPath: string, value: any): void;
    /**
     * 
     * @param {string} key The name of the key/path to merge.
     * @param {object} input The object to merge.
     * @see "Josh Basics" - TODO: ADD URL TO UPDATE API METHOD
     * @example 
     * // Wait until database is loaded then query.
     * db.defer.then( () => {
     *      db.set("FavouriteFruit", {fruit: "Apple"}); // Set "FavouriteFruit" to "Apple"
     *      db.get("FavouriteFruit") // Returns {fruit: "Apple"}
     *      db.update("FavouriteFruit", {mouldy: true}) // Update "FavouriteFruit" to {fruit: "Apple", mouldy: true}
     *      db.get("FavouriteFruit") // Returns {fruit: "Apple", mouldy: true}
     * })
     */
    update(key: string, input: object): void;

    static providers: {
        mongo: "@josh-providers/mongo";
        sqlite: "@josh-providers/sqlite";
        http: "@josh-providers/http";
        postgre: "@josh-providers/postgre";
    };
}
