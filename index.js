const fs = require("fs");
const https = require("https");
const sourceMap = require("source-map");

const downloadSourceMap = (url) => {
    return new Promise((resolve, reject) => {
        https
            .get(url, (response) => {
                let data = "";
                response.on("data", (chunk) => {
                    data += chunk;
                });

                response.on("end", () => {
                    resolve(data);
                });
            })
            .on("error", (error) => {
                reject(error);
            });
    });
};

const retrieveOriginalSourcePosition = async (
    sourceMapPathOrURL,
    line,
    column
) => {
    let rawSourceMap;
    if (
        sourceMapPathOrURL.startsWith("http://") ||
        sourceMapPathOrURL.startsWith("https://")
    ) {
        rawSourceMap = await downloadSourceMap(sourceMapPathOrURL);
    } else {
        rawSourceMap = fs.readFileSync(sourceMapPathOrURL, "utf8");
    }

    const consumer = await new sourceMap.SourceMapConsumer(rawSourceMap);
    const position = consumer.originalPositionFor({
        line: Number(line),
        column: Number(column),
    });

    console.log(position);
};

const parseArguments = (arg) => {
    const regex = /^[^(]*\(?((https?:\/\/.+):(\d+):(\d+))\)?$/;
    const match = arg.match(regex);
    if (!match) {
        throw new Error(
            "Invalid argument format. Expected format: 'method(url:line:column)'"
        );
    }
    const [_, originalUrl, url, line, column] = match;
    return {
        originalUrl,
        url: `${url}.map`,
        line: Number(line),
        column: Number(column),
    };
};

// コマンドライン引数からパラメータを取得
const [, , arg] = process.argv;
const { url, line, column } = parseArguments(arg);

retrieveOriginalSourcePosition(url, line, column);
