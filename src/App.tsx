import { useState, useEffect } from "react";
import "./App.css";
import {
  Button,
  Card,
  Center,
  createTheme,
  Flex,
  Grid,
  Input,
  Loader,
  MantineProvider,
  Rating,
  Space,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import "@mantine/core/styles.css";
import SpeedTest from "@cloudflare/speedtest";
import { RxCross2 } from "react-icons/rx";
import { CgMore } from "react-icons/cg";
import { SiNetflix } from "react-icons/si";
import { PiGameControllerFill } from "react-icons/pi";
import { FaRedditAlien } from "react-icons/fa";
import { GoDot, GoDotFill } from "react-icons/go";
import { TbTransfer } from "react-icons/tb";
import { BiVideo } from "react-icons/bi";
import { FaGun } from "react-icons/fa6";

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

  
  function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; 
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; 
    return distance;
  }

  
  async function findNearestCloudflareServer(
    userLat: number,
    userLon: number
  ): Promise<string> {
    try {
      const response = await fetch("https://speed.cloudflare.com/locations");
      const locations = await response.json();

      let nearestServer = null;
      let shortestDistance = Infinity;

      for (const location of locations) {
        const distance = calculateDistance(
          userLat,
          userLon,
          location.lat,
          location.lon
        );
        if (distance < shortestDistance) {
          shortestDistance = distance;
          nearestServer = location;
        }
      }

      if (nearestServer) {
        return `${nearestServer.city}, ${nearestServer.cca2} (${Math.round(
          shortestDistance
        )}km away)`;
      } else {
        return "Unable to determine nearest server";
      }
    } catch (error) {
      console.error("Failed to fetch Cloudflare locations:", error);
      return "Unable to determine nearest server";
    }
  }

  const [speed, setSpeed] = useState(0);
  const [isTesting, setIsTesting] = useState(false);
  const [nobutt, setNobutt] = useState(false);
  const [down, setDown] = useState(0);
  const [up, setUp] = useState(0);
  const [ping, setPing] = useState(0);
  const [jitter, setJitter] = useState(0);
  const [userLocation, setUserLocation] = useState<string>("Detecting...");
  const [nearestCloudflareServer, setNearestCloudflareServer] =
    useState<string>("Detecting...");
  const [previousValues, setPreviousValues] = useState({
    down: 0,
    up: 0,
    ping: 0,
  });
  const [unchangedCount, setUnchangedCount] = useState(0);
  const [intervalId, setIntervalId] = useState<number | null>(null);
  const [showAdv, setShowAdv] = useState(false);
  const [showUses, setShowUses] = useState(false);
  const [showAllGames, setShowAllGames] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  
  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  // Debug menu keyboard shortcut (Cmd+G)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey && event.key === 'g') {
        event.preventDefault();
        setShowDebug(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  
  useEffect(() => {
    const getUserLocation = async () => {
      try {
        
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();
        if (data.city && data.region && data.country) {
          setUserLocation(`${data.city}, ${data.region}, ${data.country}`);
        } else if (data.city && data.country) {
          setUserLocation(`${data.city}, ${data.country}`);
        } else {
          setUserLocation("Location unavailable");
        }

        
        if (data.latitude && data.longitude) {
          const nearestServer = await findNearestCloudflareServer(
            data.latitude,
            data.longitude
          );
          setNearestCloudflareServer(nearestServer);
        } else {
          setNearestCloudflareServer("ERR");
        }
      } catch (error) {
        console.error("Failed to get location:", error);
        setUserLocation("Location unavailable");
        setNearestCloudflareServer("ERR");
      }
    };

    getUserLocation();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("https://ipapi.co/json/");
      const data = await response.json();
      if (data.latitude && data.longitude) {
        const lat = data.latitude;
        const lon = data.longitude;
        setNearestCloudflareServer(await findNearestCloudflareServer(lat, lon));
      }
    };

    fetchData();
  }, [userLocation]);

  console.log(previousValues);
  console.log(unchangedCount);
  return (
    <MantineProvider defaultColorScheme="light" theme={theme}>
      <Center style={{ height: "100vh", width: "100vw" }}>
        <Stack style={{ width: "80vw" }}>
          <Title className="title" style={{ textAlign: "center", display: "" }}>
            QwkSpd
          </Title>
          <Title order={2} style={{ textAlign: "center", display: "" }}>
            Powered by{" "}
            <a href="https://cloudflare.com" target="_blank">
              <img
                src="/cloudflare.png"
                alt="Cloudflare"
                style={{
                  width: "auto",
                  height: "0.6em",
                  marginBottom: "0.07em",
                }}
              />
            </a>
          </Title>
          <Space h="md" />
          <Stack style={{ height: "40vh" }}>
            <Center
              style={{
                display: speed > 0 ? "" : "none",
              }}
            >
              <Stack><Center>
                <Card
                  style={{
                    display: speed > 0 ? "" : "none",
                    width: "204px",
                    height: "204px",
                    position: "relative",
                    userSelect: "none",
                    justifySelf: "center",
                  }}
                  bg="var(--mantine-color-white)"
                  radius="100%"
                  id={speed > 0 && !isTesting ? "dc" : ""}
                  className={speed > 0 && !isTesting ? "dc" : ""}
                  onClick={
                    speed > 0 && !isTesting
                      ? () => {
                          /*document
                            .getElementById("dc")
                            ?.classList.add("becomewhitesquircle");
                            document
                            .getElementById("dc")
                            ?.classList.remove("dc");*/
                        }
                      : () => {}
                  }
                >
                  <Text
                    size="1.4em"
                    style={{
                      position: "absolute",
                      top: "0",
                      left: "50%",
                      transform: "translateX(-50%)",
                      display: up > 0 ? "" : "none",
                      color: isTesting ? "grey" : "black",
                      animation: isTesting ? "textpulse 1s infinite" : "",
                    }}
                  >
                    ⇡
                  </Text>
                  <Text
                    size="0.7em"
                    style={{
                      position: "absolute",
                      top: "3em",
                      left: "50%",
                      transform: "translateX(-50%)",
                      display: up > 0 ? "" : "none",
                      color: isTesting ? "grey" : "black",
                      animation: isTesting ? "textpulse 1s infinite" : "",
                    }}
                  >
                    {frmbts(up, true)}
                  </Text>
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
                  >
                    <Title
                      order={1}
                      style={{
                        textAlign: "center",
                        display: speed > 0 ? "block" : "none",
                        color: isTesting ? "grey" : "black",
                        fontSize: "3rem",
                        width: "100%",
                        paddingTop: "1em",
                        height: "fit-content",
                        animation: isTesting ? "textpulse 1s infinite" : "",
                      }}
                      id="speed-display"
                    >
                      {speed > 0
                        ? speed > 1000
                          ? `${speed / 1000}`
                          : speed > 10
                          ? `${Math.round(speed)}`
                          : speed > 1
                          ? `${speed.toFixed(2)}`
                          : `${Math.round(speed * 1000)}`
                        : ""}
                    </Title>
                    <Text style={{ fontSize: "1.2rem" }}>
                      {speed > 1000 ? "Gbps" : speed > 1 ? "Mbps" : "Kbps"}
                    </Text>
                  </Title>
                  <Text
                    size="1.4em"
                    style={{
                      position: "absolute",
                      top: "7.8em",
                      left: "50%",
                      transform: "translateX(-50%)",
                      color: !isTesting ? "black" : "grey",
                      animation: !isTesting ? "" : "textpulse 1s infinite",
                    }}
                  >
                    ⇣
                  </Text>
                  <Stack
                    style={{ position: "absolute", top: "14em", left: "2em" }}
                  >
                    <Text>Download Speed: {frmbts(down)}</Text>
                    <Text>Upload Speed: {frmbts(up)}</Text>
                    <Text>Ping: {ping.toFixed(2)}ms</Text>
                  </Stack>
                </Card></Center>
                <Space h="sm" />
                <Card style={{ width: "fit-content" }} radius="lg">
                  <Flex gap="md">
                    <Stack>
                      <Center><PiGameControllerFill size="3em" color="grey"/></Center>
                      <Rating emptySymbol={<GoDot size="1.5em"  color="grey"/>}
                        fullSymbol={<GoDotFill size="1.5em"  color="grey"/>}
                        value={
                          speed >= 100
                            ? 5 
                            : speed >= 50
                            ? 4 
                            : speed >= 20
                            ? 3 
                            : speed >= 10
                            ? 2 
                            : speed >= 5
                            ? 1 
                            : 0 
                        }
                        readOnly
                      />
                    </Stack>
                    <Stack>
                      <Center h="3em">
                      <SiNetflix size="2.5em" color="grey" />
                      </Center>
                      <Rating emptySymbol={<GoDot color="grey" size="1.5em" />}
                        fullSymbol={<GoDotFill size="1.5em" color="grey" />}
                      value={
                        speed >= 50
                        ? 5
                        : speed >= 30
                        ? 4
                        : speed >= 10
                        ? 3
                        : speed >= 6
                        ? 2
                        : speed >= 1.5
                        ? 1
                        : 0
                      }
                      readOnly
                      />
                    </Stack>
                    <Stack>
                      <Center h="3em">
                        <FaRedditAlien size="2.5em" color="grey" />
                      </Center>
                      <Rating
                      emptySymbol={<GoDot size="1.5em"  color="grey"/>}
                        fullSymbol={<GoDotFill size="1.5em"  color="grey"/>}
                      
                        value={
                          speed >= 30
                            ? 5
                            : speed >= 20
                            ? 4
                            : speed >= 10
                            ? 3
                            : speed >= 7
                            ? 2
                            : speed >= 0.7
                            ? 1
                            : 0
                        }
                        readOnly
                      />
                    </Stack>
                  </Flex><Center>
                  <CgMore 
                    style={{display: (speed > 0 && !isTesting) ? "" : "none", cursor:"pointer"}} 
                    size="1.7em"
                    onClick={() => setShowUses(true)}
                  /></Center>
                </Card>
                <Space h="sm" />
                <Text
                  style={{
                    color: "#ada07dff",
                    textAlign: "center",
                    cursor: "pointer",
                    userSelect: "none",
                    display: !isTesting && speed > 0 ? "" : "none",
                  }}
                  onClick={() => {
                    setShowAdv(true);
                  }}
                >
                  Advanced Stats
                </Text>
              </Stack>
            </Center>
            <Center
              style={{
                display: speed > 0 ? "none" : "",
                height: "204px",
              }}
            >
              <Button
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

                    const newDown = banana.results.getSummary()
                      .download as number;
                    const newUp = banana.results.getSummary().upload as number;
                    const newPing = banana.results.getSummary()
                      .latency as number;

                    setDown(newDown);
                    setUp(newUp);
                    setPing(newPing);
                    setSpeed(Math.round((newDown / 1000000) * 1000) / 1000);
                    setJitter(
                      (banana.results.getSummary().jitter as number) || 0
                    );

                    if (speed > 0) {
                      setNobutt(true);
                    }

                    
                    setPreviousValues((prev) => {
                      if (
                        prev.down === newDown &&
                        prev.up === newUp &&
                        prev.ping === newPing &&
                        newDown > 0 &&
                        newUp > 0 &&
                        newPing > 0
                      ) {
                        setUnchangedCount((count) => {
                          const newCount = count + 1;
                          console.log(`Unchanged count: ${newCount}/20`);
                          if (newCount >= 20) {
                            
                            console.log(
                              "Test completed - values unchanged for 3 intervals"
                            );
                            setIsTesting(false);
                            clearInterval(id);
                            setIntervalId(null);
                          }
                          return newCount;
                        });
                      } else {
                        setUnchangedCount(0);
                        console.log(
                          "Values changed, resetting unchanged count"
                        );
                      }
                      return { down: newDown, up: newUp, ping: newPing };
                    });

                    console.log(banana.results.getSummary());
                    console.log(banana.results);
                  }, 500);

                  setIntervalId(id);
                }}
                style={{
                  display: speed > 0 ? "none" : "block",
                  width: "170px",
                  position: "relative",
                  backgroundColor: "white",
                  color: " #333",
                }}
                fullWidth
                size="xl"
                radius="lg"
              >
                Start
                <Loader
                  color="grey"
                  type="oval"
                  size="lg"
                  style={{
                    display: isTesting ? "block" : "none",
                    animation: isTesting ? "fadein 0.7s linear" : "",
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
        </Stack>
      </Center>
      <Card
        style={{
          position: "absolute",
          top: "5%",
          left: "5%",
          width: "90vw",
          height: "90vh",
          overflowY: "auto",
          display: showAdv ? "block" : "none",
          backgroundColor: "white",
          border: "1px solid #e9ecef",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
        }}
        radius="lg"
      >
        <Card
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
            background: "transparent",
            border: "none",
            boxShadow: "none",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              position: "fixed",
              top: "6.5%",
              left: "6.5%",
              cursor: "pointer",
              backgroundColor: "#f8f9fa",
              color: "#666",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.2em",
              transition: "all 0.2s ease",
              border: "1px solid #e9ecef",
              zIndex: 1000,
            }}
            onClick={() => {
              setShowAdv(false);
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#e9ecef";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#f8f9fa";
            }}
          >
            <RxCross2 />
          </div>
          <Stack style={{ padding: "2em" }}>
            <Title
              order={1}
              style={{
                textAlign: "center",
                marginBottom: "0.5em",
                fontSize: "2.5rem",
                fontWeight: 700,
                color: "#333",
              }}
            >
              Advanced Statistics
            </Title>
            <Text
              style={{
                textAlign: "center",
                color: "#ada07dff",
                fontSize: "1.1rem",
                marginBottom: "2em",
              }}
            >
              Detailed insights into your network performance
            </Text>

            <Stack gap="xl">
              {/* Speed Metrics */}
              <Card
                style={{
                  backgroundColor: "white",
                  border: "1px solid #e9ecef",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
                radius="lg"
                p="xl"
              >
                <Title
                  order={3}
                  style={{
                    color: "#333",
                    marginBottom: "1.5em",
                    textAlign: "center",
                    fontWeight: 600,
                  }}
                >
                  Speed Metrics
                </Title>
                <Stack gap="lg">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "1em 0",
                      borderBottom: "1px solid #f1f3f4",
                    }}
                  >
                    <Text size="lg" style={{ color: "#666", fontWeight: 500 }}>
                      Download Speed
                    </Text>
                    <div style={{ textAlign: "right" }}>
                      <Text size="xl" fw={600} style={{ color: "#333" }}>
                        {frmbts(down)}
                      </Text>
                      <Text size="sm" style={{ color: "#ada07dff" }}>
                        ({(down / 1000).toFixed(2)} Kbps)
                      </Text>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "1em 0",
                    }}
                  >
                    <Text size="lg" style={{ color: "#666", fontWeight: 500 }}>
                      Upload Speed
                    </Text>
                    <div style={{ textAlign: "right" }}>
                      <Text size="xl" fw={600} style={{ color: "#333" }}>
                        {frmbts(up)}
                      </Text>
                      <Text size="sm" style={{ color: "#ada07dff" }}>
                        ({(up / 1000).toFixed(2)} Kbps)
                      </Text>
                    </div>
                  </div>
                </Stack>
              </Card>

              {/* Network Performance */}
              <Card
                style={{
                  backgroundColor: "white",
                  border: "1px solid #e9ecef",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
                radius="lg"
                p="xl"
              >
                <Title
                  order={3}
                  style={{
                    color: "#333",
                    marginBottom: "1.5em",
                    textAlign: "center",
                    fontWeight: 600,
                  }}
                >
                  Network Performance
                </Title>
                <Stack gap="lg">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "1em 0",
                      borderBottom: "1px solid #f1f3f4",
                    }}
                  >
                    <Text size="lg" style={{ color: "#666", fontWeight: 500 }}>
                      Ping
                    </Text>
                    <Text size="xl" fw={600} style={{ color: "#333" }}>
                      {ping.toFixed(2)} ms
                    </Text>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "1em 0",
                    }}
                  >
                    <Text size="lg" style={{ color: "#666", fontWeight: 500 }}>
                      Jitter
                    </Text>
                    <Text size="xl" fw={600} style={{ color: "#333" }}>
                      {jitter.toFixed(2)} ms
                    </Text>
                  </div>
                </Stack>
              </Card>

              {/* Location Information */}
              <Card
                style={{
                  backgroundColor: "white",
                  border: "1px solid #e9ecef",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
                radius="lg"
                p="xl"
              >
                <Title
                  order={3}
                  style={{
                    color: "#333",
                    marginBottom: "1.5em",
                    textAlign: "center",
                    fontWeight: 600,
                  }}
                >
                  Location Details
                </Title>
                <Stack gap="lg">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "1em 0",
                      borderBottom: "1px solid #f1f3f4",
                    }}
                  >
                    <Text size="lg" style={{ color: "#666", fontWeight: 500 }}>
                      Your Location
                    </Text>
                    <Text
                      size="lg"
                      fw={500}
                      style={{
                        color: "#333",
                        textAlign: "right",
                        maxWidth: "60%",
                      }}
                    >
                      {userLocation}
                    </Text>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "1em 0",
                    }}
                  >
                    <Text size="lg" style={{ color: "#666", fontWeight: 500 }}>
                      Cloudflare Server
                    </Text>
                    <Text
                      size="lg"
                      fw={500}
                      style={{
                        color: "#333",
                        textAlign: "right",
                        maxWidth: "60%",
                      }}
                    >
                      {nearestCloudflareServer}
                    </Text>
                  </div>
                </Stack>
              </Card>
            </Stack>
          </Stack>
        </Card>
      </Card>

      {/* Uses Page Modal */}
      <Card
        style={{
          position: "absolute",
          top: "5%",
          left: "5%",
          width: "90vw",
          height: "90vh",
          overflowY: "auto",
          display: showUses ? "block" : "none",
          backgroundColor: "white",
          border: "1px solid #e9ecef",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
        }}
        radius="lg"
      >
        <Card
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
            background: "transparent",
            border: "none",
            boxShadow: "none",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              position: "fixed",
              top: "6.5%",
              left: "6.5%",
              cursor: "pointer",
              backgroundColor: "#f8f9fa",
              color: "#666",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.2em",
              transition: "all 0.2s ease",
              border: "1px solid #e9ecef",
              zIndex: 1000,
            }}
            onClick={() => {
              setShowUses(false);
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#e9ecef";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#f8f9fa";
            }}
          >
            <RxCross2 />
          </div>
          <Stack style={{ padding: "1em" }}>
            <Title
              order={1}
              style={{
                textAlign: "center",
                marginBottom: "0.5em",
                fontSize: "2.5rem",
                fontWeight: 700,
                color: "#333",
              }}
            >
              What Can You Do?
            </Title>
            <Text
              style={{
                textAlign: "center",
                color: "#ada07dff",
                fontSize: "1.1rem",
                marginBottom: "2em",
              }}
            >
              Estimated download times for popular content
            </Text>

            <Grid gutter="xs">
              {/* Gaming Downloads */}
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Card
                  style={{
                    backgroundColor: "white",
                    border: "1px solid #e9ecef",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    height: "100%",
                  }}
                  radius="lg"
                  p="xl"
                >
                <Title
                  order={3}
                  style={{
                    color: "#333",
                    marginBottom: "1.5em",
                    textAlign: "center",
                    fontWeight: 600,
                  }}
                >
                  <PiGameControllerFill size="1.2em" style={{ marginRight: "0.5em", verticalAlign: "middle" }} />
                  Game Downloads
                </Title>
                <Stack gap="lg">
                  {[
  { name: "Starfield", size: 125 },
  { name: "Baldur's Gate 3", size: 120 },
  { name: "Red Dead Redemption 2", size: 120 },
  { name: "Cyberpunk 2077", size: 110 },
  { name: "GTA V", size: 95 },
  { name: "Call of Duty: MW3 (2023)", size: 90 },
  { name: "Diablo 4", size: 85 },
  { name: "Hogwarts Legacy", size: 80 },
  { name: "The Witcher 3 (Next Gen)", size: 55 },
  { name: "Elden Ring", size: 50 },
  { name: "Fortnite", size: 40 },
  { name: "CS2", size: 35 },
  { name: "Valorant", size: 30 },
  { name: "Minecraft (Java)", size: 1 }
].slice(0, showAllGames ? undefined : 5).map((game, index, array) => {
                    // Convert GB to bits, then divide by bits per second to get seconds
                    const downloadTimeSeconds = (game.size * 8 * 1000000000) / down;
                    const displayTime = downloadTimeSeconds < 60 
                      ? `${Math.round(downloadTimeSeconds)} seconds`
                      : downloadTimeSeconds < 3600
                      ? `${Math.round(downloadTimeSeconds / 60)} minutes`
                      : downloadTimeSeconds < 86400
                      ? `${(downloadTimeSeconds / 3600).toFixed(1)} hours`
                      : `${(downloadTimeSeconds / 86400).toFixed(1)} days`;
                    
                    return (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "1em 0",
                          borderBottom: index < array.length - 1 ? "1px solid #f1f3f4" : "none",
                        }}
                      >
                        <div>
                          <Text size="lg" style={{ color: "#333", fontWeight: 500 }}>
                            {game.name}
                          </Text>
                          <Text size="sm" style={{ color: "#ada07dff" }}>
                            {game.size} GB
                          </Text>
                        </div>
                        <Text size="lg" fw={600} style={{ color: "#333" }}>
                          {down > 0 ? displayTime : "Test your speed first"}
                        </Text>
                      </div>
                    );
                  })}
                  
                  {/* Show more/less button */}
                  <Center style={{ paddingTop: "1em" }}>
                    <Button
                      variant="subtle"
                      size="sm"
                      onClick={() => setShowAllGames(!showAllGames)}
                      style={{ color: "#ada07dff" }}
                    >
                      {showAllGames ? "Show less" : "Show more games"}
                    </Button>
                  </Center>
                </Stack>
              </Card>
              </Grid.Col>

              {/* Streaming Quality */}
              <Grid.Col span={{ base: 12, md: 6 }}>
              <Card
                style={{
                  backgroundColor: "white",
                  border: "1px solid #e9ecef",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  height: "100%",
                }}
                radius="lg"
                p="xl"
              >
                <Title
                  order={3}
                  style={{
                    color: "#333",
                    marginBottom: "1.5em",
                    textAlign: "center",
                    fontWeight: 600,
                  }}
                >
                  <SiNetflix size="1.2em" style={{ marginRight: "0.5em", verticalAlign: "middle" }} />
                  Streaming Performance
                </Title>
                <Stack gap="lg">
                  {[
                    { quality: "4K Ultra HD", requirement: 25, description: "Netflix, Disney+, Prime Video" },
                    { quality: "4K HDR", requirement: 50, description: "Apple TV+, Premium streaming" },
                    { quality: "1080p HD", requirement: 5, description: "Standard HD streaming" },
                    { quality: "720p", requirement: 3, description: "Basic HD streaming" },
                    { quality: "480p", requirement: 1.5, description: "Standard definition" },
                  ].map((stream, index) => {
                    const canStream = (down / 1000000) >= stream.requirement;
                    const qualityColor = canStream ? "#28a745" : "#f59e0b";
                    
                    return (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "1em 0",
                          borderBottom: index < 4 ? "1px solid #f1f3f4" : "none",
                        }}
                      >
                        <div>
                          <Text size="lg" style={{ color: "#333", fontWeight: 500 }}>
                            {stream.quality}
                          </Text>
                          <Text size="sm" style={{ color: "#ada07dff" }}>
                            {stream.description}
                          </Text>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <Text size="lg" fw={600} style={{ color: qualityColor }}>
                            {canStream ? "✓ Smooth" : "⚠ May buffer"}
                          </Text>
                          <Text size="sm" style={{ color: "#ada07dff" }}>
                            Optimal: {stream.requirement} Mbps
                          </Text>
                        </div>
                      </div>
                    );
                  })}
                </Stack>
              </Card>
              </Grid.Col>

              {/* Social Media & Content Creation */}
              <Grid.Col span={{ base: 12, md: 6 }}>
              <Card
                style={{
                  backgroundColor: "white",
                  border: "1px solid #e9ecef",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  height: "100%",
                }}
                radius="lg"
                p="xl"
              >
                <Title
                  order={3}
                  style={{
                    color: "#333",
                    marginBottom: "1.5em",
                    textAlign: "center",
                    fontWeight: 600,
                  }}
                >
                  <FaRedditAlien size="1.2em" style={{ marginRight: "0.5em", verticalAlign: "middle" }} />
                  Social Media Browsing
                </Title>
                <Text
                  style={{
                    textAlign: "center",
                    color: "#ada07dff",
                    fontSize: "0.9rem",
                    marginBottom: "1em",
                  }}
                >
                  These activities primarily depend on your download speed
                </Text>
                <Stack gap="lg">
                  {[
                    { activity: "4K Video Streaming", requirement: 25, description: "YouTube, TikTok, Instagram Reels" },
                    { activity: "1080p Video Streaming", requirement: 5, description: "Social media videos" },
                    { activity: "Image-Heavy Browsing", requirement: 3, description: "Instagram, Pinterest feeds" },
                    { activity: "Social Media Browsing", requirement: 1, description: "Twitter, Facebook, Reddit" },
                    { activity: "Web Browsing", requirement: 0.5, description: "General internet use" },
                  ].map((activity, index) => {
                    const canDo = (down / 1000000) >= activity.requirement;
                    const statusColor = canDo ? "#28a745" : "#f59e0b";
                    
                    return (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "1em 0",
                          borderBottom: index < 4 ? "1px solid #f1f3f4" : "none",
                        }}
                      >
                        <div>
                          <Text size="lg" style={{ color: "#333", fontWeight: 500 }}>
                            {activity.activity}
                          </Text>
                          <Text size="sm" style={{ color: "#ada07dff" }}>
                            {activity.description}
                          </Text>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <Text size="lg" fw={600} style={{ color: statusColor }}>
                            {canDo ? "✓ Smooth" : "⚠ May buffer"}
                          </Text>
                          <Text size="sm" style={{ color: "#ada07dff" }}>
                            Optimal: {activity.requirement} Mbps
                          </Text>
                        </div>
                      </div>
                    );
                  })}
                </Stack>
              </Card>
              </Grid.Col>

              {/* Content Creation & Upload */}
              <Grid.Col span={{ base: 12, md: 6 }}>
              <Card
                style={{
                  backgroundColor: "white",
                  border: "1px solid #e9ecef",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  height: "100%",
                }}
                radius="lg"
                p="xl"
              >
                <Title
                  order={3}
                  style={{
                    color: "#333",
                    marginBottom: "1.5em",
                    textAlign: "center",
                    fontWeight: 600,
                  }}
                >
                  <BiVideo size="1.2em" style={{ marginRight: "0.5em", verticalAlign: "middle" }} />
                  Content Creation & Upload
                </Title>
                <Text
                  style={{
                    textAlign: "center",
                    color: "#ada07dff",
                    fontSize: "0.9rem",
                    marginBottom: "1em",
                  }}
                >
                  These activities primarily depend on your upload speed
                </Text>
                <Stack gap="lg">
                  {[
                    { activity: "4K Video Upload", requirement: 40, description: "YouTube, TikTok content creation" },
                    { activity: "1080p Video Upload", requirement: 10, description: "Instagram, Facebook videos" },
                    { activity: "HD Video Calls", requirement: 2, description: "Zoom, Teams, Discord" },
                    { activity: "Photo Upload", requirement: 1, description: "Instagram posts, cloud backup" },
                    { activity: "Live Streaming", requirement: 5, description: "Twitch, YouTube Live" },
                  ].map((activity, index) => {
                    const canDo = (up / 1000000) >= activity.requirement;
                    const statusColor = canDo ? "#28a745" : "#f59e0b";
                    
                    return (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "1em 0",
                          borderBottom: index < 4 ? "1px solid #f1f3f4" : "none",
                        }}
                      >
                        <div>
                          <Text size="lg" style={{ color: "#333", fontWeight: 500 }}>
                            {activity.activity}
                          </Text>
                          <Text size="sm" style={{ color: "#ada07dff" }}>
                            {activity.description}
                          </Text>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <Text size="lg" fw={600} style={{ color: statusColor }}>
                            {canDo ? "✓ Smooth" : "⚠ May lag"}
                          </Text>
                          <Text size="sm" style={{ color: "#ada07dff" }}>
                            Optimal: {activity.requirement} Mbps upload
                          </Text>
                        </div>
                      </div>
                    );
                  })}
                </Stack>
              </Card>
              </Grid.Col>

              {/* File Transfer Times */}
              <Grid.Col span={{ base: 12, md: 6 }}>
              <Card
                style={{
                  backgroundColor: "white",
                  border: "1px solid #e9ecef",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  height: "100%",
                }}
                radius="lg"
                p="xl"
              >
                <Title
                  order={3}
                  style={{
                    color: "#333",
                    marginBottom: "1.5em",
                    textAlign: "center",
                    fontWeight: 600,
                  }}
                >
                  <TbTransfer size="1.2em" style={{ marginRight: "0.5em", verticalAlign: "middle" }} />
                  File Transfer Times
                </Title>
                <Stack gap="lg">
                  {[
                    { name: "4K Movie (25 GB)", size: 25 },
                    { name: "HD Movie (8 GB)", size: 8 },
                    { name: "Music Album (100 MB)", size: 0.1 },
                    { name: "High-res Photo (10 MB)", size: 0.01 },
                    { name: "Document (1 MB)", size: 0.001 },
                  ].map((file, index) => {
                    // Convert GB to bits, then divide by bits per second to get seconds
                    const downloadTimeSeconds = (file.size * 8 * 1000000000) / down;
                    const displayTime = downloadTimeSeconds < 60 
                      ? `${Math.round(downloadTimeSeconds)} seconds`
                      : downloadTimeSeconds < 3600
                      ? `${Math.round(downloadTimeSeconds / 60)} minutes`
                      : `${(downloadTimeSeconds / 3600).toFixed(1)} hours`;
                    
                    return (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "1em 0",
                          borderBottom: index < 4 ? "1px solid #f1f3f4" : "none",
                        }}
                      >
                        <div>
                          <Text size="lg" style={{ color: "#333", fontWeight: 500 }}>
                            {file.name}
                          </Text>
                        </div>
                        <Text size="lg" fw={600} style={{ color: "#333" }}>
                          {down > 0 ? displayTime : "Test your speed first"}
                        </Text>
                      </div>
                    );
                  })}
                </Stack>
              </Card>
              </Grid.Col>

              {/* Online Gaming Performance */}
              <Grid.Col span={{ base: 12, md: 6 }}>
              <Card
                style={{
                  backgroundColor: "white",
                  border: "1px solid #e9ecef",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  height: "100%",
                }}
                radius="lg"
                p="xl"
              >
                <Title
                  order={3}
                  style={{
                    color: "#333",
                    marginBottom: "1.5em",
                    textAlign: "center",
                    fontWeight: 600,
                  }}
                >
                  <FaGun size="1.2em" style={{ marginRight: "0.5em", verticalAlign: "middle" }} />
                  Online Gaming
                </Title>
                <Text
                  style={{
                    textAlign: "center",
                    color: "#ada07dff",
                    fontSize: "0.9rem",
                    marginBottom: "1em",
                  }}
                >
                  These activities primarily depend on your ping/latency
                </Text>
                <Stack gap="lg">
                  {[
                    { game: "Competitive FPS", requirement: 20, description: "CS2, Valorant, Overwatch" },
                    { game: "MOBA Games", requirement: 30, description: "League of Legends, Dota 2" },
                    { game: "Battle Royale", requirement: 50, description: "Fortnite, PUBG, Apex Legends" },
                    { game: "MMORPGs", requirement: 100, description: "World of Warcraft, Final Fantasy XIV" },
                    { game: "Turn-based Games", requirement: 200, description: "Chess, card games, strategy" },
                  ].map((gameType, index) => {
                    const canPlay = ping <= gameType.requirement && ping > 0;
                    const statusColor = canPlay ? "#28a745" : ping > gameType.requirement ? "#f59e0b" : "#666";
                    
                    return (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "1em 0",
                          borderBottom: index < 4 ? "1px solid #f1f3f4" : "none",
                        }}
                      >
                        <div>
                          <Text size="lg" style={{ color: "#333", fontWeight: 500 }}>
                            {gameType.game}
                          </Text>
                          <Text size="sm" style={{ color: "#ada07dff" }}>
                            {gameType.description}
                          </Text>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <Text size="lg" fw={600} style={{ color: statusColor }}>
                            {ping === 0 ? "Test ping first" : canPlay ? "✓ Excellent" : "⚠ High latency"}
                          </Text>
                          <Text size="sm" style={{ color: "#ada07dff" }}>
                            Target: &lt;{gameType.requirement}ms
                          </Text>
                        </div>
                      </div>
                    );
                  })}
                </Stack>
              </Card>
              </Grid.Col>
            </Grid>
          </Stack>
        </Card>
      </Card>

      {/* Debug Menu Modal */}
      <Card
        style={{
          position: "fixed",
          top: "50%",
          left: "20%",
          transform: "translate(-50%, -50%)",
          width: "400px",
          maxHeight: "80vh",
          overflowY: "auto",
          display: showDebug ? "block" : "none",
          backgroundColor: "white",
          border: "2px solid #007bff",
          boxShadow: "0 8px 32px rgba(0, 123, 255, 0.3)",
          zIndex: 2000,
        }}
        radius="lg"
      >
        <div
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            cursor: "pointer",
            backgroundColor: "#f8f9fa",
            color: "#666",
            borderRadius: "50%",
            width: "30px",
            height: "30px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1em",
            transition: "all 0.2s ease",
            border: "1px solid #e9ecef",
          }}
          onClick={() => setShowDebug(false)}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#e9ecef";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#f8f9fa";
          }}
        >
          <RxCross2 />
        </div>
        
        <Stack style={{ padding: "2em" }}>
          <Title
            order={2}
            style={{
              textAlign: "center",
              color: "#007bff",
              marginBottom: "1em",
            }}
          >
            🐛 Debug Menu
          </Title>
          <Text
            style={{
              textAlign: "center",
              color: "#666",
              fontSize: "0.9rem",
              marginBottom: "1.5em",
            }}
          >
            Manually set speed test values (Cmd+G to toggle)
          </Text>

          <Stack gap="md">
            <div>
              <Text size="sm" fw={500} style={{ marginBottom: "0.5em" }}>
                Download Speed (bps)
              </Text>
              <Input
                type="number"
                placeholder="e.g., 100000000 (100 Mbps)"
                value={down || ''}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  setDown(value);
                  setSpeed(Math.round((value / 1000000) * 1000) / 1000);
                }}
              />
            </div>

            <div>
              <Text size="sm" fw={500} style={{ marginBottom: "0.5em" }}>
                Upload Speed (bps)
              </Text>
              <Input
                type="number"
                placeholder="e.g., 50000000 (50 Mbps)"
                value={up || ''}
                onChange={(e) => setUp(parseFloat(e.target.value) || 0)}
              />
            </div>

            <div>
              <Text size="sm" fw={500} style={{ marginBottom: "0.5em" }}>
                Ping (ms)
              </Text>
              <Input
                type="number"
                placeholder="e.g., 15"
                value={ping || ''}
                onChange={(e) => setPing(parseFloat(e.target.value) || 0)}
              />
            </div>

            <div>
              <Text size="sm" fw={500} style={{ marginBottom: "0.5em" }}>
                Jitter (ms)
              </Text>
              <Input
                type="number"
                placeholder="e.g., 2"
                value={jitter || ''}
                onChange={(e) => setJitter(parseFloat(e.target.value) || 0)}
              />
            </div>

            <Button
              variant={isTesting ? "filled" : "outline"}
              color={isTesting ? "red" : "blue"}
              onClick={() => setIsTesting(!isTesting)}
              style={{ marginTop: "1em" }}
            >
              {isTesting ? "Stop Testing Animation" : "Start Testing Animation"}
            </Button>

            <Button
              variant="light"
              color="gray"
              onClick={() => {
                setDown(0);
                setUp(0);
                setPing(0);
                setJitter(0);
                setSpeed(0);
                setIsTesting(false);
              }}
              style={{ marginTop: "0.5em" }}
            >
              Reset All Values
            </Button>
          </Stack>
        </Stack>
      </Card>
    </MantineProvider>
  );
}

export default App;
