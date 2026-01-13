import { gql } from "@apollo/client";

export const BasicUserQuery = gql(`
    query BasicUserQuery {
        currentUser {
            id
            name
            genderPronoun
            player {
                prefix
                gamerTag
            }
            images(type: "profile") {
                url
                type
            }
        }
    }
`);
