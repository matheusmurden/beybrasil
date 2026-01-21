import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  // BASE
  index("./routes/Home/Home.tsx"),
  route("league/:acronym", "./routes/League/League.tsx", [
    route("ranking", "./routes/LeagueRanking/LeagueRanking.tsx"),
    route("tournament/:tournamentSlug", "./routes/Tournament/Tournament.tsx"),
  ]),
  // AUTH
  { path: "/oauth", file: "./routes/OAuth/OAuth.tsx" },
  { path: "/login", file: "./routes/Login/Login.tsx" },
  { path: "/logout", file: "./routes/Logout/Logout.tsx" },
  // API
  { path: "/api/user", file: "./routes/api/User.tsx" },
] satisfies RouteConfig;
