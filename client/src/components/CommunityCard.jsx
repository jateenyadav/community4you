import { Link } from "react-router-dom";

const FALLBACK = "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1200";

export default function CommunityCard({ community }) {
  const { slug, name, tagline, category, cover, member_count, post_count } = community;
  return (
    <Link to={`/c/${slug}`} className="card">
      <div className="card-cover">
        <img src={cover || FALLBACK} alt={name} loading="lazy" />
        <span className="card-cat">{category}</span>
      </div>
      <div className="card-body">
        <h3>{name}</h3>
        <p className="tagline">{tagline || "A community for developers."}</p>
        <div className="card-meta">
          <span>👥 {member_count} members</span>
          <span>📝 {post_count} posts</span>
        </div>
      </div>
    </Link>
  );
}
