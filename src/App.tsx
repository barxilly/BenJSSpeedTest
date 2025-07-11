import { useState, useEffect } from "react";
import "./App.css";
import {
  Button,
  Card,
  Center,
  createTheme,
  Loader,
  MantineProvider,
  Space,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import "@mantine/core/styles.css";
import { SiSpeedtest } from "react-icons/si";
import SpeedTest from "@cloudflare/speedtest";
import { BiSolidUpArrow, BiUpArrow, BiUpload } from "react-icons/bi";
import { FaUpload } from "react-icons/fa6";

function App() {
  const theme = createTheme({
    fontFamily: '"Rubik", sans-serif',
    headings: { fontFamily: '"M PLUS Rounded 1c", sans-serif' },
    primaryColor: localStorage.getItem("primaryColor") || "blue",
  });

  function frmbts(bps: number, round = false) {
    if (bps === 0) {
      return "0 Kbps";
    } else if (bps < 1000000) {
      const val = bps / 1000;
      return `${round ? Math.round(val) : val.toFixed(2)} Kbps`;
    } else if (bps < 1000000000) {
      const val = bps / 1000000;
      return `${round ? Math.round(val) : val.toFixed(2)} Mbps`;
    } else if (bps < 1000000000000) {
      const val = bps / 1000000000;
      return `${round ? Math.round(val) : val.toFixed(2)} Gbps`;
    } else if (bps >= 100000000000000) {
      const val = bps / 1000000000000;
      return `${round ? Math.round(val) : val.toFixed(2)} Tbps`;
    } else {
      return "0bps";
    }
  }

  const [speed, setSpeed] = useState(0);
  const [isTesting, setIsTesting] = useState(false);
  const [nobutt, setNobutt] = useState(false);
  const [down, setDown] = useState(0);
  const [up, setUp] = useState(0);
  const [ping, setPing] = useState(0);
  
  // State for tracking test completion
  const [previousValues, setPreviousValues] = useState({ down: 0, up: 0, ping: 0 });
  const [unchangedCount, setUnchangedCount] = useState(0);
  const [intervalId, setIntervalId] = useState<number | null>(null);

  // Cleanup interval on component unmount
  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  return (
    <MantineProvider defaultColorScheme="auto" theme={theme}>
      <Center style={{ height: "100vh", width: "100vw" }}>
        <Stack style={{ width: "80vw" }}>
          <Title className="title" style={{ textAlign: "center", display: "" }}>
            Speed Test
          </Title>
          <Space h="md" />
          <Stack style={{ height: "40vh" }}>
            <Center
              style={{
                display: speed > 0 ? "" : "none",
              }}
            >
              <Stack>
                <Card
                  style={{
                    display: speed > 0 ? "" : "none",
                    width: "204px",
                    height: "204px",
                    position: "relative",
                  }}
                  radius="100%"
                >
                  <Text size="1.4em" style={{ position:"absolute", top: "0", left: "50%", transform: "translateX(-50%)", display: up > 0 ? "":"none", color:isTesting? "grey":"black", animation: isTesting ? "textpulse 1s infinite" :""}} >⇡</Text>
                  <Text size="0.7em" style={{ position:"absolute", top: "3em", left: "50%", transform: "translateX(-50%)", display: up > 0 ? "":"none", color:isTesting? "grey":"black", animation: isTesting ? "textpulse 1s infinite" :""}} >{frmbts(up,true)}</Text>
                  <Title
                    order={1}
                    style={{
                      textAlign: "center",
                      display: speed > 0 ? "block" : "none",
                      color: isTesting ? "grey" : "black",
                      fontSize: "3rem",
                      
                      animation: isTesting ? "textpulse 1s infinite" : "",
                    }}
                    id="speed-display"
                  ><Title
                    order={1}
                    style={{
                      textAlign: "center",
                      display: speed > 0 ? "block" : "none",
                      color: isTesting ? "grey" : "black",
                      fontSize: "3rem",padding: "1em 1em 0em 0.7em",
                      animation: isTesting ? "textpulse 1s infinite" : "",
                    }}
                    id="speed-display"
                  >
                    {speed > 0
                      ? speed > 1000
                        ? `${speed / 1000}`
                        : speed > 10
                        ? `${speed}`
                        : speed > 1
                        ? `${speed.toFixed(2)}`
                        : `${Math.round(speed * 1000)}`
                      : ""}</Title>
                    <Text style={{ fontSize: "1.2rem" }}>
                      {speed > 1000 ? "Gbps" : speed > 1 ? "Mbps" : "Kbps"}
                    </Text>
                  </Title>
                  <Text size="1.4em" style={{ position:"absolute", bottom: "0", left: "50%", transform: "translateX(-50%)", color: up > 0 ? "black" : "grey", animation: up>0 ? "":"textpulse 1s infinite" }} >⇣</Text>
                </Card>
              </Stack>
            </Center>
            <Center
              style={{
                display: speed > 0 ? "none" : "",
              }}
            >
              <Button
                leftSection={<SiSpeedtest />}
                id="test-button"
                onClick={async () => {
                  if (isTesting) return;
                  (
                    document.getElementById("test-button") as HTMLElement
                  )?.classList?.add("shrinkaway");
                  setSpeed(0);
                  setUnchangedCount(0);
                  setPreviousValues({ down: 0, up: 0, ping: 0 });
                  
                  const banana = new SpeedTest();
                  banana.onFinish = (results) =>
                    console.log(
                      (results.getSummary().download as number) / 1000000
                    );
                  banana.onRunningChange = (running) => {
                    console.log(`Running: ${running}`);
                    setIsTesting(running);
                    if (!running) {
                      // Clear interval when test officially ends
                      console.log("Test ended, clearing interval");
                      if (intervalId) {
                        clearInterval(intervalId);
                        setIntervalId(null);
                      }
                    }
                  };
                  setIsTesting(await banana.isRunning);

                  const id = setInterval(() => {
                    if (!nobutt) {
                      (
                        document.getElementById("speed-display") as HTMLElement
                      )?.classList?.add("growappear");
                    }
                    
                    const newDown = banana.results.getSummary().download as number;
                    const newUp = banana.results.getSummary().upload as number;
                    const newPing = banana.results.getSummary().latency as number;
                    
                    setDown(newDown);
                    setUp(newUp);
                    setPing(newPing);
                    setSpeed(
                      Math.round(
                        (newDown / 1000000) * 1000
                      ) / 1000
                    );
                    
                    if (speed > 0) {
                      setNobutt(true);
                    }
                    
                    // Check if values have remained the same
                    setPreviousValues(prev => {
                      if (prev.down === newDown && prev.up === newUp && prev.ping === newPing && newDown > 0 && newUp > 0 && newPing > 0) {
                        setUnchangedCount(count => {
                          const newCount = count + 1;
                          console.log(`Unchanged count: ${newCount}/20`);
                          if (newCount >= 20) {
                            // Values have been the same for 3 intervals, test is complete
                            console.log("Test completed - values unchanged for 3 intervals");
                            setIsTesting(false);
                            clearInterval(id);
                            setIntervalId(null);
                          }
                          return newCount;
                        });
                      } else {
                        setUnchangedCount(0);
                        console.log("Values changed, resetting unchanged count");
                      }
                      return { down: newDown, up: newUp, ping: newPing };
                    });
                    
                    console.log(`Speed: ${banana.results.getSummary()} Mbps`);
                  }, 500);
                  
                  setIntervalId(id);
                }}
                style={{
                  display: speed > 0 ? "none" : "block",
                  width: "204px",
                  position: "relative",
                }}
                fullWidth
                size="xl"
                radius="md"
              >
                Test
                <Loader
                  color="grey"
                  type="oval"
                  size="lg"
                  style={{
                    display: isTesting ? "block" : "none",
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translateY(-50%) translateX(-50%)",
                    borderRadius: "50%",
                  }}
                />
              </Button>
            </Center>
          </Stack>
          <Card style={{ display: speed > 0 && !isTesting ? "" : "none" }}>
            <Text>Download Speed: {frmbts(down)}</Text>
            <Text>Upload Speed: {frmbts(up)}</Text>
            <Text>Ping: {ping}ms</Text>
          </Card>
        </Stack>
      </Center>
    </MantineProvider>
  );
}

export default App;
