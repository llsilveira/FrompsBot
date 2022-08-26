import "./setup";

import cli from "./cli";

if (require.main === module) {
  // TODO: ERROR LOGGING
  cli(process.argv).catch(() => {
    // pass
  });
}
