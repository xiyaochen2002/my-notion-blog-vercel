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

type GalleryPageProps = {
  title: string;
  subtitle: string;
  posts: Post[];
};

export default function GalleryPage({ title, subtitle, posts }: GalleryPageProps) {
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
          <div className="galleryGrid">
            {posts.map((post) => (
              <Link key={post.id} href={`/posts/${post.slug}`} className="galleryItem">
                {post.cover ? (
                  <>
                    <img
                      src={post.cover}
                      alt={post.title}
                      className="galleryItemImg"
                      loading="lazy"
                    />
                    <div className="galleryItemOverlay">
                      <div className="galleryItemMeta">
                        {post.date && (
                          <span className="galleryItemDate">{post.date}</span>
                        )}
                        <h3 className="galleryItemTitle">{post.title}</h3>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="galleryItemText">
                    {post.date && (
                      <span className="galleryItemDate galleryItemDateDark">
                        {post.date}
                      </span>
                    )}
                    <h3 className="galleryItemTitleDark">{post.title}</h3>
                    {post.summary && (
                      <p className="galleryItemSummary">{post.summary}</p>
                    )}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
