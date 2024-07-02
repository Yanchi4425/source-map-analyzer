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

// コマンドライン引数からパラメータを取得
const [, , sourceMapPathOrURL, line, column] = process.argv;

retrieveOriginalSourcePosition(sourceMapPathOrURL, line, column);

