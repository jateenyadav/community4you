// In-browser mock backend for the Community4You demo.
//
// When the app is deployed somewhere static (e.g. Netlify) with no real API,
// this module emulates the entire Express/SQLite backend against localStorage.
// It exposes a single `mockRequest(path, options)` that mirrors the server's
// REST routes and response envelopes, so the frontend code is unchanged.
//
// "Tokens" here are just the user id as a string — there's no security to
// model in a public demo, only realistic behaviour.

const STORE_KEY = "c4y_mock_db_v1";

const avatar = (name) =>
  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;

const nowIso = () => new Date().toISOString();

function slugify(name) {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "community"
  );
}

// --- Seed data -------------------------------------------------------------

function seedDb() {
  const users = [
    { id: 1, name: "Aria Mehta", email: "aria@community4you.dev", password: "password123", bio: "Frontend engineer & community organizer.", avatar: avatar("Aria Mehta") },
    { id: 2, name: "Leo Park", email: "leo@community4you.dev", password: "password123", bio: "Backend dev who loves clean APIs.", avatar: avatar("Leo Park") },
    { id: 3, name: "Sana Iqbal", email: "sana@community4you.dev", password: "password123", bio: "PyLadies lead, data science mentor.", avatar: avatar("Sana Iqbal") },
    { id: 4, name: "Demo User", email: "demo@community4you.dev", password: "demo1234", bio: "Just exploring great communities.", avatar: avatar("Demo User") },
  ];

  const communitiesSeed = [
    { ownerId: 1, name: "CODESS Cafe", tagline: "A cozy space for women in tech", category: "Women in Tech", description: "CODESS Cafe is a welcoming community for women and non-binary folks in software. We host mock interviews, resume reviews, and weekly coffee chats.", cover: "https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=1200", link: "https://codess.cafe/" },
    { ownerId: 2, name: "Learn For Cause", tagline: "Code for impact, not just resumes", category: "Open Source", description: "We build open-source projects that help NGOs and small nonprofits. Beginner-friendly, mentor-supported, and shipping real software.", cover: "https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=1200", link: "https://in.linkedin.com/company/learn-for-cause-lfc" },
    { ownerId: 3, name: "PyLadies Global", tagline: "Empowering women through Python", category: "Women in Tech", description: "An international mentorship network for women using Python — data science, web dev, automation and more. All skill levels welcome.", cover: "https://images.pexels.com/photos/9553909/pexels-photo-9553909.jpeg?auto=compress&cs=tinysrgb&w=1200", link: "https://pyladies.com/" },
    { ownerId: 1, name: "Dev Career Collective", tagline: "Level up from junior to senior", category: "Career", description: "Salary negotiation playbooks, system design study groups, and honest career advice from engineers who've been there.", cover: "https://images.pexels.com/photos/3153201/pexels-photo-3153201.jpeg?auto=compress&cs=tinysrgb&w=1200", link: "" },
    { ownerId: 2, name: "Hashnode Writers", tagline: "Home for tech writers and leaders", category: "Content", description: "A guild of developers who write. Share drafts, get feedback, and grow your technical blog with a supportive crowd.", cover: "https://images.pexels.com/photos/261662/pexels-photo-261662.jpeg?auto=compress&cs=tinysrgb&w=1200", link: "https://hashnode.com/" },
    { ownerId: 3, name: "Open Source Saturdays", tagline: "Ship your first PR with us", category: "Open Source", description: "Every Saturday we pair up to find good-first-issues and land contributions together. Bring your laptop and your curiosity.", cover: "https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&w=1200", link: "" },
  ];

  const communities = communitiesSeed.map((c, i) => ({
    id: i + 1,
    name: c.name,
    slug: slugify(c.name),
    tagline: c.tagline,
    description: c.description,
    category: c.category,
    cover: c.cover,
    link: c.link,
    owner_id: c.ownerId,
    created_at: nowIso(),
  }));

  // owner is admin member of own community
  const memberships = communities.map((c) => ({ user_id: c.owner_id, community_id: c.id, role: "admin", created_at: nowIso() }));
  const addMember = (userId, communityId) => {
    if (!memberships.some((m) => m.user_id === userId && m.community_id === communityId)) {
      memberships.push({ user_id: userId, community_id: communityId, role: "member", created_at: nowIso() });
    }
  };
  addMember(4, 1); addMember(4, 3); addMember(2, 1); addMember(3, 1);
  addMember(1, 3); addMember(1, 2); addMember(4, 5); addMember(2, 3);

  const posts = [
    { id: 1, community_id: 1, author_id: 1, title: "Welcome to CODESS Cafe ☕", body: "Introduce yourself below! What are you working on this week?", created_at: nowIso() },
    { id: 2, community_id: 1, author_id: 3, title: "Mock interview slots open", body: "I have 3 mock interview slots this Friday. Drop a comment to grab one.", created_at: nowIso() },
    { id: 3, community_id: 3, author_id: 3, title: "Intro to pandas workshop", body: "Saturday 5pm UTC. We'll cover dataframes, filtering, and groupby with real datasets.", created_at: nowIso() },
    { id: 4, community_id: 2, author_id: 2, title: "New NGO project: food bank tracker", body: "Looking for 2 React devs and 1 backend dev. Comment if interested!", created_at: nowIso() },
  ];

  const post_likes = [
    { post_id: 1, user_id: 4 }, { post_id: 1, user_id: 2 }, { post_id: 1, user_id: 3 },
    { post_id: 2, user_id: 4 }, { post_id: 2, user_id: 1 },
    { post_id: 3, user_id: 1 }, { post_id: 3, user_id: 2 }, { post_id: 3, user_id: 4 },
    { post_id: 4, user_id: 1 },
  ];

  const comments = [
    { id: 1, post_id: 1, author_id: 4, body: "Hi everyone! Frontend dev learning TypeScript this week. 👋", created_at: nowIso() },
    { id: 2, post_id: 1, author_id: 2, body: "Welcome! Ping me if you want to pair on anything.", created_at: nowIso() },
    { id: 3, post_id: 2, author_id: 4, body: "I'd love a slot — Friday 3pm works for me!", created_at: nowIso() },
    { id: 4, post_id: 4, author_id: 1, body: "Count me in for the React work.", created_at: nowIso() },
  ];

  return {
    users,
    communities,
    memberships,
    posts,
    post_likes,
    comments,
    seq: { users: 4, communities: 6, posts: 4, comments: 4 },
  };
}

// --- Persistence -----------------------------------------------------------

function loadDb() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* corrupt store — reseed */
  }
  const fresh = seedDb();
  saveDb(fresh);
  return fresh;
}

function saveDb(db) {
  localStorage.setItem(STORE_KEY, JSON.stringify(db));
}

export function resetMockDb() {
  const fresh = seedDb();
  saveDb(fresh);
  return fresh;
}

// --- Helpers that mirror the server's computed shapes ----------------------

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const publicUser = (u) => {
  if (!u) return null;
  const { password, ...rest } = u;
  return rest;
};

function uniqueSlug(db, name) {
  let base = slugify(name);
  let slug = base;
  let n = 1;
  while (db.communities.some((c) => c.slug === slug)) slug = `${base}-${n++}`;
  return slug;
}

function shapeCommunity(db, c) {
  const owner = db.users.find((u) => u.id === c.owner_id);
  return {
    ...c,
    owner_name: owner ? owner.name : "Unknown",
    member_count: db.memberships.filter((m) => m.community_id === c.id).length,
    post_count: db.posts.filter((p) => p.community_id === c.id).length,
  };
}

function shapePost(db, p, viewerId = 0) {
  const author = db.users.find((u) => u.id === p.author_id);
  return {
    ...p,
    author_name: author ? author.name : "Unknown",
    author_avatar: author ? author.avatar : avatar("User"),
    like_count: db.post_likes.filter((l) => l.post_id === p.id).length,
    comment_count: db.comments.filter((cm) => cm.post_id === p.id).length,
    liked: db.post_likes.some((l) => l.post_id === p.id && l.user_id === Number(viewerId)),
  };
}

function shapeComment(db, c) {
  const author = db.users.find((u) => u.id === c.author_id);
  return {
    ...c,
    author_name: author ? author.name : "Unknown",
    author_avatar: author ? author.avatar : avatar("User"),
  };
}

function isMember(db, userId, communityId) {
  return db.memberships.some((m) => m.user_id === userId && m.community_id === communityId);
}

function members(db, communityId) {
  return db.memberships
    .filter((m) => m.community_id === communityId)
    .map((m) => {
      const u = db.users.find((x) => x.id === m.user_id);
      return { id: u?.id, name: u?.name, avatar: u?.avatar, role: m.role, created_at: m.created_at };
    });
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Parses "Bearer <id>" into a user record (tokens are just the user id).
function authUser(db, headers) {
  const raw = headers?.Authorization || headers?.authorization || "";
  const token = raw.replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;
  return db.users.find((u) => String(u.id) === token) || null;
}

function requireUser(db, headers) {
  const u = authUser(db, headers);
  if (!u) throw new HttpError(401, "Authentication required");
  return u;
}

// --- The router: maps (method, path) -> response ---------------------------

export async function mockRequest(path, { method = "GET", body, headers = {} } = {}) {
  const db = loadDb();
  const [rawPath, query = ""] = path.split("?");
  const segs = rawPath.split("/").filter(Boolean); // strips leading "/"
  const q = Object.fromEntries(new URLSearchParams(query));
  // simulate a little latency so loading states are visible
  await new Promise((r) => setTimeout(r, 120));

  const result = route(db, method, segs, body, headers, q);
  saveDb(db);
  return result;
}

function route(db, method, segs, body, headers, q) {
  // ---- /auth ----
  if (segs[0] === "auth") {
    if (segs[1] === "register" && method === "POST") {
      const { name, email, password } = body || {};
      if (!name || !email || !password) throw new HttpError(400, "Name, email and password are required");
      if (!EMAIL_RE.test(email)) throw new HttpError(400, "Please provide a valid email address");
      if (password.length < 6) throw new HttpError(400, "Password must be at least 6 characters");
      if (db.users.some((u) => u.email === email.toLowerCase()))
        throw new HttpError(409, "An account with this email already exists");
      const user = {
        id: ++db.seq.users,
        name: name.trim(),
        email: email.toLowerCase(),
        password,
        bio: "",
        avatar: avatar(name),
      };
      db.users.push(user);
      return { user: publicUser(user), token: String(user.id) };
    }
    if (segs[1] === "login" && method === "POST") {
      const { email, password } = body || {};
      if (!email || !password) throw new HttpError(400, "Email and password are required");
      const u = db.users.find((x) => x.email === (email || "").toLowerCase());
      if (!u || u.password !== password) throw new HttpError(401, "Invalid email or password");
      return { user: publicUser(u), token: String(u.id) };
    }
    if (segs[1] === "me" && method === "GET") {
      return { user: publicUser(requireUser(db, headers)) };
    }
    if (segs[1] === "me" && method === "PATCH") {
      const u = requireUser(db, headers);
      const { name, bio, avatar: av } = body || {};
      if (name != null) u.name = name;
      if (bio != null) u.bio = bio;
      if (av != null) u.avatar = av;
      return { user: publicUser(u) };
    }
  }

  // ---- /me ----
  if (segs[0] === "me" && segs[1] === "communities" && method === "GET") {
    const u = requireUser(db, headers);
    const owned = db.communities
      .filter((c) => c.owner_id === u.id)
      .map((c) => shapeCommunity(db, c));
    const joinedIds = db.memberships.filter((m) => m.user_id === u.id).map((m) => m.community_id);
    const joined = db.communities
      .filter((c) => joinedIds.includes(c.id))
      .map((c) => shapeCommunity(db, c));
    return { owned, joined };
  }

  // ---- /communities ----
  if (segs[0] === "communities") {
    // collection-level routes
    if (segs.length === 1 && method === "GET") {
      let list = db.communities.map((c) => shapeCommunity(db, c));
      if (q.search) {
        const s = q.search.toLowerCase();
        list = list.filter(
          (c) =>
            c.name.toLowerCase().includes(s) ||
            (c.tagline || "").toLowerCase().includes(s) ||
            (c.description || "").toLowerCase().includes(s)
        );
      }
      if (q.category && q.category !== "All") list = list.filter((c) => c.category === q.category);
      list.sort((a, b) =>
        q.sort === "popular" ? b.member_count - a.member_count : b.id - a.id
      );
      return { communities: list };
    }
    if (segs.length === 1 && method === "POST") {
      const u = requireUser(db, headers);
      const { name, tagline, description, category, cover, link } = body || {};
      if (!name || !name.trim()) throw new HttpError(400, "Community name is required");
      const c = {
        id: ++db.seq.communities,
        name: name.trim(),
        slug: uniqueSlug(db, name.trim()),
        tagline: tagline ?? "",
        description: description ?? "",
        category: category ?? "General",
        cover: cover ?? null,
        link: link ?? "",
        owner_id: u.id,
        created_at: nowIso(),
      };
      db.communities.push(c);
      db.memberships.push({ user_id: u.id, community_id: c.id, role: "admin", created_at: nowIso() });
      return { community: shapeCommunity(db, c) };
    }
    if (segs[1] === "categories" && method === "GET") {
      const counts = {};
      db.communities.forEach((c) => {
        counts[c.category] = (counts[c.category] || 0) + 1;
      });
      const categories = Object.entries(counts)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count);
      return { categories };
    }
    if (segs[1] === "stats" && method === "GET") {
      return {
        stats: {
          communities: db.communities.length,
          members: db.memberships.length,
          posts: db.posts.length,
          users: db.users.length,
        },
      };
    }
    if (segs[1] === "trending" && method === "GET") {
      const list = db.communities
        .map((c) => shapeCommunity(db, c))
        .sort((a, b) => b.member_count - a.member_count || b.post_count - a.post_count)
        .slice(0, 5);
      return { communities: list };
    }

    // slug-scoped routes
    const slug = segs[1];
    const community = db.communities.find((c) => c.slug === slug);

    // /communities/:slug
    if (segs.length === 2) {
      if (!community) throw new HttpError(404, "Community not found");
      if (method === "GET") {
        const viewer = authUser(db, headers);
        const shaped = shapeCommunity(db, community);
        return {
          community: {
            ...shaped,
            isMember: viewer ? isMember(db, viewer.id, community.id) : false,
            isOwner: viewer ? viewer.id === community.owner_id : false,
          },
          members: members(db, community.id),
          posts: db.posts
            .filter((p) => p.community_id === community.id)
            .sort((a, b) => b.id - a.id)
            .map((p) => shapePost(db, p, viewer ? viewer.id : 0)),
        };
      }
      if (method === "PATCH") {
        const u = requireUser(db, headers);
        if (community.owner_id !== u.id) throw new HttpError(403, "Only the owner can edit this community");
        const f = body || {};
        ["name", "tagline", "description", "category", "cover", "link"].forEach((k) => {
          if (f[k] != null) community[k] = f[k];
        });
        return { community: shapeCommunity(db, community) };
      }
      if (method === "DELETE") {
        const u = requireUser(db, headers);
        if (community.owner_id !== u.id) throw new HttpError(403, "Only the owner can delete this community");
        const postIds = db.posts.filter((p) => p.community_id === community.id).map((p) => p.id);
        db.posts = db.posts.filter((p) => p.community_id !== community.id);
        db.post_likes = db.post_likes.filter((l) => !postIds.includes(l.post_id));
        db.comments = db.comments.filter((cm) => !postIds.includes(cm.post_id));
        db.memberships = db.memberships.filter((m) => m.community_id !== community.id);
        db.communities = db.communities.filter((c) => c.id !== community.id);
        return { ok: true };
      }
    }

    // /communities/:slug/join
    if (segs.length === 3 && segs[2] === "join") {
      if (!community) throw new HttpError(404, "Community not found");
      const u = requireUser(db, headers);
      if (method === "POST") {
        if (!isMember(db, u.id, community.id))
          db.memberships.push({ user_id: u.id, community_id: community.id, role: "member", created_at: nowIso() });
        return { community: { ...shapeCommunity(db, community), isMember: true } };
      }
      if (method === "DELETE") {
        if (community.owner_id === u.id) throw new HttpError(400, "The owner cannot leave their own community");
        db.memberships = db.memberships.filter(
          (m) => !(m.user_id === u.id && m.community_id === community.id)
        );
        return { community: { ...shapeCommunity(db, community), isMember: false } };
      }
    }

    // /communities/:slug/posts
    if (segs.length === 3 && segs[2] === "posts" && method === "POST") {
      if (!community) throw new HttpError(404, "Community not found");
      const u = requireUser(db, headers);
      if (!isMember(db, u.id, community.id)) throw new HttpError(403, "Join the community to post");
      const { title, body: text } = body || {};
      if (!title?.trim() || !text?.trim()) throw new HttpError(400, "Title and body are required");
      const post = {
        id: ++db.seq.posts,
        community_id: community.id,
        author_id: u.id,
        title: title.trim(),
        body: text.trim(),
        created_at: nowIso(),
      };
      db.posts.push(post);
      return { post: shapePost(db, post, u.id) };
    }

    // /communities/:slug/posts/:postId ...
    if (segs.length >= 4 && segs[2] === "posts") {
      if (!community) throw new HttpError(404, "Community not found");
      const postId = Number(segs[3]);
      const post = db.posts.find((p) => p.id === postId && p.community_id === community.id);

      // DELETE post
      if (segs.length === 4 && method === "DELETE") {
        const u = requireUser(db, headers);
        if (!post) throw new HttpError(404, "Post not found");
        if (post.author_id !== u.id && community.owner_id !== u.id)
          throw new HttpError(403, "Not allowed to delete this post");
        db.posts = db.posts.filter((p) => p.id !== post.id);
        db.post_likes = db.post_likes.filter((l) => l.post_id !== post.id);
        db.comments = db.comments.filter((cm) => cm.post_id !== post.id);
        return { ok: true };
      }

      // toggle like
      if (segs.length === 5 && segs[4] === "like" && method === "POST") {
        const u = requireUser(db, headers);
        if (!post) throw new HttpError(404, "Post not found");
        const liked = db.post_likes.some((l) => l.post_id === post.id && l.user_id === u.id);
        if (liked) db.post_likes = db.post_likes.filter((l) => !(l.post_id === post.id && l.user_id === u.id));
        else db.post_likes.push({ post_id: post.id, user_id: u.id });
        return { post: shapePost(db, post, u.id) };
      }

      // comments collection
      if (segs.length === 5 && segs[4] === "comments") {
        if (method === "GET") {
          if (!post) throw new HttpError(404, "Post not found");
          return {
            comments: db.comments
              .filter((cm) => cm.post_id === post.id)
              .sort((a, b) => a.id - b.id)
              .map((cm) => shapeComment(db, cm)),
          };
        }
        if (method === "POST") {
          const u = requireUser(db, headers);
          if (!isMember(db, u.id, community.id)) throw new HttpError(403, "Join the community to comment");
          if (!post) throw new HttpError(404, "Post not found");
          const text = body?.body;
          if (!text?.trim()) throw new HttpError(400, "Comment cannot be empty");
          const comment = {
            id: ++db.seq.comments,
            post_id: post.id,
            author_id: u.id,
            body: text.trim(),
            created_at: nowIso(),
          };
          db.comments.push(comment);
          return { comment: shapeComment(db, comment) };
        }
      }

      // delete a comment
      if (segs.length === 6 && segs[4] === "comments" && method === "DELETE") {
        const u = requireUser(db, headers);
        const commentId = Number(segs[5]);
        const comment = db.comments.find((cm) => cm.id === commentId && cm.post_id === postId);
        if (!comment) throw new HttpError(404, "Comment not found");
        if (comment.author_id !== u.id && community.owner_id !== u.id)
          throw new HttpError(403, "Not allowed to delete this comment");
        db.comments = db.comments.filter((cm) => cm.id !== comment.id);
        return { ok: true };
      }
    }
  }

  throw new HttpError(404, "Not found");
}

export { HttpError };

export default { loadDb, saveDb, resetMockDb, slugify, mockRequest };
