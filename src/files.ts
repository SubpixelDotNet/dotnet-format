import { extname } from "path";

import { getInput } from "@actions/core";
import { context, GitHub } from "@actions/github";

import type { Octokit } from "@octokit/rest";

enum fileStatus {
  /**
   * The file was added.
   */
  added = "added",

  /**
   * The mode of the file was changed or there are unknown changes because the diff was truncated.
   */
  changed = "changed",

  /**
   * The content of the file was modified.
   */
  modified = "modified",

  /**
   * The file was removed.
   */
  removed = "removed",

  /**
   * The file was renamed.
   */
  renamed = "renamed",
}

const fileTypes = [
  ".cs",
  ".vb",
];

export async function getPullRequestFiles(subdirectory?: string): Promise<string[]> {
  const token = getInput("repo-token", { required: true });
  const githubClient = new GitHub(token);

  const pullNumber = (context.payload.issue || context.payload.pull_request || context.payload).number;

  if (!pullNumber) {
    throw Error("Unable to get pull request number from action event");
  }

  const listFilesOptions = githubClient.pulls.listFiles.endpoint.merge({
    ...context.repo,
    pull_number: pullNumber,
  });

  const files: Octokit.PullsListFilesResponse = await githubClient.paginate(listFilesOptions);

  let fileNames = files
    .filter(file => file.status !== fileStatus.removed)
    .filter(file => fileTypes.includes(extname(file.filename)))
    .map(file => file.filename);

  if (subdirectory) {
    const subdir = subdirectory;
    fileNames = fileNames.map(name => name.startsWith(subdir) ? name.substring(subdir.length) : name);
  }

  return fileNames;
}
