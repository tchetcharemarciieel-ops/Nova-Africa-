export default function PageHero({ eyebrow, title, children }) {
  return (
    <div className="pagehero"><div className="wrap">
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h1>{title}</h1>
      {children && <p>{children}</p>}
    </div></div>
  );
}
