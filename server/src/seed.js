import bcrypt from "bcryptjs";
import db from "./db.js";
import { createUser } from "./repositories/users.js";
import { createCommunity, join } from "./repositories/communities.js";
import { create as createPost, like as likePost, createComment } from "./repositories/posts.js";

console.log("Seeding database…");

// Reset (FK cascade clears the rest).
db.exec(`DELETE FROM posts; DELETE FROM memberships; DELETE FROM communities; DELETE FROM users;`);
db.exec(`DELETE FROM sqlite_sequence WHERE name IN ('posts','memberships','communities','users');`);

const avatar = (name) =>
  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;

const users = [
  { name: "Aria Mehta", email: "aria@community4you.dev", password: "password123", bio: "Frontend engineer & community organizer." },
  { name: "Leo Park", email: "leo@community4you.dev", password: "password123", bio: "Backend dev who loves clean APIs." },
  { name: "Sana Iqbal", email: "sana@community4you.dev", password: "password123", bio: "PyLadies lead, data science mentor." },
  { name: "Demo User", email: "demo@community4you.dev", password: "demo1234", bio: "Just exploring great communities." },
].map((u) =>
  createUser({
    name: u.name,
    email: u.email,
    password: bcrypt.hashSync(u.password, 10),
    avatar: avatar(u.name),
  })
);

const [aria, leo, sana, demo] = users;
// add bios
const setBio = db.prepare(`UPDATE users SET bio = ? WHERE id = ?`);
setBio.run("Frontend engineer & community organizer.", aria.id);
setBio.run("Backend dev who loves clean APIs.", leo.id);
setBio.run("PyLadies lead, data science mentor.", sana.id);
setBio.run("Just exploring great communities.", demo.id);

const communitiesSeed = [
  {
    owner: aria,
    name: "CODESS Cafe",
    tagline: "A cozy space for women in tech",
    category: "Women in Tech",
    description:
      "CODESS Cafe is a welcoming community for women and non-binary folks in software. We host mock interviews, resume reviews, and weekly coffee chats.",
    cover: "https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=1200",
    link: "https://codess.cafe/",
  },
  {
    owner: leo,
    name: "Learn For Cause",
    tagline: "Code for impact, not just resumes",
    category: "Open Source",
    description:
      "We build open-source projects that help NGOs and small nonprofits. Beginner-friendly, mentor-supported, and shipping real software.",
    cover: "https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=1200",
    link: "https://in.linkedin.com/company/learn-for-cause-lfc",
  },
  {
    owner: sana,
    name: "PyLadies Global",
    tagline: "Empowering women through Python",
    category: "Women in Tech",
    description:
      "An international mentorship network for women using Python — data science, web dev, automation and more. All skill levels welcome.",
    cover: "https://images.pexels.com/photos/9553909/pexels-photo-9553909.jpeg?auto=compress&cs=tinysrgb&w=1200",
    link: "https://pyladies.com/",
  },
  {
    owner: aria,
    name: "Dev Career Collective",
    tagline: "Level up from junior to senior",
    category: "Career",
    description:
      "Salary negotiation playbooks, system design study groups, and honest career advice from engineers who've been there.",
    cover: "https://images.pexels.com/photos/3153201/pexels-photo-3153201.jpeg?auto=compress&cs=tinysrgb&w=1200",
    link: "",
  },
  {
    owner: leo,
    name: "Hashnode Writers",
    tagline: "Home for tech writers and leaders",
    category: "Content",
    description:
      "A guild of developers who write. Share drafts, get feedback, and grow your technical blog with a supportive crowd.",
    cover: "https://images.pexels.com/photos/261662/pexels-photo-261662.jpeg?auto=compress&cs=tinysrgb&w=1200",
    link: "https://hashnode.com/",
  },
  {
    owner: sana,
    name: "Open Source Saturdays",
    tagline: "Ship your first PR with us",
    category: "Open Source",
    description:
      "Every Saturday we pair up to find good-first-issues and land contributions together. Bring your laptop and your curiosity.",
    cover: "https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&w=1200",
    link: "",
  },
];

const created = communitiesSeed.map((c) =>
  createCommunity({
    name: c.name,
    tagline: c.tagline,
    description: c.description,
    category: c.category,
    cover: c.cover,
    link: c.link,
    ownerId: c.owner.id,
  })
);

// Cross-memberships so member counts look alive.
join(demo.id, created[0].id);
join(demo.id, created[2].id);
join(leo.id, created[0].id);
join(sana.id, created[0].id);
join(aria.id, created[2].id);
join(aria.id, created[1].id);
join(demo.id, created[4].id);
join(leo.id, created[2].id);

// Some posts.
const p1 = createPost({ communityId: created[0].id, authorId: aria.id, title: "Welcome to CODESS Cafe ☕", body: "Introduce yourself below! What are you working on this week?" });
const p2 = createPost({ communityId: created[0].id, authorId: sana.id, title: "Mock interview slots open", body: "I have 3 mock interview slots this Friday. Drop a comment to grab one." });
const p3 = createPost({ communityId: created[2].id, authorId: sana.id, title: "Intro to pandas workshop", body: "Saturday 5pm UTC. We'll cover dataframes, filtering, and groupby with real datasets." });
const p4 = createPost({ communityId: created[1].id, authorId: leo.id, title: "New NGO project: food bank tracker", body: "Looking for 2 React devs and 1 backend dev. Comment if interested!" });

// Likes to make the feed feel active.
[demo, leo, sana].forEach((u) => likePost(p1.id, u.id));
[demo, aria].forEach((u) => likePost(p2.id, u.id));
[aria, leo, demo].forEach((u) => likePost(p3.id, u.id));
likePost(p4.id, aria.id);

// A few comments.
createComment({ postId: p1.id, authorId: demo.id, body: "Hi everyone! Frontend dev learning TypeScript this week. 👋" });
createComment({ postId: p1.id, authorId: leo.id, body: "Welcome! Ping me if you want to pair on anything." });
createComment({ postId: p2.id, authorId: demo.id, body: "I'd love a slot — Friday 3pm works for me!" });
createComment({ postId: p4.id, authorId: aria.id, body: "Count me in for the React work." });

console.log(`Seeded ${users.length} users, ${created.length} communities.`);
console.log("Login with demo@community4you.dev / demo1234");
