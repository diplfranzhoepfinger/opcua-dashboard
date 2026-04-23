import { createOpcuaServer } from "./server";
import { startGateway } from "./gateway";
import { startSimulator } from "./simulator";

async function main() {
  const { server, tempVar, posVar, lightVar } = await createOpcuaServer();
  startGateway(26543, 4444);
  startSimulator(tempVar, posVar, lightVar);

  console.log("\n========================================");
  console.log("Dashboard Server ready!");
  console.log("  OPC UA TCP: opc.tcp://localhost:26543");
  console.log("  WS Gateway: ws://localhost:4444");
  console.log("========================================\n");

  // Graceful shutdown
  process.on("SIGINT", async () => {
    console.log("\nShutting down...");
    await server.shutdown();
    process.exit(0);
  });
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
