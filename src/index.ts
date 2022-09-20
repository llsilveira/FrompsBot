import "./setup";

import cli from "./cli";

if (require.main === module) {
  // TODO: catch and log possible errors
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  cli(process.argv);
}
