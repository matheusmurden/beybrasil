import { type RouteConfig, index } from "@react-router/dev/routes";

export default [
  index("./routes/Home/Home.tsx"),
  { path: "/league/:acronym", file: "./routes/League/League.tsx" },
  { path: "/oauth", file: "./routes/OAuth/OAuth.tsx" },
  { path: "/login", file: "./routes/Login/Login.tsx" },
  { path: "/logout", file: "./routes/Logout/Logout.tsx" },
] satisfies RouteConfig;
