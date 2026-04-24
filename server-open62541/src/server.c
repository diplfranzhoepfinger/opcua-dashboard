#include <open62541/plugin/log_stdout.h>
#include <open62541/plugin/accesscontrol_default.h>
#include <open62541/server.h>
#include <open62541/server_config_default.h>

#ifdef UA_ENABLE_WEBSOCKET_SERVER
#include <open62541/network_ws.h>
#endif

#include <signal.h>
#include <stdlib.h>
#include <math.h>

static volatile UA_Boolean running = true;
static void stopHandler(int sig) {
    (void)sig;
    running = false;
}

/* Simulated variables */
static UA_Double temperature = 50.0;
static UA_Double position = 0.0;
static UA_Int32 trafficLight = 0;

static UA_NodeId temperatureNodeId;
static UA_NodeId positionNodeId;
static UA_NodeId trafficLightNodeId;

static void
simulationCallback(UA_Server *server, void *data) {
    (void)data;
    static UA_UInt64 simTime = 0;
    static int lightTimer = 0;

    simTime += 100; /* 100 ms */

    /* Temperature: Sine wave 20-80C, period 10s */
    temperature = 50.0 + 30.0 * sin((simTime / 10000.0) * 2.0 * M_PI);

    /* Position: Sawtooth 0-1000mm, period 5s */
    position = ((simTime % 5000) / 5000.0) * 1000.0;

    /* Traffic light: Austrian cycle (in 100ms ticks) */
    lightTimer++;
    const int GREEN_DURATION = 30;      /* 3s */
    const int YELLOW_DURATION = 10;     /* 1s */
    const int RED_DURATION = 30;        /* 3s */
    const int RED_YELLOW_DURATION = 10; /* 1s */
    int cycleLength = GREEN_DURATION + YELLOW_DURATION + RED_DURATION + RED_YELLOW_DURATION;
    int cyclePos = lightTimer % cycleLength;

    if (cyclePos < GREEN_DURATION) {
        trafficLight = 0; /* Green */
    } else if (cyclePos < GREEN_DURATION + YELLOW_DURATION) {
        trafficLight = 1; /* Yellow */
    } else if (cyclePos < GREEN_DURATION + YELLOW_DURATION + RED_DURATION) {
        trafficLight = 2; /* Red */
    } else {
        trafficLight = 3; /* Red+Yellow */
    }

    /* Write values to server */
    UA_Variant value;
    UA_Variant_init(&value);

    UA_Variant_setScalar(&value, &temperature, &UA_TYPES[UA_TYPES_DOUBLE]);
    UA_Server_writeValue(server, temperatureNodeId, value);

    UA_Variant_setScalar(&value, &position, &UA_TYPES[UA_TYPES_DOUBLE]);
    UA_Server_writeValue(server, positionNodeId, value);

    UA_Variant_setScalar(&value, &trafficLight, &UA_TYPES[UA_TYPES_INT32]);
    UA_Server_writeValue(server, trafficLightNodeId, value);
}

int main(void) {
    signal(SIGINT, stopHandler);
    signal(SIGTERM, stopHandler);

    UA_Server *server = UA_Server_new();
    if (!server) {
        return EXIT_FAILURE;
    }

    UA_ServerConfig *config = UA_Server_getConfig(server);
    UA_ServerConfig_setBasics(config);

    /* Add WebSocket network layer on port 4444 */
#ifdef UA_ENABLE_WEBSOCKET_SERVER
    UA_ServerConfig_addNetworkLayerWS(config, 4444, 0, 0, NULL, NULL);
#else
    UA_ServerConfig_addNetworkLayerTCP(config, 4444, 0, 0);
#endif

    /* Enable anonymous login BEFORE adding endpoints */
    UA_AccessControl_default(config, true, NULL, NULL, 0, NULL);

    UA_ServerConfig_addSecurityPolicyNone(config, NULL);
    UA_ServerConfig_addEndpoint(config,
                                UA_SECURITY_POLICY_NONE_URI,
                                UA_MESSAGESECURITYMODE_NONE);

    /* Add Demo folder */
    UA_ObjectAttributes oAttr = UA_ObjectAttributes_default;
    oAttr.displayName = UA_LOCALIZEDTEXT("en-US", "Demo");
    UA_NodeId demoFolderId;
    UA_Server_addObjectNode(server, UA_NODEID_NULL,
                            UA_NODEID_NUMERIC(0, UA_NS0ID_OBJECTSFOLDER),
                            UA_NODEID_NUMERIC(0, UA_NS0ID_ORGANIZES),
                            UA_QUALIFIEDNAME(1, "Demo"),
                            UA_NODEID_NUMERIC(0, UA_NS0ID_FOLDERTYPE),
                            oAttr, NULL, &demoFolderId);

    /* Add Temperature variable (ns=1;s=Temperature) */
    UA_VariableAttributes vAttr = UA_VariableAttributes_default;
    vAttr.displayName = UA_LOCALIZEDTEXT("en-US", "Temperature");
    vAttr.description = UA_LOCALIZEDTEXT("en-US", "Temperature in Celsius");
    vAttr.dataType = UA_TYPES[UA_TYPES_DOUBLE].typeId;
    vAttr.accessLevel = UA_ACCESSLEVELMASK_READ;
    UA_Variant_setScalar(&vAttr.value, &temperature, &UA_TYPES[UA_TYPES_DOUBLE]);
    temperatureNodeId = UA_NODEID_STRING(1, "Temperature");
    UA_Server_addVariableNode(server, temperatureNodeId, demoFolderId,
                              UA_NODEID_NUMERIC(0, UA_NS0ID_ORGANIZES),
                              UA_QUALIFIEDNAME(1, "Temperature"),
                              UA_NODEID_NUMERIC(0, UA_NS0ID_BASEDATAVARIABLETYPE),
                              vAttr, NULL, NULL);

    /* Add Position variable (ns=1;s=Position) */
    vAttr = UA_VariableAttributes_default;
    vAttr.displayName = UA_LOCALIZEDTEXT("en-US", "Position");
    vAttr.description = UA_LOCALIZEDTEXT("en-US", "Position in mm");
    vAttr.dataType = UA_TYPES[UA_TYPES_DOUBLE].typeId;
    vAttr.accessLevel = UA_ACCESSLEVELMASK_READ;
    UA_Variant_setScalar(&vAttr.value, &position, &UA_TYPES[UA_TYPES_DOUBLE]);
    positionNodeId = UA_NODEID_STRING(1, "Position");
    UA_Server_addVariableNode(server, positionNodeId, demoFolderId,
                              UA_NODEID_NUMERIC(0, UA_NS0ID_ORGANIZES),
                              UA_QUALIFIEDNAME(1, "Position"),
                              UA_NODEID_NUMERIC(0, UA_NS0ID_BASEDATAVARIABLETYPE),
                              vAttr, NULL, NULL);

    /* Add TrafficLight variable (ns=1;s=TrafficLight) */
    vAttr = UA_VariableAttributes_default;
    vAttr.displayName = UA_LOCALIZEDTEXT("en-US", "TrafficLight");
    vAttr.description = UA_LOCALIZEDTEXT("en-US", "Traffic light state (0=Green,1=Yellow,2=Red,3=Red+Yellow)");
    vAttr.dataType = UA_TYPES[UA_TYPES_INT32].typeId;
    vAttr.accessLevel = UA_ACCESSLEVELMASK_READ;
    UA_Variant_setScalar(&vAttr.value, &trafficLight, &UA_TYPES[UA_TYPES_INT32]);
    trafficLightNodeId = UA_NODEID_STRING(1, "TrafficLight");
    UA_Server_addVariableNode(server, trafficLightNodeId, demoFolderId,
                              UA_NODEID_NUMERIC(0, UA_NS0ID_ORGANIZES),
                              UA_QUALIFIEDNAME(1, "TrafficLight"),
                              UA_NODEID_NUMERIC(0, UA_NS0ID_BASEDATAVARIABLETYPE),
                              vAttr, NULL, NULL);

    /* Start simulator callback every 100ms (0.1s) */
    UA_Server_addRepeatedCallback(server, simulationCallback, NULL, 0.1, NULL);

    printf("\n========================================\n");
    printf("OPC UA Server (open62541) ready!\n");
#ifdef UA_ENABLE_WEBSOCKET_SERVER
    printf("  WebSocket: ws://localhost:4444\n");
#else
    printf("  TCP: opc.tcp://localhost:4444\n");
#endif
    printf("========================================\n\n");

    UA_StatusCode retval = UA_Server_run(server, &running);

    UA_Server_delete(server);
    return retval == UA_STATUSCODE_GOOD ? EXIT_SUCCESS : EXIT_FAILURE;
}
