import Link from "next/link";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
};

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <section className="sectionHero">
      <div className="pageTopBar">
        <Link href="/" className="backHome">
          ← Home
        </Link>

        <nav className="pageMiniNav">
          <Link href="/blog">Blog</Link>
          <Link href="/thoughts">Thoughts</Link>
          <Link href="/about">About</Link>
          <Link href="/travel">Travel</Link>
          <Link href="/notes">Notes</Link>
        </nav>
      </div>

      <p className="sectionEyebrow">Xiyao Chen</p>
      <h1>{title}</h1>
      {subtitle ? <p className="sectionSubtitle">{subtitle}</p> : null}
    </section>
  );
}