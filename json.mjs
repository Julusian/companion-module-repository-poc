#!/usr/bin/env zx

import { fs, path } from "zx";
import Database from "better-sqlite3";

const db = new Database("modules.db");

const query = db.prepare("SELECT * FROM modules");
const rows = query.all();

// console.log(rows);

console.log("Removing old json folder");
await fs.rm("json", { recursive: true }).catch(() => null);
await fs.mkdir("json");

const moduleNames = new Set(rows.map((row) => row.name));
console.log("found modules", moduleNames.size);

const moduleData = {};

for (const name of moduleNames) {
  const moduleVersions = rows.filter((row) => row.name === name);
  const versions = moduleVersions.map((row) => {
    //   return JSON.parse(row.json);

    const jsonObj = JSON.parse(row.json);

    return {
      id: row.version,
      isPrerelease: false,
      releasedAt: new Date("2021-01-01").getTime(), // TODO - derive from version number?
      tarUrl: `https://github.com/Julusian/companion-module-repository-poc/raw/refs/heads/main/generated/${row.name}-${row.version}.tgz`,
      apiVersion: jsonObj.runtime.apiVersion,
      deprecationReason: null,
    };
  });

  // {
  //     id: '5.4.3',
  //     isPrerelease: false,
  //     releasedAt: new Date('2021-01-01').getTime(),
  //     tarUrl: 'https://builds.julusian.dev/companion-builds/pkg%20(2).tgz',
  //     apiVersion: '2.0.0',
  //     deprecationReason: null,
  // },

  await fs.writeFile(
    path.join("json", `${name}.json`),
    JSON.stringify({ versions }, null, 2)
  );

  const moduleInfo = JSON.parse(moduleVersions[0].json);

  moduleData[name] = {
    id: moduleInfo.id,
    name: moduleInfo.name,
    shortname: moduleInfo.shortname,
    manufacturer: moduleInfo.manufacturer,
    products: moduleInfo.products,
    keywords: moduleInfo.keywords,

    storeUrl: `https://bitfocus.io/connections/${moduleInfo.id}`,
    githubUrl: `https://github.com/bitfocus/companion-module-${moduleInfo.id}`,

    deprecationReason: null,
  };
}

console.log("generting root manifest");
await fs.writeFile(
  path.join("json", `_all.json`),
  JSON.stringify(moduleData, null, 2)
);
