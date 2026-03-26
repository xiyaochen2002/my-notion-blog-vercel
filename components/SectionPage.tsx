import Link from "next/link";
import PageHeader from "./PageHeader";

type Post = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  date: string;
  category: string;
  tags?: string[];
  cover?: string;
};

type SectionPageProps = {
  title: string;
  subtitle: string;
  posts: Post[];
};

export default function SectionPage({
  title,
  subtitle,
  posts,
}: SectionPageProps) {
  return (
    <main className="sectionPage">
      <PageHeader title={title} subtitle={subtitle} />

      <section className="sectionContent">
        {posts.length === 0 ? (
          <div className="emptyState">
            <h3>Nothing here yet.</h3>
            <p>Add a post in Notion and mark it as Published.</p>
          </div>
        ) : (
          <div className="sectionGrid">
            {posts.map((post) => (
              <article key={post.id} className="sectionCard">
                {post.cover ? (
                  <img
                    src={post.cover}
                    alt={post.title}
                    className="sectionCardCover"
                  />
                ) : null}

                <div className="sectionMeta">
                  <span>{post.date || "No date"}</span>
                  {post.category ? <span> · {post.category}</span> : null}
                </div>

                <h2>{post.title}</h2>
                <p>{post.summary || "No summary yet."}</p>

                <div className="sectionTags">
                  {(post.tags || []).map((tag) => (
                    <span key={tag} className="sectionTag">
                      {tag}
                    </span>
                  ))}
                </div>

                <Link href={`/posts/${post.slug}`} className="sectionLink">
                  Read More
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}