import React from "react";
import AuthForm from "../components/AuthForm.jsx";

export default function Account({ authStatus, onLogin, onRegister }) {
  return (
    <main>
      <section className="content-row container page-panel">
        <div className="section-heading">
          <h2>Account</h2>
        </div>
        <AuthForm status={authStatus} onLogin={onLogin} onRegister={onRegister} />
      </section>
    </main>
  );
}
