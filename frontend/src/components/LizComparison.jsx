import React from "react";
import LizWeather from "./liz/EarlyWarningBanner.jsx";
import LizProducer from "../variants/liz/components/ProducerMode.jsx";
import "../variants/liz/scoped-tokens.css";
import "../styles/liz-adaptations.css";

export default function LizComparison({ screen, weatherProps, sowingProps }) {
  return <div className="liz-preview" data-screen={screen} style={{fontFamily:"var(--font-family-base)",color:"var(--tinta)"}}>
    <div className="tarpuy-page-surface rounded-3xl p-1 sm:p-3">
      {screen === "clima" ? <LizWeather {...weatherProps}/> : <LizProducer {...sowingProps}/>}
    </div>
  </div>;
}
