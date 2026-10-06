const { mkdtempSync, rmSync } = require("node:fs");
const { tmpdir } = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const output = mkdtempSync(path.join(tmpdir(), "dodix-flow-tests-"));
let code = 1;
try {
  const compile = spawnSync(process.execPath, [
    require.resolve("typescript/bin/tsc"), "src/lib/request-flow.ts", "src/lib/catalog.ts",
    "--outDir", output, "--module", "commonjs", "--target", "ES2020",
    "--lib", "ES2020,DOM", "--strict", "--skipLibCheck", "--types", "node",
  ], { cwd: root, stdio: "inherit" });
  if (compile.error) throw compile.error;
  code = compile.status ?? 1;
  if (code === 0) {
    const test = spawnSync(process.execPath, ["--test", "tests/request-flow.test.cjs"], {
      cwd: root, stdio: "inherit",
      env: { ...process.env, FLOW_TEST_BUILD: output },
    });
    if (test.error) throw test.error;
    code = test.status ?? 1;
  }
} finally {
  if (path.dirname(path.resolve(output)) !== path.resolve(tmpdir()) ||
      !path.basename(output).startsWith("dodix-flow-tests-")) {
    throw new Error("Unexpected test output directory");
  }
  rmSync(output, { recursive: true, force: true });
}
process.exitCode = code;
