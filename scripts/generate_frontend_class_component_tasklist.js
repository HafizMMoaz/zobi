
// Run this from the frontend directory with
// `node ../scripts/generate_frontend_ts_tasklist.js `, then copy and paste the output into
// https://github.com/HafizMMoaz/zobi/discussions/26076
const { readdirSync, readFileSync } = require("fs");
const process = require("process");

const INITIAL_DIRECTORIES = ["spec", "src", "packages"];
const DEFAULT_DIRECTORY = process.cwd();

const getDirectories = (source) =>
  readdirSync(source, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

const getFilesByExtensions = (source, extensions) =>
  readdirSync(source, { withFileTypes: true })
    .filter((dirent) =>
      extensions.some((extension) => dirent.name.endsWith(extension))
    )
    .map((dirent) => dirent.name);

const hasClassComponent = (filePath) => {
  const fileContent = readFileSync(filePath, "utf8");
  const classComponentRegex =
    /class\s+\w+\s+extends\s+(React\.Component|React\.PureComponent)/g;
  return classComponentRegex.test(fileContent);
};

let directories = INITIAL_DIRECTORIES;

while (directories.length) {
  const curDirectory = directories.pop();
  process.chdir(curDirectory);
  // Check for existence of class components in js, jsx, ts, and tsx files. Show an empty box if
  // it has a class Component and a filled box if it does not.
  const files = getFilesByExtensions("./", [".js", ".jsx", ".ts", ".tsx"]);

  if (files.length > 0) {
    const hasClassComponents = files.some((file) =>
      hasClassComponent(`./${file}`)
    );
    if (hasClassComponents) {
      console.log(`- [ ] \`${curDirectory}\``);
    }
  }

  directories = directories.concat(
    getDirectories("./")
      .reverse() // For ABC order when pushed into the Array
      .filter((name) => name !== "node_modules") // Don't include node_modules in our packages
      .map((directory) => `${curDirectory}/${directory}`)
  );
  process.chdir(DEFAULT_DIRECTORY);
}
