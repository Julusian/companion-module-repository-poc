import Database from "better-sqlite3";

const db = new Database("modules.db");

const query = db.prepare("SELECT * FROM modules");
const rows = query.all();

console.log(rows);
