import { useRouter } from "next/router"

export default function Store() {
  const router = useRouter()
  const { slug } = router.query

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>Boutique 🏪</h1>

      <h2>{slug}</h2>

      <p>Bienvenue dans cette boutique Nova Market Africa</p>

      <div style={{ border: "1px solid #ddd", padding: 10, marginTop: 20 }}>
        <h3>Produit exemple</h3>
        <p>Prix : 5000 FCFA</p>
        <button>Acheter</button>
      </div>
    </div>
  )
}
