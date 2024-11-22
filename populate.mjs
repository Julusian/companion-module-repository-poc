#!/usr/bin/env zx

import { argv, fs, path } from "zx";
import Database from "better-sqlite3";

const branch = argv._[0] || "main";

const db = new Database("modules.db");

db.exec(
  "CREATE TABLE IF NOT EXISTS modules (id TEXT PRIMARY KEY, name TEXT KEY, version TEXT KEY, json TEXT, created_at TIMESTAMP)"
);

const query = db.prepare(
  "SELECT * FROM modules WHERE name = @name AND version = @version"
);
const query2 = db.prepare(
  `INSERT INTO modules (id, name, version, json) VALUES (@id, @name, @version, @json)`
);

console.log("Removing old git clone");
await fs.rm(".tmp-git", { recursive: true }).catch(() => null);

console.log(`Cloning: ${branch}`);
await $`git clone https://github.com/bitfocus/companion-bundled-modules.git --depth 1 --branch=${branch} .tmp-git`;

console.log("iterating");
const modules = await fs.readdir(".tmp-git");
for (const name of modules) {
  if (
    name === ".git" ||
    name === ".github" ||
    name === "LICENSE" ||
    name === "README.md" ||
    name === "_legacy"
  )
    continue;

  try {
    const basePath = `.tmp-git/${name}`;
    const jsonStr = await fs.readFile(
      path.join(basePath, "companion/manifest.json"),
      "utf8"
    );
    const json = JSON.parse(jsonStr);

    let buildDate = null
    try {
      const buildInfo = await fs.readFile(
        path.join(basePath, ".build-info"),
        "utf8"
      )

      const match = /UPDATE_DATE=(.+)/.exec(buildInfo)
      if (match) {
        buildDate = new Date(match[1])
      }
    } catch (e) {
      console.error('Failed to parse build-info')
    }

    const row = query.get({ name: json.id, version: json.version });
    if (row) {
      //   console.log(`Already exists ${json.id}@${json.version}`);
      continue;
    }

    // create new tar
    const tarFilename = `generated/${name}-${json.version}.tgz`
    if (await fs.exists(tarFilename)) {
      console.log('skipping generation of tar', tarFilename )
    } else {
      $`tar -cvzf ${tarFilename} -C ${basePath} .`;
    }

    query2.run({
      id: `${json.id}-${json.version}`,
      name: json.id,
      version: json.version,
      json: jsonStr,
      created_at: new Date().toISOString(),
    });
    console.log("Added", json.id, json.version);
  } catch (e) {
    console.error(`Error processing ${name}: ${e.message}`);
    continue;
  }
}
