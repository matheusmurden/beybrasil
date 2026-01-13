import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("./routes/Home/Home.tsx"),
  route("league/:acronym", "./routes/League/League.tsx", [
    route("ranking", "./routes/LeagueRanking/LeagueRanking.tsx"),
    route("tournament/:tournamentSlug", "./routes/Tournament/Tournament.tsx"),
  ]),
  { path: "/oauth", file: "./routes/OAuth/OAuth.tsx" },
  { path: "/login", file: "./routes/Login/Login.tsx" },
  { path: "/logout", file: "./routes/Logout/Logout.tsx" },
] satisfies RouteConfig;
