import console from "./overwriteConsole.js";
import { Command } from "../../commander/index.js";
import { packageStringParse } from "../utils/index.js";
import { existsSync, unlinkSync, rmSync } from "fs";
import { join } from "path/posix";
import { homedir } from "os";
import { cwd } from "process";

const program = new Command();

program.option("-d, --disk", "uninstall from disk");

program.parse(process.argv);

if (program.opts().disk)
  console.warn("Uninstalling from disk is dangerous and can BREAK projects");

const name = program.args;

for (let item of name) {
  var { prefix, packagename, version } = packageStringParse(item);
  let node_moduleFolder = join(cwd(), "node_modules", packagename);
  let resolvefolder = join(
    homedir(),
    ".toastpack",
    "packages",
    encodeURIComponent(`${prefix}-${packagename}-${version}`)
  );
  if (existsSync(node_moduleFolder)) {
    unlinkSync(node_moduleFolder);
  }
  if (program.opts().disk) {
    rmSync(resolvefolder, { recursive: true });
  }
}
