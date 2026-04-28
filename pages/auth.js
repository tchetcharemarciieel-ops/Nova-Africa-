import { useState } from "react"

export default function Auth() {
  const [email, setEmail] = useState("")

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>Connexion 🔐</h1>

      <input
        placeholder="Ton email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ padding: 10, width: "100%" }}
      />

      <button
        onClick={() => alert("Connexion simulée pour: " + email)}
        style={{ marginTop: 10, padding: 10 }}
      >
        Se connecter
      </button>
    </div>
  )
}
