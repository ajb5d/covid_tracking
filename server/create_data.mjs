#!/usr/bin/env node
'use strict';

import * as path from 'path';
import fetch from 'node-fetch';
import { stat } from 'fs/promises'

async function getFileUpdateTime(path) {
    return stat(path)
        .then((result) => result.mtime)
        .catch(() => new Date(0));
}

async function getRemoteUpdate(URL) {
    return fetch(URL, { method: "Get"})
        .then(response => response.json())
        .then(metadata => new Date(metadata.dataUpdatedAt));
}

async function callIfTargetStale(target, sourceMetadata, f) {
    Promise.all([target, sourceMetadata]).then((values) => {
        console.log(values)
        if (values[0] < values[1]) {
            console.log("Should Update")
            f();
        } else {
            console.log("Won't update")
        }
    });
}

function pathForTarget(file) {
    return path.join(".", file)
}

callIfTargetStale(
    getFileUpdateTime(pathForTarget("output.json")),
    getRemoteUpdate("https://data.virginia.gov/api/views/metadata/v1/bre9-aqqr"),
    () => {
        console.log("UPDATE FUNC");
});