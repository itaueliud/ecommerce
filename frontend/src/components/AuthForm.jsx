import React, { useState } from "react";

const strongPasswordRules = [
  { label: "At least 8 characters", test: (value) => value.length >= 8 },
  { label: "One uppercase letter", test: (value) => /[A-Z]/.test(value) },
  { label: "One lowercase letter", test: (value) => /[a-z]/.test(value) },
  { label: "One number", test: (value) => /\d/.test(value) },
  { label: "One special character", test: (value) => /[^A-Za-z0-9]/.test(value) }
];

function getMissingPasswordRules(value) {
  return strongPasswordRules.filter((rule) => !rule.test(value));
}

export default function AuthForm({ status, onLogin, onRegister }) {
  const [mode, setMode] = useState("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState("");

  const isRegistering = mode === "register";

  function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    if (!isRegistering) {
      onLogin(email.trim(), password);
      return;
    }

    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    const missingRules = getMissingPasswordRules(password);
    if (missingRules.length > 0) {
      setFormError("Use a strong password that meets every rule.");
      return;
    }

    onRegister(fullName.trim(), email.trim(), password, phone.trim());
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setFormError("");
  }

  return (
    <form className="auth-card" onSubmit={handleSubmit}>
      <h2>{isRegistering ? "Create a customer account" : "Customer sign in"}</h2>
      <p>
        {isRegistering
          ? "Create a customer account for Danaba shopping and checkout."
          : "Sign in to shop, checkout, and manage your Danaba orders."}
      </p>
      {isRegistering && (
        <label>
          Full name
          <input
            type="text"
            required
            placeholder="Your full name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
          />
        </label>
      )}
      <label>
        Email
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>
      <label>
        Password
        <span className="password-field">
          <input
            type={showPassword ? "text" : "password"}
            required
            placeholder="Your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((isVisible) => !isVisible)}
          >
            {showPassword ? "●" : "○"}
          </button>
        </span>
      </label>
      {isRegistering && (
        <>
          <ul className="password-rules" aria-label="Password requirements">
            {strongPasswordRules.map((rule) => {
              const isMet = rule.test(password);

              return (
                <li key={rule.label} className={isMet ? "met" : ""}>
                  <span aria-hidden="true">{isMet ? "OK" : "-"}</span>
                  {rule.label}
                </li>
              );
            })}
          </ul>
          <label>
            Confirm password
            <span className="password-field">
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
              <button
                type="button"
                aria-label={showConfirmPassword ? "Hide password confirmation" : "Show password confirmation"}
                onClick={() => setShowConfirmPassword((isVisible) => !isVisible)}
              >
                {showConfirmPassword ? "●" : "○"}
              </button>
            </span>
          </label>
          <label>
            Phone
            <input
              type="tel"
              required
              placeholder="0712345678"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </label>
        </>
      )}
      <p className="auth-status">{formError || status}</p>
      {isRegistering && (
        <button className="register-link auth-switch-link" type="button" onClick={() => switchMode("login")}>
          Sign in instead
        </button>
      )}
      <button className="auth-submit" type="submit">
        {isRegistering ? "Create account" : "Sign in"}
      </button>
      {!isRegistering && (
        <button className="register-link auth-switch-link" type="button" onClick={() => switchMode("register")}>
          Create account
        </button>
      )}
    </form>
  );
}
