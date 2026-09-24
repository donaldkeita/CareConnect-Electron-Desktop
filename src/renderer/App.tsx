import { useEffect, useState } from "react";

export default function App() {
  const [version, setVersion] = useState("loading");

  useEffect(() => {
    void window.careConnectDesktop.getAppVersion().then(setVersion);
  }, []);

  return (
    <main className="app-shell">
      <h1>CareConnect</h1>
      <p>Desktop application shell</p>
      <small>
        Version {version} · {window.careConnectDesktop.platform}
      </small>
    </main>
  );
}
