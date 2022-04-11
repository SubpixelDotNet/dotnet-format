import { getInput, setFailed } from "@actions/core";

import { check, fix } from "./actions";

export async function run(): Promise<void> {
  try {
    const action = getInput("action", { required: true });

    switch (action) {
      case "check":
        await check();
        break;

      case "fix":
        await fix();
        break;

      default:
        throw Error(`Unsupported action "${action}"`);
    }
  } catch (error) {
    const anyError = error as object as any;
    setFailed(anyError.message);
    throw error;
  }
}

run();
