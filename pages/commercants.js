import Link from "next/link";
import Layout from "../components/Layout";

export default function Commercants() {
  return (
    <Layout title="Pour les commerçants" description="Approvisionnement en quantité pour commerçants, petites entreprises et établissements de Bangui." hero={{ eyebrow: "Commerçants et entreprises", title: "Approvisionnement professionnel", sub: "Marchandises en quantité, devis personnalisé en FCFA, suivi de chaque commande." }}>
      <section className="block"><div className="wrap">
        <p>Vous achetez en quantité pour revendre ou équiper votre activité ? Transmettez-nous votre besoin : nous étudions les fournisseurs possibles, vérifions le transport et vous remettons un devis personnalisé en FCFA.</p>
        <div className="grid">
          <div className="card"><h3>Commerçants</h3><ul><li>Accessoires téléphoniques et informatiques</li><li>Vêtements, chaussures et accessoires</li><li>Emballages, présentoirs, fournitures de boutique</li><li>Petit matériel professionnel</li><li>Marchandises en quantité</li></ul></div>
          <div className="card"><h3>Entreprises et établissements</h3><ul><li>Mobilier et équipements de bureau</li><li>Matériel informatique</li><li>Fournitures professionnelles</li><li>Équipements adaptés à votre activité</li></ul></div>
        </div>
        <p className="notice mt">Les droits et taxes douaniers ne sont jamais calculés avec un pourcentage universel : ils sont estimés produit par produit, avec un professionnel compétent, et indiqués comme estimation ou confirmés dans le devis.</p>
        <p><Link href="/demande?profil=commercant" className="btn">Demander un devis professionnel</Link></p>
      </div></section>
    </Layout>
  );
}
