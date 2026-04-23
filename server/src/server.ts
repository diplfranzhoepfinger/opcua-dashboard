import { OPCUAServer, Variant, DataType, StatusCodes } from "node-opcua";
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

  // Internal state
  const state = {
    temperature: 50.0,
    position: 0.0,
    trafficLight: 0,
  };

  const tempVar = namespace.addVariable({
    organizedBy: demoFolder,
    browseName: "Temperature",
    nodeId: "s=Temperature",
    dataType: "Double",
    value: {
      get: () => new Variant({ dataType: DataType.Double, value: state.temperature }),
      set: (variant) => {
        if (variant.dataType === DataType.Double) {
          state.temperature = variant.value as number;
          return StatusCodes.Good;
        }
        return StatusCodes.BadTypeMismatch;
      },
    },
    accessLevel: "CurrentRead | CurrentWrite",
  }) as UAVariable;

  const posVar = namespace.addVariable({
    organizedBy: demoFolder,
    browseName: "Position",
    nodeId: "s=Position",
    dataType: "Double",
    value: {
      get: () => new Variant({ dataType: DataType.Double, value: state.position }),
      set: (variant) => {
        if (variant.dataType === DataType.Double) {
          state.position = variant.value as number;
          return StatusCodes.Good;
        }
        return StatusCodes.BadTypeMismatch;
      },
    },
    accessLevel: "CurrentRead | CurrentWrite",
  }) as UAVariable;

  const lightVar = namespace.addVariable({
    organizedBy: demoFolder,
    browseName: "TrafficLight",
    nodeId: "s=TrafficLight",
    dataType: "Int32",
    value: {
      get: () => new Variant({ dataType: DataType.Int32, value: state.trafficLight }),
      set: (variant) => {
        if (variant.dataType === DataType.Int32) {
          state.trafficLight = variant.value as number;
          return StatusCodes.Good;
        }
        return StatusCodes.BadTypeMismatch;
      },
    },
    accessLevel: "CurrentRead | CurrentWrite",
  }) as UAVariable;

  await server.start();
  console.log("OPC UA Server started at", server.endpoints[0].endpointDescriptions()[0].endpointUrl);

  return { server, tempVar, posVar, lightVar, state };
}
