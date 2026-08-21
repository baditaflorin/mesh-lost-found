import { createMeshConfig } from "@baditaflorin/mesh-common";

export const config = createMeshConfig({
  appName: "mesh-lost-found",
  description: "A browser-local shared missing and found board with private claimant flow.",
  accentHex: "#e879f9",
  version: __APP_VERSION__,
  commit: __GIT_COMMIT__,
});
