import { gql } from "@apollo/client";

export const LeagueQuery = gql(`
    query LeagueQuery($slug: String!) {
        league(slug: $slug) {
            id
            name
        }
    }
`);
