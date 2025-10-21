import { useState } from "react";
import styles from "./App.module.css";
import Nav from "./components/Nav";
import RainCanvas from "./components/RainCanvas";
import LanyardBadge from "./components/LanyardBadge";

import About from "./pages/About";
import Projects from "./pages/Projects";
import Contact from "./pages/Contact";

export default function App() {
  const [activeTab, setActiveTab] = useState("about");

  const render = () => {
    switch (activeTab) {
      case "about":
        return <About />;
      case "projects":
        return <Projects />;
      case "contact":
        return <Contact />;
      default:
        return <About />;
    }
  };

  return (
    <div className={styles.app}>
      <RainCanvas /> {/* chuva sutil */}
      <Nav activeTab={activeTab} setActiveTab={setActiveTab} />
      {activeTab === "about" && <LanyardBadge />}{" "}
      {/* crachá apenas no Sobre Mim */}
      <main className={styles.main}>{render()}</main>
    </div>
  );
}
