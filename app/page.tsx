import Link from "next/link";
import { getPublishedPosts } from "../lib/notion";

export const revalidate = 60;

export default async function HomePage() {
  const posts = await getPublishedPosts();

  return (
    <main className="container">
      <nav className="nav">
        <div className="brand">Xiyao's Blog</div>
        <div className="navLinks">
          <a href="#posts">文章</a>
          <a href="#about">关于</a>
        </div>
      </nav>

      <section className="hero">
        <p className="eyebrow">Notion 驱动博客</p>
        <h1>用 Notion 写作，用自己的域名展示</h1>
        <p className="heroText">
          你以后只需要在 Notion 里写内容。这个网站会自动读取已发布文章并展示出来。
        </p>
      </section>

      <section id="posts">
        <div className="sectionHeader">
          <h2>最新文章</h2>
          <span>{posts.length} 篇</span>
        </div>

        <div className="postGrid">
          {posts.map((post: any) => (
            <article key={post.id} className="card">
              {post.cover ? (
                <img className="cover" src={post.cover} alt={post.title} />
              ) : null}

              <div className="meta">
                <span>{post.date || "未设置日期"}</span>
                {post.category ? <span> · {post.category}</span> : null}
              </div>

              <h3>{post.title}</h3>
              <p>{post.summary || "暂无摘要"}</p>

              <Link className="button" href={`/posts/${post.slug}`}>
                阅读文章
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section id="about" className="setupBox">
        <h2>使用方式</h2>
        <p>
          你在 Notion 数据库里新增文章，并勾选 <code>Published</code>，网站就会自动读取。
        </p>
      </section>
    </main>
  );
}
