import { OPCUAServer, Variant, DataType } from "node-opcua";
import type { UAVariable } from "node-opcua";

export async function createOpcuaServer() {
  const server = new OPCUAServer({
    port: 26543,
    resourcePath: "/UA/MyServer",
    buildInfo: {
      productName: "OpcuaDashboardServer",
      buildNumber: "1",
      buildDate: new Date(),
    },
  });

  await server.initialize();

  const addressSpace = server.engine.addressSpace;
  if (!addressSpace) {
    throw new Error("AddressSpace not initialized");
  }

  const namespace = addressSpace.getOwnNamespace();
  const demoFolder = namespace.addFolder("ObjectsFolder", { browseName: "Demo" });

  const tempVar = namespace.addVariable({
    organizedBy: demoFolder,
    browseName: "Temperature",
    nodeId: "s=Temperature",
    dataType: "Double",
    minimumSamplingInterval: 10,
    value: new Variant({ dataType: DataType.Double, value: 50.0 }),
    accessLevel: "CurrentRead",
  }) as UAVariable;

  const posVar = namespace.addVariable({
    organizedBy: demoFolder,
    browseName: "Position",
    nodeId: "s=Position",
    dataType: "Double",
    minimumSamplingInterval: 10,
    value: new Variant({ dataType: DataType.Double, value: 0.0 }),
    accessLevel: "CurrentRead",
  }) as UAVariable;

  const lightVar = namespace.addVariable({
    organizedBy: demoFolder,
    browseName: "TrafficLight",
    nodeId: "s=TrafficLight",
    dataType: "Int32",
    minimumSamplingInterval: 10,
    value: new Variant({ dataType: DataType.Int32, value: 0 }),
    accessLevel: "CurrentRead",
  }) as UAVariable;

  await server.start();
  console.log("OPC UA Server started at", server.endpoints[0].endpointDescriptions()[0].endpointUrl);

  return { server, tempVar, posVar, lightVar };
}
