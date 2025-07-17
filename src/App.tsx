import { useState, useEffect } from "react";
import "./App.css";
import {
  Button,
  Card,
  Center,
  createTheme,
  Flex,
  Grid,
  Image,
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
import { PiGameControllerFill } from "react-icons/pi";
import { FaGlobe as FaRedditAlien } from "react-icons/fa";
import { GoDot, GoDotFill } from "react-icons/go";
import { TbTransfer } from "react-icons/tb";
import { BiSolidCoffeeTogo, BiVideo } from "react-icons/bi";
import { FaGun } from "react-icons/fa6";
import { FaInfoCircle } from "react-icons/fa";
import { RiNetflixFill as SiNetflix } from "react-icons/ri";
import { isPWA, isInstallPromptAvailable, showInstallPrompt } from "./pwa";
import { MdExpandMore, MdInstallMobile } from "react-icons/md";
import { BsFillHeartFill } from "react-icons/bs";
import { Capacitor } from "@capacitor/core";
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
  function isRunningInCapacitor() {
    return Capacitor.isNativePlatform();
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
        const distanceKm = Math.round(shortestDistance);
        const distanceMiles = Math.round(shortestDistance * 0.621371);
        return `${nearestServer.city}, ${nearestServer.cca2} (${distanceKm}km / ${distanceMiles}mi away)`;
      } else {
        return "Unable to determine nearest server";
      }
    } catch (error) {
      console.error("Failed to fetch Cloudflare locations:", error);
      return "Unable to determine nearest server";
    }
  }

  function isDarkMode() {
    return (
      localStorage.getItem("colorScheme") === "dark" ||
      (window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
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
  const [ints, setInts] = useState(0);
  console.log(ints);
  const [previousValues, setPreviousValues] = useState({
    down: 0,
    up: 0,
    ping: 0,
  });
  const [unchangedCount, setUnchangedCount] = useState(0);
  const [intervalId, setIntervalId] = useState<ReturnType<
    typeof setInterval
  > | null>(null);
  const [showAdv, setShowAdv] = useState(false);
  const [showUses, setShowUses] = useState(false);
  const [showAllGames, setShowAllGames] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showAppUpsell, setShowAppUpsell] = useState(false);
  const [canInstallPWA, setCanInstallPWA] = useState(false);
  
  useEffect(() => {
    // Check PWA install availability periodically
    const checkPWAInstall = () => {
      setCanInstallPWA(isInstallPromptAvailable() && !isPWA());
    };
    
    checkPWAInstall();
    const interval = setInterval(checkPWAInstall, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handlePWAInstall = async () => {
    const installed = await showInstallPrompt();
    if (installed) {
      setCanInstallPWA(false);
    }
  };
  
  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey && event.key === "g") {
        event.preventDefault();
        setShowDebug((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
  useEffect(() => {
    const getUserLocation = async () => {
      try {
        let response = await fetch("https://api.ipify.org?format=json");
        const ipData = await response.json();
        response = await fetch(`http://ip-api.com/json/${ipData.ip}`);
        const data = await response.json();
        if (data.status === "success") {
          if (data.city && data.regionName && data.country) {
            setUserLocation(
              `${data.city}, ${data.regionName}, ${data.country}`
            );
          } else if (data.city && data.country) {
            setUserLocation(`${data.city}, ${data.country}`);
          } else {
            setUserLocation("Location unavailable");
          }
          if (data.lat && data.lon) {
            const nearestServer = await findNearestCloudflareServer(
              data.lat,
              data.lon
            );
            setNearestCloudflareServer(nearestServer);
          } else {
            setNearestCloudflareServer("ERR");
          }
        } else {
          throw new Error("Location service failed");
        }
      } catch (error) {
        console.error("Failed to get location:", error);
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              setUserLocation("Location detected via GPS");
              const nearestServer = await findNearestCloudflareServer(
                latitude,
                longitude
              );
              setNearestCloudflareServer(nearestServer);
            },
            () => {
              setUserLocation("Location unavailable");
              setNearestCloudflareServer("Unable to determine nearest server");
            }
          );
        } else {
          setUserLocation("Location unavailable");
          setNearestCloudflareServer("Unable to determine nearest server");
        }
      }
    };
    getUserLocation();
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      try {
        let response = await fetch("https://api.ipify.org?format=json");
        const ipData = await response.json();
        response = await fetch(`http://ip-api.com/json/${ipData.ip}`);
        const data = await response.json();
        if (data.status === "success" && data.lat && data.lon) {
          const lat = data.lat;
          const lon = data.lon;
          setNearestCloudflareServer(
            await findNearestCloudflareServer(lat, lon)
          );
        }
      } catch (error) {
        console.error("Failed to fetch location data:", error);
      }
    };
    fetchData();
  }, [userLocation]);
  function isSmolPhone() {
    return (
      window.innerWidth < 550 ||
      window.innerHeight < 550 ||
      /Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
        navigator.userAgent
      )
    );
  }
  console.log(previousValues);
  console.log(unchangedCount);
  return (
    <div
      style={{
        background: isDarkMode()
          ? "#482f2fff"
          : "linear-gradient(rgb(254, 243, 234), rgb(245, 241, 238))",
        height: "100vh",
        width: "100vw",
        maxHeight: "100vh",
        maxWidth: "100vw",
        overflow: "hidden",
      }}
    >
      <MantineProvider defaultColorScheme="auto" theme={theme}>
        <style>
          {`
        @keyframes becomewhitecircle {
  0% {
  }
  100% {
    width: 204px;
    height: 204px;
    aspect-ratio: 1/1 !important;
    border-radius: 50%;
    opacity: 1;
    user-select: none;
    pointer-events: none;
    color: ${isDarkMode() ? "#fff" : "#000"};
   background: ${isDarkMode() ? "#683747ff" : "#fbf8f5ff"} !important;
  }
}

.boo {
   box-shadow: ${
     isDarkMode()
       ? "0 2px 4px rgba(0, 0, 0, 0.1), 0px 5px 10px -5px rgba(255,255,255,0.4) inset"
       : "0 2px 4px rgba(0, 0, 0, 0.1), 0px 20px 10px -5px rgba(255,255,255,1) inset"
   } !important;
                      background: ${
                        isDarkMode() ? "#683747ff" : "#fbf8f5ff"
                      } !important;
}

@keyframes becomewhitesquircle {
  0% {
  }
  100% {
    width: 70vw;
    height: 40vh;
    border-radius: 20px;
    opacity: 1;
    background-color: ${isDarkMode() ? "#333" : "white"};
  }
}

a {
  color: ${!isDarkMode() ? "#76561a" : "#ad7d7dff"};
  text-decoration: none;
}

@keyframes textpulse {
  0% {
    color: ${isDarkMode() ? "#c0c0c0" : "#808080"};
  }
  50% {
    color: ${isDarkMode() ? "#c0c0c0a0" : "#80808080"};
  }
  100% {
   color: ${isDarkMode() ? "#c0c0c0" : "#808080"};
  }
}

`}
        </style>
        <Center
          style={{
            height:
              window.innerWidth < 520 && isSmolPhone()
                ? "70vh"
                : isSmolPhone()
                ? "85vh"
                : "100vh",
            width: "100vw",
          }}
        >
          <Stack style={{ width: "80vw" }}>
            <Title
              order={1}
              className="title"
              style={{
                textAlign: "center",
                color: isDarkMode() ? "#fff" : "#000",
                display: "",
                fontSize:
                  window.innerWidth < 520 && isSmolPhone() ? "3rem" : "4rem",
              }}
            >
              QwkSpd
            </Title>
            {window.innerWidth < 520 && isSmolPhone() ? (
              <> </>
            ) : (
              <Title
                order={2}
                style={{
                  color: isDarkMode() ? "#fff" : "#000",
                  textAlign: "center",
                  display: "",
                }}
              >
                Powered by{" "}
                <a href="https://cloudflare.com" target="_blank">
                  <img
                    src="/cloudflare.png"
                    alt="Cloudflare"
                    style={{
                      width: "auto",
                      height: "0.6em",
                      marginBottom: "0.07em",
                      filter: isDarkMode() ? "invert(1)" : "none",
                    }}
                  />
                </a>
              </Title>
            )}
            <Space h={window.innerWidth < 520 && isSmolPhone() ? "0" : "md"} />
            <Stack style={{ height: "40vh" }}>
              <Center
                style={{
                  display: speed > 0 ? "" : "none",
                }}
              >
                <Stack>
                  <Center>
                    <Card
                      style={{
                        display: speed > 0 ? "" : "none",
                        width: "204px",
                        height: "204px",
                        position: "relative",
                        userSelect: "none",
                        justifySelf: "center",
                        boxShadow: isDarkMode()
                          ? "0 2px 4px rgba(0, 0, 0, 0.1), 0px 5px 10px -5px rgba(255,255,255,0.4) inset"
                          : "0 2px 4px rgba(0, 0, 0, 0.1), 0px 20px 10px -5px rgba(255,255,255,1) inset",
                        background: isDarkMode() ? "#683747ff" : "#fbf8f5ff",
                        animation: isTesting ? "borderpulse 3s infinite" : "",
                      }}
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
                          color: isDarkMode()
                            ? isTesting
                              ? "grey"
                              : "white"
                            : isTesting
                            ? "grey"
                            : "black",
                        }}
                        className={isTesting ? "sync-pulse" : ""}
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
                          color: isDarkMode()
                            ? isTesting
                              ? "grey"
                              : "white"
                            : isTesting
                            ? "grey"
                            : "black",
                        }}
                        className={isTesting ? "sync-pulse" : ""}
                      >
                        {frmbts(up, true)}
                      </Text>{" "}
                      <Title
                        order={1}
                        style={{
                          textAlign: "center",
                          display: speed > 0 ? "block" : "none",
                          color: isDarkMode()
                            ? isTesting
                              ? "grey"
                              : "white"
                            : isTesting
                            ? "grey"
                            : "black",
                          fontSize: "3rem",
                        }}
                        className={isTesting ? "sync-pulse" : ""}
                        id="speed-display"
                      >
                        <Title
                          order={1}
                          style={{
                            textAlign: "center",
                            display: speed > 0 ? "block" : "none",
                            color: isDarkMode()
                              ? isTesting
                                ? "grey"
                                : "white"
                              : isTesting
                              ? "grey"
                              : "black",
                            fontSize: "3rem",
                            width: "100%",
                            paddingTop: "1em",
                            height: "fit-content",
                          }}
                          className={isTesting ? "sync-pulse" : ""}
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
                          color: isDarkMode()
                            ? isTesting
                              ? "grey"
                              : "white"
                            : isTesting
                            ? "grey"
                            : "black",
                        }}
                        className={isTesting ? "sync-pulse" : ""}
                      >
                        ⇣
                      </Text>
                      <Stack
                        style={{
                          position: "absolute",
                          top: "14em",
                          left: "2em",
                        }}
                      >
                        <Text>Download Speed: {frmbts(down)}</Text>
                        <Text>Upload Speed: {frmbts(up)}</Text>
                        <Text>Ping: {ping.toFixed(2)}ms</Text>
                      </Stack>
                    </Card>
                  </Center>
                  <Space h="sm" />
                  <Card
                    style={{
                      width: "fit-content",
                      boxShadow: isDarkMode()
                        ? "0 2px 4px rgba(0, 0, 0, 0.1), 0px 5px 10px -5px rgba(255,255,255,0.4) inset"
                        : "0 2px 4px rgba(0, 0, 0, 0.1), 0px 20px 10px -5px rgba(255,255,255,1) inset",
                      background: isDarkMode() ? "#683747ff" : "#fbf8f5ff",
                      animation: isTesting ? "borderpulse 3s infinite" : "",
                    }}
                    radius="xl"
                  >
                    <Flex gap="md">
                      <Stack>
                        <Center
                          h={
                            window.innerWidth < 520 && isSmolPhone()
                              ? "2.5em"
                              : "3em"
                          }
                        >
                          <PiGameControllerFill
                            size={
                              window.innerWidth < 520 && isSmolPhone()
                                ? "2.25em"
                                : "3em"
                            }
                            color={
                              isDarkMode()
                                ? isTesting
                                  ? "grey"
                                  : "white"
                                : isTesting
                                ? "grey"
                                : "black"
                            }
                            className={isTesting ? "sync-pulse" : ""}
                          />
                        </Center>
                        <Rating
                          emptySymbol={
                            <GoDot
                              size={
                                window.innerWidth < 520 && isSmolPhone()
                                  ? "1em"
                                  : isSmolPhone()
                                  ? "1.2em"
                                  : "1.5em"
                              }
                            />
                          }
                          fullSymbol={
                            <GoDotFill
                              size={
                                window.innerWidth < 520 && isSmolPhone()
                                  ? "1em"
                                  : isSmolPhone()
                                  ? "1.2em"
                                  : "1.5em"
                              }
                            />
                          }
                          color={
                            isDarkMode()
                              ? isTesting
                                ? "grey"
                                : "white"
                              : isTesting
                              ? "grey"
                              : "black"
                          }
                          className={isTesting ? "sync-pulse" : ""}
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
                        <Center
                          h={
                            window.innerWidth < 520 && isSmolPhone()
                              ? "2.5em"
                              : "3em"
                          }
                        >
                          <SiNetflix
                            size={
                              window.innerWidth < 520 && isSmolPhone()
                                ? "2em"
                                : "2.5em"
                            }
                            color={
                              isDarkMode()
                                ? isTesting
                                  ? "grey"
                                  : "white"
                                : isTesting
                                ? "grey"
                                : "black"
                            }
                            className={isTesting ? "sync-pulse" : ""}
                          />
                        </Center>
                        <Rating
                          emptySymbol={
                            <GoDot
                              size={
                                window.innerWidth < 520 && isSmolPhone()
                                  ? "1em"
                                  : isSmolPhone()
                                  ? "1.2em"
                                  : "1.5em"
                              }
                            />
                          }
                          fullSymbol={
                            <GoDotFill
                              size={
                                window.innerWidth < 520 && isSmolPhone()
                                  ? "1em"
                                  : isSmolPhone()
                                  ? "1.2em"
                                  : "1.5em"
                              }
                            />
                          }
                          color={
                            isDarkMode()
                              ? isTesting
                                ? "grey"
                                : "white"
                              : isTesting
                              ? "grey"
                              : "black"
                          }
                          className={isTesting ? "sync-pulse" : ""}
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
                        <Center
                          h={
                            window.innerWidth < 520 && isSmolPhone()
                              ? "2.5em"
                              : "3em"
                          }
                        >
                          <FaRedditAlien
                            size={
                              window.innerWidth < 520 && isSmolPhone()
                                ? "2em"
                                : "2.5em"
                            }
                            color={
                              isDarkMode()
                                ? isTesting
                                  ? "grey"
                                  : "white"
                                : isTesting
                                ? "grey"
                                : "black"
                            }
                            className={isTesting ? "sync-pulse" : ""}
                          />
                        </Center>
                        <Rating
                          emptySymbol={
                            <GoDot
                              size={
                                window.innerWidth < 520 && isSmolPhone()
                                  ? "1em"
                                  : isSmolPhone()
                                  ? "1.2em"
                                  : "1.5em"
                              }
                            />
                          }
                          fullSymbol={
                            <GoDotFill
                              size={
                                window.innerWidth < 520 && isSmolPhone()
                                  ? "1em"
                                  : isSmolPhone()
                                  ? "1.2em"
                                  : "1.5em"
                              }
                            />
                          }
                          color={
                            isDarkMode()
                              ? isTesting
                                ? "grey"
                                : "white"
                              : isTesting
                              ? "grey"
                              : "black"
                          }
                          className={isTesting ? "sync-pulse" : ""}
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
                    </Flex>
                    <Center>
                      <MdExpandMore
                        style={{
                          display: speed > 0 && !isTesting ? "" : "none",
                          cursor: "pointer",
                          backgroundColor: "#cccccc44",
                          borderRadius: "50%",
                          padding: "0.3em",
                        }}
                        size="1.7em"
                        onClick={() => setShowUses(true)}
                      />
                    </Center>
                  </Card>
                  <Space h="sm" />
                  <Text
                    style={{
                      color: "#ad7d7dff",
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
                  className="boo"
                  onClick={async () => {
                    if (isTesting) return;
                    (
                      document.getElementById("test-button") as HTMLElement
                    )?.classList?.add("shrinkaway");
                    setSpeed(0);
                    setUnchangedCount(0);
                    setPreviousValues({ down: 0, up: 0, ping: 0 });
                    setInts(0);
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
                          document.getElementById(
                            "speed-display"
                          ) as HTMLElement
                        )?.classList?.add("growappear");
                      }
                      const newDown = banana.results.getSummary()
                        .download as number;
                      const newUp = banana.results.getSummary()
                        .upload as number;
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
                      setInts((ints) => {
                        let newInts = ints + 1;
                        console.log(`Interval ${newInts}`);
                        if (newInts >= 150 && newUp > 0) {
                          console.log("Reached 5 intervals, stopping test");
                          setIsTesting(false);
                          clearInterval(id);
                          setIntervalId(null);
                        } else if (!(newUp > 0)) {
                          newInts = 0;
                        }
                        return newInts;
                      });
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
                            console.log(`Unchanged count: ${newCount}/14`);
                            if (newCount >= 14) {
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
                    color: isDarkMode() ? "#fff" : "#333",
                  }}
                  fullWidth
                  size="xl"
                  radius="lg"
                >
                  {!isTesting ? "Start" : ""}
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
        {/* Advanced Stats Modal */}
        <Card
          style={{
            position: "absolute",
            top: "5%",
            left: "5%",
            width: "90vw",
            height: "90vh",
            overflowY: "auto",
            display: showAdv ? "block" : "none",
            backgroundColor: isDarkMode() ? "#403437ff" : "white",
            border: isDarkMode() ? "1px solid #421017ff" : "1px solid #e9ecef",
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
                backgroundColor: isDarkMode() ? "#40292cff" : "#f8f9fa",
                color: isDarkMode() ? "#adb5bd" : "#666",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.2em",
                transition: "all 0.2s ease",
                border: isDarkMode()
                  ? "1px solid #421017ff"
                  : "1px solid #e9ecef",
                zIndex: 1000,
              }}
              onClick={() => {
                setShowAdv(false);
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isDarkMode()
                  ? "#5f383dff"
                  : "#e9ecef";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = isDarkMode()
                  ? "#40292cff"
                  : "#f8f9fa";
              }}
            >
              <RxCross2 />
            </div>
            <Stack style={{ padding: isSmolPhone() ? "0em" : "2em" }}>
              <Title
                order={1}
                style={{
                  textAlign: "center",
                  marginBottom: "0.5em",
                  fontSize: "2.5rem",
                  fontWeight: 700,
                  color: isDarkMode() ? "#fff" : "#333",
                }}
              >
                Advanced Statistics
              </Title>
              <Text
                style={{
                  textAlign: "center",
                  color: isDarkMode() ? "#adb5bd" : "#ad7d7dff",
                  fontSize: "1.1rem",
                  marginBottom: "2em",
                }}
              >
                Detailed insights into your network performance
              </Text>{" "}
              <Title
                order={3}
                style={{
                  color: isDarkMode() ? "#fff" : "#333",
                  marginBottom: "0.5em",
                  textAlign: "center",
                  fontWeight: 600,
                }}
              >
                My Speed Seems Off?
              </Title>
              <Text
                style={{
                  textAlign: "center",
                  color: isDarkMode() ? "#adb5bd" : "#666",
                  fontSize: "1rem",
                  marginBottom: "1.5em",
                }}
              >
                QwkSpd will likely give different speeds than other tests like
                Speedtest or Fast. This is because QwkSpd uses Cloudflare's
                servers rather than dedicated speed test servers. While those
                other tests are more speed-accurate, this test will be more
                accurate to IRL usage, as most of the web goes through
                Cloudflare's servers.
                <br /> <br /> Also, see the distance of your nearest Cloudflare
                server below, as that can affect your speed.
              </Text>{" "}
              <Stack gap="xl">
                <Card
                  style={{
                    backgroundColor: isDarkMode() ? "#5f383dff" : "white",
                    border: isDarkMode()
                      ? "1px solid #421017ff"
                      : "1px solid #e9ecef",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                  radius="lg"
                  p="xl"
                >
                  <Title
                    order={3}
                    style={{
                      color: isDarkMode() ? "#fff" : "#333",
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
                      <Text
                        size="lg"
                        style={{
                          color: isDarkMode() ? "#adb5bd" : "#666",
                          fontWeight: 500,
                        }}
                      >
                        Download Speed
                      </Text>
                      <div style={{ textAlign: "right" }}>
                        <Text
                          size="xl"
                          fw={600}
                          style={{ color: isDarkMode() ? "#fff" : "#333" }}
                        >
                          {frmbts(down)}
                        </Text>
                        <Text size="sm" style={{ color: "#ad7d7dff" }}>
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
                      <Text
                        size="lg"
                        style={{
                          color: isDarkMode() ? "#adb5bd" : "#666",
                          fontWeight: 500,
                        }}
                      >
                        Upload Speed
                      </Text>
                      <div style={{ textAlign: "right" }}>
                        <Text
                          size="xl"
                          fw={600}
                          style={{ color: isDarkMode() ? "#fff" : "#333" }}
                        >
                          {frmbts(up)}
                        </Text>
                        <Text size="sm" style={{ color: "#ad7d7dff" }}>
                          ({(up / 1000).toFixed(2)} Kbps)
                        </Text>
                      </div>
                    </div>
                  </Stack>
                </Card>{" "}
                <Card
                  style={{
                    backgroundColor: isDarkMode() ? "#5f383dff" : "white",
                    border: isDarkMode()
                      ? "1px solid #421017ff"
                      : "1px solid #e9ecef",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                  radius="lg"
                  p="xl"
                >
                  <Title
                    order={3}
                    style={{
                      color: isDarkMode() ? "#fff" : "#333",
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
                      <Text
                        size="lg"
                        style={{
                          color: isDarkMode() ? "#adb5bd" : "#666",
                          fontWeight: 500,
                        }}
                      >
                        Ping
                      </Text>
                      <Text
                        size="xl"
                        fw={600}
                        style={{ color: isDarkMode() ? "#fff" : "#333" }}
                      >
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
                      <Text
                        size="lg"
                        style={{
                          color: isDarkMode() ? "#adb5bd" : "#666",
                          fontWeight: 500,
                        }}
                      >
                        Jitter
                      </Text>
                      <Text
                        size="xl"
                        fw={600}
                        style={{ color: isDarkMode() ? "#fff" : "#333" }}
                      >
                        {jitter.toFixed(2)} ms
                      </Text>
                    </div>
                  </Stack>
                </Card>{" "}
                <Card
                  style={{
                    backgroundColor: isDarkMode() ? "#5f383dff" : "white",
                    border: isDarkMode()
                      ? "1px solid #421017ff"
                      : "1px solid #e9ecef",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                  radius="lg"
                  p="xl"
                >
                  <Title
                    order={3}
                    style={{
                      color: isDarkMode() ? "#fff" : "#333",
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
                      <Text
                        size="lg"
                        style={{
                          color: isDarkMode() ? "#adb5bd" : "#666",
                          fontWeight: 500,
                        }}
                      >
                        Your Location
                      </Text>
                      <Text
                        size="lg"
                        fw={500}
                        style={{
                          color: isDarkMode() ? "#fff" : "#333",
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
                      <Text
                        size="lg"
                        style={{
                          color: isDarkMode() ? "#adb5bd" : "#666",
                          fontWeight: 500,
                        }}
                      >
                        Cloudflare Server
                      </Text>
                      <Text
                        size="lg"
                        fw={500}
                        style={{
                          color: isDarkMode() ? "#fff" : "#333",
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
        </Card>{" "}
        {/* Uses Stats  */}
        <Card
          style={{
            position: "absolute",
            top: "5%",
            left: "5%",
            width: "90vw",
            height: "90vh",
            overflowY: "auto",
            display: showUses ? "block" : "none",
            backgroundColor: isDarkMode() ? "#403437ff" : "white",
            border: isDarkMode() ? "1px solid #421017ff" : "1px solid #e9ecef",
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
                backgroundColor: isDarkMode() ? "#40292cff" : "#f8f9fa",
                color: isDarkMode() ? "#adb5bd" : "#666",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.2em",
                transition: "all 0.2s ease",
                border: isDarkMode()
                  ? "1px solid #421017ff"
                  : "1px solid #e9ecef",
                zIndex: 1000,
              }}
              onClick={() => {
                setShowUses(false);
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isDarkMode()
                  ? "#5f383dff"
                  : "#e9ecef";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = isDarkMode()
                  ? "#40292cff"
                  : "#f8f9fa";
              }}
            >
              <RxCross2 />
            </div>
            <Stack style={{ padding: isSmolPhone() ? "0em" : "1em" }}>
              <Title
                order={1}
                style={{
                  textAlign: "center",
                  marginBottom: "0.5em",
                  fontSize: "2.5rem",
                  fontWeight: 700,
                  color: isDarkMode() ? "#fff" : "#333",
                }}
              >
                What Can You Do?
              </Title>
              <Text
                style={{
                  textAlign: "center",
                  color: isDarkMode() ? "#adb5bd" : "#ad7d7dff",
                  fontSize: "1.1rem",
                  marginBottom: "2em",
                }}
              >
                Estimated download times for popular content
              </Text>{" "}
              <Grid gutter={isSmolPhone() ? "0" : "xs"}>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Card
                    style={{
                      backgroundColor: isDarkMode() ? "#5f383dff" : "white",
                      border: isDarkMode()
                        ? "1px solid #421017ff"
                        : "1px solid #e9ecef",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                      height: "100%",
                    }}
                    radius="lg"
                    p="xl"
                  >
                    <Title
                      order={3}
                      style={{
                        color: isDarkMode() ? "#fff" : "#333",
                        marginBottom: "1.5em",
                        textAlign: "center",
                        fontWeight: 600,
                      }}
                    >
                      <PiGameControllerFill
                        size="1.2em"
                        style={{
                          marginRight: "0.5em",
                          verticalAlign: "middle",
                        }}
                      />
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
                        { name: "Minecraft (Java)", size: 1 },
                      ]
                        .slice(0, showAllGames ? undefined : 5)
                        .map((game, index, array) => {
                          const downloadTimeSeconds =
                            (game.size * 8 * 1000000000) / down;
                          const displayTime =
                            downloadTimeSeconds < 60
                              ? `${Math.round(downloadTimeSeconds)} seconds`
                              : downloadTimeSeconds < 3600
                              ? `${Math.round(
                                  downloadTimeSeconds / 60
                                )} minutes`
                              : downloadTimeSeconds < 86400
                              ? `${(downloadTimeSeconds / 3600).toFixed(
                                  1
                                )} hours`
                              : `${(downloadTimeSeconds / 86400).toFixed(
                                  1
                                )} days`;
                          return (
                            <div
                              key={index}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "1em 0",
                                borderBottom:
                                  index < array.length - 1
                                    ? "1px solid #f1f3f4"
                                    : "none",
                              }}
                            >
                              <div>
                                <Text
                                  size="lg"
                                  style={{
                                    color: isDarkMode() ? "white" : "#333",
                                    fontWeight: 500,
                                  }}
                                >
                                  {game.name}
                                </Text>
                                <Text size="sm" style={{ color: "#ad7d7dff" }}>
                                  {game.size} GB
                                </Text>
                              </div>
                              <Text
                                size="lg"
                                fw={600}
                                style={{
                                  color: isDarkMode() ? "#ccc" : "#333",
                                }}
                              >
                                {down > 0
                                  ? displayTime
                                  : "Test your speed first"}
                              </Text>
                            </div>
                          );
                        })}{" "}
                      <Center style={{ paddingTop: "1em" }}>
                        <Button
                          variant="subtle"
                          size="sm"
                          onClick={() => setShowAllGames(!showAllGames)}
                          style={{ color: "#ad7d7dff" }}
                        >
                          {showAllGames ? "Show less" : "Show more games"}
                        </Button>
                      </Center>
                    </Stack>
                  </Card>
                </Grid.Col>{" "}
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Card
                    style={{
                      backgroundColor: isDarkMode() ? "#5f383dff" : "white",
                      border: isDarkMode()
                        ? "1px solid #421017ff"
                        : "1px solid #e9ecef",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                      height: "100%",
                    }}
                    radius="lg"
                    p="xl"
                  >
                    <Title
                      order={3}
                      style={{
                        color: isDarkMode() ? "#fff" : "#333",
                        marginBottom: "1.5em",
                        textAlign: "center",
                        fontWeight: 600,
                      }}
                    >
                      <SiNetflix
                        size="1.2em"
                        style={{
                          marginRight: "0.5em",
                          verticalAlign: "middle",
                        }}
                      />
                      Streaming Performance
                    </Title>
                    <Stack gap="lg">
                      {[
                        {
                          quality: "4K Ultra HD",
                          requirement: 25,
                          description: "Netflix, Disney+, Prime Video",
                        },
                        {
                          quality: "4K HDR",
                          requirement: 50,
                          description: "Apple TV+, Premium streaming",
                        },
                        {
                          quality: "1080p HD",
                          requirement: 5,
                          description: "Full HD streaming",
                        },
                        {
                          quality: "720p",
                          requirement: 3,
                          description: "HD streaming",
                        },
                        {
                          quality: "480p",
                          requirement: 1.5,
                          description: "Standard definition",
                        },
                      ].map((stream, index) => {
                        const canStream = down / 1000000 >= stream.requirement;
                        const qualityColor = canStream ? "#28a745" : "#f59e0b";
                        return (
                          <div
                            key={index}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "1em 0",
                              borderBottom:
                                index < 4 ? "1px solid #f1f3f4" : "none",
                            }}
                          >
                            <div>
                              <Text
                                size="lg"
                                style={{
                                  color: isDarkMode() ? "#fff" : "#333",
                                  fontWeight: 500,
                                }}
                              >
                                {stream.quality}
                              </Text>
                              <Text size="sm" style={{ color: "#ad7d7dff" }}>
                                {stream.description}
                              </Text>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <Text
                                size="lg"
                                fw={600}
                                style={{ color: qualityColor }}
                              >
                                {canStream ? "✓ Smooth" : "⚠ May buffer"}
                              </Text>
                              <Text size="sm" style={{ color: "#ad7d7dff" }}>
                                Optimal: {stream.requirement} Mbps
                              </Text>
                            </div>
                          </div>
                        );
                      })}
                    </Stack>
                  </Card>
                </Grid.Col>{" "}
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Card
                    style={{
                      backgroundColor: isDarkMode() ? "#5f383dff" : "white",
                      border: isDarkMode()
                        ? "1px solid #421017ff"
                        : "1px solid #e9ecef",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                      height: "100%",
                    }}
                    radius="lg"
                    p="xl"
                  >
                    <Title
                      order={3}
                      style={{
                        color: isDarkMode() ? "#fff" : "#333",
                        marginBottom: "1.5em",
                        textAlign: "center",
                        fontWeight: 600,
                      }}
                    >
                      <FaRedditAlien
                        size="1.2em"
                        style={{
                          marginRight: "0.5em",
                          verticalAlign: "middle",
                        }}
                      />
                      Social Media Browsing
                    </Title>
                    <Text
                      style={{
                        textAlign: "center",
                        color: isDarkMode() ? "#adb5bd" : "#ad7d7dff",
                        fontSize: "0.9rem",
                        marginBottom: "1em",
                      }}
                    >
                      These activities primarily depend on your download speed
                    </Text>
                    <Stack gap="lg">
                      {[
                        {
                          activity: "4K Video Streaming",
                          requirement: 25,
                          description: "YouTube, TikTok, Instagram Reels",
                        },
                        {
                          activity: "1080p Video Streaming",
                          requirement: 5,
                          description: "Social media videos",
                        },
                        {
                          activity: "Image-Heavy Browsing",
                          requirement: 3,
                          description: "Instagram, Pinterest feeds",
                        },
                        {
                          activity: "Social Media Browsing",
                          requirement: 1,
                          description: "Twitter, Facebook, Reddit",
                        },
                        {
                          activity: "Web Browsing",
                          requirement: 0.5,
                          description: "General internet use",
                        },
                      ].map((activity, index) => {
                        const canDo = down / 1000000 >= activity.requirement;
                        const statusColor = canDo ? "#28a745" : "#f59e0b";
                        return (
                          <div
                            key={index}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "1em 0",
                              borderBottom:
                                index < 4 ? "1px solid #f1f3f4" : "none",
                            }}
                          >
                            <div>
                              <Text
                                size="lg"
                                style={{
                                  color: isDarkMode() ? "#fff" : "#333",
                                  fontWeight: 500,
                                }}
                              >
                                {activity.activity}
                              </Text>
                              <Text size="sm" style={{ color: "#ad7d7dff" }}>
                                {activity.description}
                              </Text>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <Text
                                size="lg"
                                fw={600}
                                style={{ color: statusColor }}
                              >
                                {canDo ? "✓ Smooth" : "⚠ May buffer"}
                              </Text>
                              <Text size="sm" style={{ color: "#ad7d7dff" }}>
                                Optimal: {activity.requirement} Mbps
                              </Text>
                            </div>
                          </div>
                        );
                      })}
                    </Stack>
                  </Card>
                </Grid.Col>{" "}
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Card
                    style={{
                      backgroundColor: isDarkMode() ? "#5f383dff" : "white",
                      border: isDarkMode()
                        ? "1px solid #421017ff"
                        : "1px solid #e9ecef",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                      height: "100%",
                    }}
                    radius="lg"
                    p="xl"
                  >
                    <Title
                      order={3}
                      style={{
                        color: isDarkMode() ? "#fff" : "#333",
                        marginBottom: "1.5em",
                        textAlign: "center",
                        fontWeight: 600,
                      }}
                    >
                      <BiVideo
                        size="1.2em"
                        style={{
                          marginRight: "0.5em",
                          verticalAlign: "middle",
                        }}
                      />
                      Content Creation & Upload
                    </Title>
                    <Text
                      style={{
                        textAlign: "center",
                        color: isDarkMode() ? "#adb5bd" : "#ad7d7dff",
                        fontSize: "0.9rem",
                        marginBottom: "1em",
                      }}
                    >
                      These activities primarily depend on your upload speed
                    </Text>
                    <Stack gap="lg">
                      {[
                        {
                          activity: "4K Video Upload",
                          requirement: 40,
                          description: "YouTube, TikTok content creation",
                        },
                        {
                          activity: "1080p Video Upload",
                          requirement: 10,
                          description: "Instagram, Facebook videos",
                        },
                        {
                          activity: "HD Video Calls",
                          requirement: 2,
                          description: "Zoom, Teams, Discord",
                        },
                        {
                          activity: "Photo Upload",
                          requirement: 1,
                          description: "Instagram posts, cloud backup",
                        },
                        {
                          activity: "Live Streaming",
                          requirement: 5,
                          description: "Twitch, YouTube Live",
                        },
                      ].map((activity, index) => {
                        const canDo = up / 1000000 >= activity.requirement;
                        const statusColor = canDo ? "#28a745" : "#f59e0b";
                        return (
                          <div
                            key={index}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "1em 0",
                              borderBottom:
                                index < 4 ? "1px solid #f1f3f4" : "none",
                            }}
                          >
                            <div>
                              <Text
                                size="lg"
                                style={{
                                  color: isDarkMode() ? "#fff" : "#333",
                                  fontWeight: 500,
                                }}
                              >
                                {activity.activity}
                              </Text>
                              <Text size="sm" style={{ color: "#ad7d7dff" }}>
                                {activity.description}
                              </Text>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <Text
                                size="lg"
                                fw={600}
                                style={{ color: statusColor }}
                              >
                                {canDo ? "✓ Smooth" : "⚠ May lag"}
                              </Text>
                              <Text size="sm" style={{ color: "#ad7d7dff" }}>
                                Optimal: {activity.requirement} Mbps upload
                              </Text>
                            </div>
                          </div>
                        );
                      })}
                    </Stack>
                  </Card>
                </Grid.Col>{" "}
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Card
                    style={{
                      backgroundColor: isDarkMode() ? "#5f383dff" : "white",
                      border: isDarkMode()
                        ? "1px solid #421017ff"
                        : "1px solid #e9ecef",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                      height: "100%",
                    }}
                    radius="lg"
                    p="xl"
                  >
                    <Title
                      order={3}
                      style={{
                        color: isDarkMode() ? "#fff" : "#333",
                        marginBottom: "1.5em",
                        textAlign: "center",
                        fontWeight: 600,
                      }}
                    >
                      <TbTransfer
                        size="1.2em"
                        style={{
                          marginRight: "0.5em",
                          verticalAlign: "middle",
                        }}
                      />
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
                        const downloadTimeSeconds =
                          (file.size * 8 * 1000000000) / down;
                        const displayTime =
                          downloadTimeSeconds < 60
                            ? `${Math.round(downloadTimeSeconds)} seconds`
                            : downloadTimeSeconds < 3600
                            ? `${Math.round(downloadTimeSeconds / 60)} minutes`
                            : `${(downloadTimeSeconds / 3600).toFixed(
                                1
                              )} hours`;
                        return (
                          <div
                            key={index}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "1em 0",
                              borderBottom:
                                index < 4 ? "1px solid #f1f3f4" : "none",
                            }}
                          >
                            <div>
                              <Text
                                size="lg"
                                style={{
                                  color: isDarkMode() ? "#fff" : "#333",
                                  fontWeight: 500,
                                }}
                              >
                                {file.name}
                              </Text>
                            </div>
                            <Text
                              size="lg"
                              fw={600}
                              style={{ color: isDarkMode() ? "#ccc" : "#333" }}
                            >
                              {down > 0 ? displayTime : "Test your speed first"}
                            </Text>
                          </div>
                        );
                      })}
                    </Stack>
                  </Card>
                </Grid.Col>{" "}
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Card
                    style={{
                      backgroundColor: isDarkMode() ? "#5f383dff" : "white",
                      border: isDarkMode()
                        ? "1px solid #421017ff"
                        : "1px solid #e9ecef",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                      height: "100%",
                    }}
                    radius="lg"
                    p="xl"
                  >
                    <Title
                      order={3}
                      style={{
                        color: isDarkMode() ? "#fff" : "#333",
                        marginBottom: "1.5em",
                        textAlign: "center",
                        fontWeight: 600,
                      }}
                    >
                      <FaGun
                        size="1.2em"
                        style={{
                          marginRight: "0.5em",
                          verticalAlign: "middle",
                        }}
                      />
                      Online Gaming
                    </Title>
                    <Text
                      style={{
                        textAlign: "center",
                        color: isDarkMode() ? "#adb5bd" : "#ad7d7dff",
                        fontSize: "0.9rem",
                        marginBottom: "1em",
                      }}
                    >
                      These activities primarily depend on your ping/latency
                    </Text>
                    <Stack gap="lg">
                      {[
                        {
                          game: "Competitive FPS",
                          requirement: 20,
                          description: "CS2, Valorant, Overwatch",
                        },
                        {
                          game: "MOBA Games",
                          requirement: 30,
                          description: "League of Legends, Dota 2",
                        },
                        {
                          game: "Battle Royale",
                          requirement: 50,
                          description: "Fortnite, PUBG, Apex Legends",
                        },
                        {
                          game: "MMORPGs",
                          requirement: 100,
                          description: "World of Warcraft, Final Fantasy XIV",
                        },
                        {
                          game: "Turn-based Games",
                          requirement: 200,
                          description: "Chess, card games, strategy",
                        },
                      ].map((gameType, index) => {
                        const canPlay =
                          ping <= gameType.requirement && ping > 0;
                        const statusColor = canPlay
                          ? "#28a745"
                          : ping > gameType.requirement
                          ? "#f59e0b"
                          : "#666";
                        return (
                          <div
                            key={index}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "1em 0",
                              borderBottom:
                                index < 4 ? "1px solid #f1f3f4" : "none",
                            }}
                          >
                            <div>
                              <Text
                                size="lg"
                                style={{
                                  color: isDarkMode() ? "#fff" : "#333",
                                  fontWeight: 500,
                                }}
                              >
                                {gameType.game}
                              </Text>
                              <Text size="sm" style={{ color: "#ad7d7dff" }}>
                                {gameType.description}
                              </Text>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <Text
                                size="lg"
                                fw={600}
                                style={{ color: statusColor }}
                              >
                                {ping === 0
                                  ? "Test ping first"
                                  : canPlay
                                  ? "✓ Excellent"
                                  : "⚠ High latency"}
                              </Text>
                              <Text size="sm" style={{ color: "#ad7d7dff" }}>
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
        </Card>{" "}
        {/* Debug Menu */}
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
          </div>{" "}
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
            </Text>{" "}
            <Stack gap="md">
              <div>
                <Text size="sm" fw={500} style={{ marginBottom: "0.5em" }}>
                  Download Speed (bps)
                </Text>
                <Input
                  type="number"
                  placeholder="e.g., 100000000 (100 Mbps)"
                  value={down || ""}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    setDown(value);
                    setSpeed(Math.round((value / 1000000) * 1000) / 1000);
                  }}
                />
              </div>{" "}
              <div>
                <Text size="sm" fw={500} style={{ marginBottom: "0.5em" }}>
                  Upload Speed (bps)
                </Text>
                <Input
                  type="number"
                  placeholder="e.g., 50000000 (50 Mbps)"
                  value={up || ""}
                  onChange={(e) => setUp(parseFloat(e.target.value) || 0)}
                />
              </div>{" "}
              <div>
                <Text size="sm" fw={500} style={{ marginBottom: "0.5em" }}>
                  Ping (ms)
                </Text>
                <Input
                  type="number"
                  placeholder="e.g., 15"
                  value={ping || ""}
                  onChange={(e) => setPing(parseFloat(e.target.value) || 0)}
                />
              </div>{" "}
              <div>
                <Text size="sm" fw={500} style={{ marginBottom: "0.5em" }}>
                  Jitter (ms)
                </Text>
                <Input
                  type="number"
                  placeholder="e.g., 2"
                  value={jitter || ""}
                  onChange={(e) => setJitter(parseFloat(e.target.value) || 0)}
                />
              </div>{" "}
              <Button
                variant={isTesting ? "filled" : "outline"}
                color={isTesting ? "red" : "blue"}
                onClick={() => setIsTesting(!isTesting)}
                style={{ marginTop: "1em" }}
              >
                {isTesting
                  ? "Stop Testing Animation"
                  : "Start Testing Animation"}
              </Button>{" "}
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
        </Card>{" "}
        {/* Info Button and Card */}
        <FaInfoCircle
          style={{
            position: "fixed",
            bottom: isRunningInCapacitor() ? "30px" : "15px",
            right: isRunningInCapacitor() ? "30px" : "15px",
            opacity: 0.4,
            cursor: "pointer",
          }}
          onClick={() => setShowInfo(true)}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "0.7";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "0.4";
          }}
          size="2em"
        />{" "}
        <Card
          style={{
            position: "absolute",
            top: "5%",
            left: "5%",
            width: "90vw",
            height: "90vh",
            overflowY: "auto",
            display: showInfo ? "block" : "none",
            backgroundColor: isDarkMode() ? "#403437ff" : "#f8f9fa",
            border: isDarkMode() ? "1px solid #421017ff" : "1px solid #e9ecef",
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
                backgroundColor: isDarkMode() ? "#403437ff" : "#f8f9fa",
                color: isDarkMode() ? "#adb5bd" : "#666",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.2em",
                transition: "all 0.2s ease",
                border: isDarkMode()
                  ? "1px solid #421017ff"
                  : "1px solid #e9ecef",
                zIndex: 1000,
              }}
              onClick={() => setShowInfo(false)}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isDarkMode()
                  ? "#5f383dff"
                  : "#e9ecef";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = isDarkMode()
                  ? "#40292cff"
                  : "#f8f9fa";
              }}
            >
              <RxCross2 />
            </div>
            <Stack style={{ padding: isSmolPhone() ? "0em" : "2em" }} gap="0">
              <Title
                order={1}
                style={{
                  textAlign: "center",
                  fontSize: "2.5rem",
                  fontWeight: 800,
                  color: isDarkMode() ? "#fff" : "#333",
                }}
              >
                QwkSpd
              </Title>
              <Text
                style={{
                  textAlign: "center",
                  color: isDarkMode() ? "#adb5bd" : "#666",
                  fontSize: "1.1rem",
                  marginBottom: "2em",
                }}
              >
                By <a href="https://benjs.uk">BenJS</a>
              </Text>{" "}
              <Grid gutter="xl">
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Card
                    style={{
                      backgroundColor: isDarkMode() ? "#5f383dff" : "white",
                      border: isDarkMode()
                        ? "1px solid #421017ff"
                        : "1px solid #e9ecef",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                      height: "100%",
                    }}
                    radius="lg"
                    p="xl"
                  >
                    <Title
                      order={3}
                      style={{
                        color: isDarkMode() ? "#fff" : "#333",
                        marginBottom: "1.5em",
                        textAlign: "center",
                        fontWeight: 600,
                      }}
                    >
                      About This Project
                    </Title>
                    <Stack gap="lg">
                      <Text
                        style={{
                          color: isDarkMode() ? "#adb5bd" : "#666",
                          fontSize: "1rem",
                          lineHeight: 1.6,
                        }}
                      >
                        QwkSpd is my attempt at a speedtest that's fast,
                        accurate to everyday use, and provides information you
                        can actually use.
                      </Text>
                      <Text
                        style={{
                          color: isDarkMode() ? "#adb5bd" : "#666",
                          fontSize: "1rem",
                          lineHeight: 1.6,
                        }}
                      >
                        If you have any issues feel free to contact me on Slack
                        at @Barxilly or email me at{" "}
                        <a
                          href="mailto:qwkspd@benjs.uk?subject=QwkSpd%20Support%20-%20Issue%20Report"
                          style={{ color: "#007bff" }}
                        >
                          qwkspd@benjs.uk
                        </a>
                        .
                      </Text>
                    </Stack>
                  </Card>
                </Grid.Col>{" "}
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Card
                    style={{
                      backgroundColor: isDarkMode() ? "#5f383dff" : "white",
                      border: isDarkMode()
                        ? "1px solid #421017ff"
                        : "1px solid #e9ecef",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                      height: "100%",
                    }}
                    radius="lg"
                    p="xl"
                  >
                    <Title
                      order={3}
                      style={{
                        color: isDarkMode() ? "#fff" : "#333",
                        marginBottom: "1.5em",
                        textAlign: "center",
                        fontWeight: 600,
                      }}
                    >
                      Credits & Acknowledgments
                    </Title>
                    <Stack gap="lg">
                      <div>
                        <Text
                          style={{
                            color: isDarkMode() ? "#fff" : "#333",
                            fontWeight: 600,
                            marginBottom: "0.5em",
                          }}
                        >
                          Powered by Cloudflare
                        </Text>
                        <Text
                          style={{
                            color: isDarkMode() ? "#adb5bd" : "#666",
                            fontSize: "0.9rem",
                            lineHeight: 1.6,
                          }}
                        >
                          Speed testing infrastructure provided by Cloudflare's
                          global network, ensuring accurate and reliable
                          measurements from servers closest to you.
                        </Text>
                      </div>{" "}
                      <div>
                        <Text
                          style={{
                            color: isDarkMode() ? "#fff" : "#333",
                            fontWeight: 600,
                            marginBottom: "0.5em",
                          }}
                        >
                          Built With
                        </Text>
                        <Text
                          style={{
                            color: isDarkMode() ? "#adb5bd" : "#666",
                            fontSize: "0.9rem",
                            lineHeight: 1.6,
                          }}
                        >
                          • React + Vite
                          <br />
                          • Mantine
                          <br />• Cloudflare Speed Test API
                        </Text>
                      </div>
                      <div>
                        <Text
                          style={{
                            color: isDarkMode() ? "#fff" : "#333",
                            fontWeight: 600,
                            marginBottom: "0.5em",
                          }}
                        >
                          Open Source
                        </Text>
                        <Text
                          style={{
                            color: isDarkMode() ? "#adb5bd" : "#666",
                            fontSize: "0.9rem",
                            lineHeight: 1.6,
                          }}
                        >
                          This project is open source, and made using other open
                          source libraries and technologies.
                        </Text>
                      </div>
                    </Stack>
                  </Card>
                </Grid.Col>{" "}
                <Grid.Col span={12}>
                  <Card
                    style={{
                      backgroundColor: isDarkMode() ? "#4d2c37ff" : "#f8f9fa",
                      border: isDarkMode()
                        ? "1px solid #421017ff"
                        : "1px solid #e9ecef",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    }}
                    radius="lg"
                    p="lg"
                  >
                    <Center mb="md">
                      <a
                        href="https://ko-fi.com/sillysbs"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Image
                          src="https://storage.ko-fi.com/cdn/brandasset/v2/support_me_on_kofi_dark.png"
                          w="10em"
                          alt="Support me on Ko-fi"
                        />
                      </a>
                    </Center>
                    <Center>
                      <Text
                        style={{
                          textAlign: "center",
                          color: isDarkMode() ? "#fff" : "#333",
                          fontSize: "0.9rem",
                          display: "inline-block",
                        }}
                      >
                        QwkSpd • Made with{" "}
                        <BsFillHeartFill
                          style={{
                            color: isDarkMode() ? "#f55" : "#d00",
                            verticalAlign: "middle",
                          }}
                        />{" "}
                        +{" "}
                        <BiSolidCoffeeTogo
                          style={{
                            color: isDarkMode() ? "#f55" : "#d00",
                            verticalAlign: "middle",
                          }}
                        />{" "}
                        by BenJS • Version 1.0.1
                      </Text>
                    </Center>
                    <Text
                      style={{
                        textAlign: "center",
                        color: isDarkMode() ? "#adb5bd" : "#666",
                        fontSize: "0.8rem",
                        marginTop: "0.5em",
                      }}
                    >
                      Built in 2025 •{" "}
                      <a href="https://github.com/barxilly/BenJSSpeedTest">
                        Open Source
                      </a>
                    </Text>
                  </Card>
                </Grid.Col>
              </Grid>
            </Stack>
          </Card>
        </Card>
        {/* App Button and Card */}
        {!isRunningInCapacitor() && navigator.userAgent?.includes("Android") ? (
          <>
            <MdInstallMobile
              style={{
                position: "fixed",
                bottom: isRunningInCapacitor() ? "30px" : "15px",
                left: isRunningInCapacitor() ? "30px" : "15px",
                opacity: 0.4,
                cursor: "pointer",
              }}
              onClick={() => setShowAppUpsell(true)}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "0.7";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "0.4";
              }}
              size="2em"
            />{" "}
            <Card
              style={{
                position: "absolute",
                top: "5%",
                left: "5%",
                width: "90vw",
                height: "90vh",
                overflowY: "auto",
                display: showAppUpsell ? "block" : "none",
                backgroundColor: isDarkMode() ? "#403437ff" : "#f8f9fa",
                border: isDarkMode()
                  ? "1px solid #421017ff"
                  : "1px solid #e9ecef",
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
                    backgroundColor: isDarkMode() ? "#403437ff" : "#f8f9fa",
                    color: isDarkMode() ? "#adb5bd" : "#666",
                    borderRadius: "50%",
                    width: "40px",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.2em",
                    transition: "all 0.2s ease",
                    border: isDarkMode()
                      ? "1px solid #421017ff"
                      : "1px solid #e9ecef",
                    zIndex: 1000,
                  }}
                  onClick={() => setShowAppUpsell(false)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isDarkMode()
                      ? "#5f383dff"
                      : "#e9ecef";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isDarkMode()
                      ? "#40292cff"
                      : "#f8f9fa";
                  }}
                >
                  <RxCross2 />
                </div>
                <Stack
                  style={{ padding: isSmolPhone() ? "0em" : "2em" }}
                  gap="0"
                >
                  <Title
                    order={1}
                    style={{
                      textAlign: "center",
                      fontSize: "2.5rem",
                      fontWeight: 800,
                      color: isDarkMode() ? "#fff" : "#333",
                    }}
                  >
                    Install
                  </Title>
                  <Text
                    style={{
                      textAlign: "center",
                      color: isDarkMode() ? "#adb5bd" : "#666",
                      fontSize: "1.1rem",
                      marginBottom: "1em",
                    }}
                  >
                    {canInstallPWA ? "Install as PWA or download APK:" : "Only available on Android for now."}
                  </Text>
                  {canInstallPWA && (
                    <Center style={{ marginBottom: "1em" }}>
                      <Image
                        src="https://user-images.githubusercontent.com/3104648/28971167-ef90a94c-7922-11e7-998a-8f38b4e61cea.png"
                        w="10em"
                        alt="Install PWA Icon"
                        onClick={handlePWAInstall}
                      />
                    </Center>
                  )}
                  <Center>
                    <a
                      href="https://benjs.uk/qwkspd"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: "none", marginBottom: "1em", marginTop: "1em" }}
                    >
                      <Image
                        src="https://www.one-line.com/sites/g/files/lnzjqr776/files/styles/crop_freeform/public/APK-Badge.png?itok=K836bPDk"
                        w="10em"
                        alt="Download QwkSpd APK"
                      />
                    </a>
                  </Center>
                  <Space h="md" />
                  <Card
                    style={{
                      backgroundColor: isDarkMode() ? "#4d2c37ff" : "#f8f9fa",
                      border: isDarkMode()
                        ? "1px solid #421017ff"
                        : "1px solid #e9ecef",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    }}
                    radius="lg"
                    p="lg"
                  >
                    <Center>
                      <Text style={{ textAlign: "center", fontSize: "0.9rem", color: isDarkMode() ? "#adb5bd" : "#666" }}>
                        {canInstallPWA 
                          ? "If you prefer a native app experience or want to help get this on the Play Store and App Store:"
                          : "If you don't like sketchy apks and want to help me get this app on to the Play Store and App Store:"
                        }
                      </Text>
                    </Center>
                    <br></br>
                    <Center mb="sm">
                      <a
                        href="https://ko-fi.com/sillysbs"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Image
                          src="https://storage.ko-fi.com/cdn/brandasset/v2/support_me_on_kofi_dark.png"
                          w="12em"
                          alt="Support me on Ko-fi"
                        />
                      </a>
                    </Center>
                  </Card>
                </Stack>
              </Card>
            </Card>
          </>
        ) : (
          <></>
        )}
      </MantineProvider>
    </div>
  );
}
export default App;
