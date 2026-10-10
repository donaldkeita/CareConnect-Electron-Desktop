import axe, { type AxeResults, type RunOptions } from "axe-core";

const wcag21LevelAA: RunOptions = {
  runOnly: {
    type: "tag",
    values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"],
  },
};

const waitForPaint = (): Promise<void> =>
  new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });

const printResults = (results: AxeResults): void => {
  const { violations } = results;

  console.group(
    `[axe] WCAG 2.1 Level AA scan: ${violations.length} violation${violations.length === 1 ? "" : "s"}`,
  );

  console.table(
    violations.map(({ id, impact, description, nodes }) => ({
      rule: id,
      impact,
      description,
      affectedNodes: nodes.length,
    })),
  );

  for (const violation of violations) {
    console.groupCollapsed(
      `[axe] ${violation.impact ?? "unknown"}: ${violation.id} (${violation.nodes.length} node${violation.nodes.length === 1 ? "" : "s"})`,
    );
    console.info(violation.help, violation.helpUrl);

    for (const node of violation.nodes) {
      console.groupCollapsed(node.target.join(" "));
      console.info("HTML:", node.html);
      console.info(node.failureSummary ?? "No failure summary was provided.");
      console.groupEnd();
    }

    console.groupEnd();
  }

  console.info(
    "Run window.runAxeScan() after opening a dialog, popover, or different view to scan the current UI state again.",
  );
  console.groupEnd();
};

export const runAxeScan = async (): Promise<AxeResults> => {
  await waitForPaint();
  const results = await axe.run(document, wcag21LevelAA);
  printResults(results);
  return results;
};
