import type { UAVariable } from "node-opcua";
import { Variant, DataType } from "node-opcua";

export function startSimulator(
  tempVar: UAVariable,
  posVar: UAVariable,
  lightVar: UAVariable
) {
  const interval = 100; // 100ms update rate

  // Simulation state
  let time = 0;
  let lightTimer = 0;

  // Austrian traffic light timing (in 100ms ticks)
  const GREEN_DURATION = 30;      // 3s
  const YELLOW_DURATION = 10;     // 1s
  const RED_DURATION = 30;        // 3s
  const RED_YELLOW_DURATION = 10; // 1s

  setInterval(() => {
    time += interval;

    // Temperature: Sine wave 20-80C, period 10s
    const temp = 50 + 30 * Math.sin((time / 10000) * 2 * Math.PI);

    // Position: Sawtooth 0-1000mm, period 5s
    const position = ((time % 5000) / 5000) * 1000;

    // Traffic light: Austrian cycle
    lightTimer++;
    const cycleLength = GREEN_DURATION + YELLOW_DURATION + RED_DURATION + RED_YELLOW_DURATION;
    const cyclePos = lightTimer % cycleLength;

    let trafficLight: number;
    if (cyclePos < GREEN_DURATION) {
      trafficLight = 0; // Green
    } else if (cyclePos < GREEN_DURATION + YELLOW_DURATION) {
      trafficLight = 1; // Yellow
    } else if (cyclePos < GREEN_DURATION + YELLOW_DURATION + RED_DURATION) {
      trafficLight = 2; // Red
    } else {
      trafficLight = 3; // Red+Yellow
    }

    tempVar.setValueFromSource(new Variant({ dataType: DataType.Double, value: temp }));
    posVar.setValueFromSource(new Variant({ dataType: DataType.Double, value: position }));
    lightVar.setValueFromSource(new Variant({ dataType: DataType.Int32, value: trafficLight }));
  }, interval);

  console.log("[Simulator] Started with 100ms interval");
}
