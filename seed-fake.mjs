#!/usr/bin/env zx
// @ts-check

import { fs, path } from "zx";
import Database from "better-sqlite3";

const db = new Database("modules.db");

const fakeId = "fake-module";

db.exec(
  "CREATE TABLE IF NOT EXISTS modules (id TEXT PRIMARY KEY, name TEXT KEY, version TEXT KEY, json TEXT)"
);

const query = db.prepare("DELETE FROM modules WHERE name = @name");
query.run({
  name: fakeId,
});

const query2 = db.prepare(
  `INSERT INTO modules (id, name, version, json) VALUES (@id, @name, @version, @json)`
);

function createFakeManifest(version, apiVersion) {
  /** @type {import('@companion-module/base').ModuleManifest} */
  const res = {
    id: fakeId,
    name: fakeId,
    shortname: fakeId,
    manufacturer: fakeId,
    products: ["fake-test"],
    runtime: {
      type: "node22",
      api: "nodejs-ipc",
      apiVersion,
      entrypoint: "main.js",
    },
    description: "",
    version,
    license: "MIT",
    repository: "",
    bugs: "",
    maintainers: [],
    legacyIds: [],
    keywords: [],
  };

  return res;
}

query2.run({
  id: `${fakeId}-0.4.0`,
  name: fakeId,
  version: "0.4.0",
  json: JSON.stringify(createFakeManifest("0.4.0", "0.4.0")),
});
query2.run({
  id: `${fakeId}-1.0.0`,
  name: fakeId,
  version: "1.0.0",
  json: JSON.stringify(createFakeManifest("1.0.0", "1.0.0")),
});
query2.run({
  id: `${fakeId}-1.5.0`,
  name: fakeId,
  version: "1.5.0",
  json: JSON.stringify(createFakeManifest("1.5.0", "1.5.5")),
});
query2.run({
  id: `${fakeId}-1.22.1`,
  name: fakeId,
  version: "1.22.1",
  json: JSON.stringify(createFakeManifest("1.22.1", "1.22.0")),
});
query2.run({
  id: `${fakeId}-1.99.0`,
  name: fakeId,
  version: "1.99.0",
  json: JSON.stringify(createFakeManifest("1.99.0", "2.1.0")),
});
