import Link from "next/link";
import { getPostsBySection } from "../lib/notion";
import LandingCover from "../components/LandingCover";

export const revalidate = 60;

export default async function HomePage() {
  const posts = await getPostsBySection("Blog");
  const latestPosts = posts.slice(0, 3);

  return (
    <main className="homePage">
      <LandingCover />

      <section className="sectionPage homeContentWrap">
        <section className="sectionHero">
          <p className="sectionEyebrow">Latest Writing</p>
          <h1>Recent Blog Posts</h1>
          <p className="sectionSubtitle">
            A small selection of recent writing from the Blog section.
          </p>
        </section>

        <section className="sectionContent">
          {latestPosts.length === 0 ? (
            <div className="emptyState">
              <h3>No blog posts yet.</h3>
              <p>Add posts in Notion with Section = Blog and Published checked.</p>
            </div>
          ) : (
            <div className="sectionGrid">
              {latestPosts.map((post: any) => (
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
                    {(post.tags || []).map((tag: string) => (
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

          <div className="homeMoreLink">
            <Link href="/blog">View all blog posts →</Link>
          </div>
        </section>
      </section>
    </main>
  );
}