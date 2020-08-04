export = josh;
export = providers;
export = joshOptions;

declare enum providers {
    /**
     * @todo Implement a mongoDB provider.
     * @summary The mongoDB provider, currently not implemented in versions 0.0.5 and below.
     */
    mongo = "@josh-providers/mongo",
    /**
     * @summary The sqlite provider, currently the only provider.
     */
    sqlite = "@josh-providers/sqlite",
    /**
     * @todo Implement a postgre provider.
     * @summary The mongoDB provider, currently not implemented in versions 0.0.5 and below.
     */
    postgre = "@josh-providers/postgre",
    /**
     * @todo Implement a http provider.
     * @summary The mongoDB provider, currently not implemented in versions 0.0.5 and below.
     */
    http = "@josh-providers/http",
}
declare interface joshOptions {
    provider: string | providers;
    name: string;
}
declare class josh {
    /**
     * Initalize a new Josh.
     * @param {joshOptions} options The options to initialize Josh with.
     * @example
     */
    constructor(options: joshOptions);

    dec(...args: any[]): void;
    /**
     * 
     * @param key The key to delete.
     * @see "Enmap Basics" - https://enmap.evie.dev/api#enmap-delete-key-path-enmap
     * @example 
     * // Wait until database is loaded then query.
     * db.defer.then( () => {
     *      db.set("FavouriteFruit", "Apple");
     *      db.delete("FavouriteFruit"); // Deletes "FavouriteFruit" from the database
     *      db.delete(db.all) // Deletes the entire database.
     * })
     */
    delete(key: string): void;

    ensure(...args: any[]): void;

    /**
     * 
     * @param key The key to get. Returns undefined if the key does not exist.
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
    get(key: string): any;
    /**
     * 
     * @param key The key to check. Returns false if the key does not exist and true if it does.
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
    has(key: string): void;

    inc(...args: any[]): void;

    push(...args: any[]): void;

    random(...args: any[]): void;

    randomKey(...args: any[]): void;

    readyCheck(...args: any[]): void;

    remove(key: string): void;
    /**
     * 
     * @param key The name of the key.
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
    set(key: string, value: any): void;
    /**
     * 
     * @param key The name of the key to merge.
     * @param value The object to merge.
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
    update(key: string, value: any): void;

    static providers: {
        mongo: providers.mongo;
        sqlite: providers.sqlite;
        http: providers.http;
        postgre: providers.postgre;
    };
}


