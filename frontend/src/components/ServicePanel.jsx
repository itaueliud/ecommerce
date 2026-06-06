import React from "react";

const whatsappChatLink = "https://wa.me/254710292540?text=Hello%20Danaba%2C%20I%20need%20buyer%20support.";

export default function ServicePanel() {
  return (
    <aside className="service-panel" aria-label="Danaba services">
      <div className="service-item">
        <strong>Buyer support</strong>
        <a href={whatsappChatLink} target="_blank" rel="noreferrer">
          Live chat on WhatsApp
        </a>
      </div>
      <div className="service-item">
        <strong>Verified sellers</strong>
        <span>Manufacturers, wholesalers, stockists</span>
      </div>
      <div className="service-item">
        <strong>Fast delivery</strong>
        <span>County and town dispatch options</span>
      </div>
    </aside>
  );
}
