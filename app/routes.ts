import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  index("./routes/Home/Home.tsx"),
  // REQUIRED AUTH
  layout("./layouts/AuthGuardLayout.tsx", [
    // LEAGUE
    layout("./layouts/LeagueLayout.tsx", [
      route("league/:acronym", "./routes/League/League.tsx", [
        // LEAGUE RANKING
        route("ranking", "./routes/LeagueRanking/LeagueRanking.tsx"),
        // TOURNAMENT DETAILS
        route(
          "tournament/:tournamentSlug",
          "./routes/Tournament/Tournament.tsx",
        ),
      ]),
      // API
      route("/api/user", "./routes/api/User.tsx"),
    ]),
  ]),
  // AUTH MANAGEMENT
  route("/oauth", "./routes/OAuth/OAuth.tsx"),
  route("/login", "./routes/Login/Login.tsx"),
  route("/logout", "./routes/Logout/Logout.tsx"),
] satisfies RouteConfig;
