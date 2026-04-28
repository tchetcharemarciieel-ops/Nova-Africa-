import { useState } from "react"

export default function Dashboard() {
  const [shopName, setShopName] = useState("")
  const [productName, setProductName] = useState("")
  const [price, setPrice] = useState("")

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>Dashboard vendeur 🧑‍💻</h1>

      <h3>Créer une boutique 🏪</h3>
      <input
        placeholder="Nom boutique"
        value={shopName}
        onChange={(e) => setShopName(e.target.value)}
        style={{ padding: 10, width: "100%" }}
      />
      <button
        onClick={() => alert("Boutique créée: " + shopName)}
        style={{ marginTop: 10, padding: 10 }}
      >
        Créer boutique
      </button>

      <hr />

      <h3>Ajouter produit 🛒</h3>
      <input
        placeholder="Nom produit"
        value={productName}
        onChange={(e) => setProductName(e.target.value)}
        style={{ padding: 10, width: "100%" }}
      />

      <input
        placeholder="Prix"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        style={{ padding: 10, width: "100%", marginTop: 10 }}
      />

      <button
        onClick={() =>
          alert(`Produit ajouté: ${productName} - ${price} FCFA`)
        }
        style={{ marginTop: 10, padding: 10 }}
      >
        Ajouter produit
      </button>
    </div>
  )
}
