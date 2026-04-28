export default function Home() {
  return (
    <div style={{ fontFamily: "Arial", padding: 20 }}>
      <h1>Nova Market Africa 🚀</h1>

      <p>Crée ta boutique en ligne et vends facilement en Afrique.</p>

      <a href="/auth">
        <button style={{ padding: 10, marginTop: 20 }}>
          Se connecter
        </button>
      </a>

      <br /><br />

      <a href="/dashboard">
        Dashboard vendeur
      </a>
    </div>
  )
}
