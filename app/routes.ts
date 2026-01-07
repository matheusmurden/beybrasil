import { type RouteConfig, index } from "@react-router/dev/routes";

export default [
  index("./App.tsx"),
  { path: "/oauth", file: "./oauth.tsx" },
] satisfies RouteConfig;
