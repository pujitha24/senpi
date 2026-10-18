import { describe, expect, it } from "vitest";
import { JuliaKernel } from "../src/kernels/jl/kernel.ts";

// senpi#3500: a binary that cannot be spawned never had a process to outlive SIGKILL, so the spawn error must
// survive retirement instead of being replaced by "did not exit after SIGKILL".
describe("subprocess kernel spawn failure", () => {
	it("reports the spawn error and closes cleanly when the interpreter binary is missing", async () => {
		const kernel = JuliaKernel.start({
			command: "senpi-test-missing-julia-binary",
			cwd: process.cwd(),
			sessionId: "spawn-failure",
			connection: { port: 1, token: "test-only" },
		});
		const result = await kernel.run({ cellId: "first", code: "1" }).catch((error: unknown) => error);
		expect(String(result instanceof Error ? result.message : JSON.stringify(result))).toContain("ENOENT");
		await expect(kernel.close()).resolves.toBeUndefined();
	});
});
