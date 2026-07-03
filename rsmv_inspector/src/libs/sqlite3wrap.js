export function sqliteOpenDatabase(filepath, opts) {
    //only actually load the dependency when used
    let sqlite = __non_webpack_require__("sqlite3");
    let flags = (opts.write ? sqlite.OPEN_READWRITE : sqlite.OPEN_READONLY) | (opts.create ? sqlite.OPEN_CREATE : 0);
    return new Promise((done, err) => {
        let db = new sqlite.Database(filepath, flags, e => e ? err(e) : done(db));
    });
}
export function sqlitePrepare(db, query) {
    return new Promise((done, err) => {
        let stmt = db.prepare(query, e => e ? err(e) : done(stmt));
    });
}
export function sqliteExec(db, query) {
    return new Promise((done, err) => {
        db.exec(query, e => e ? err(e) : done());
    });
}
export function sqliteRunStatement(statement, args) {
    return new Promise((done, err) => {
        statement.all(args, (e, rows) => e ? err(e) : done(rows));
    });
}
