import { getSession } from "~/sessions.server";
import manualContent from "~/assets/manualContent.json" with { type: "json" };
import { redirect } from "react-router";
import type { Route } from "./+types/Tournament";
import { useNavContext } from "~/contexts";
import { useEffect } from "react";
import type { TournamentObj } from "~/types";

export async function loader({ request, params }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("startgg:token");
  const allValidLeagueSlugs = Object.entries(manualContent).filter(([, val]) =>
    Object.hasOwn(val, "league"),
  );
  if (!token) {
    return redirect("/login");
  }
  if (
    !allValidLeagueSlugs.some(([key]) => key === params.acronym.toLowerCase())
  ) {
    return redirect("/404");
  }

  try {
    const response = await fetch("https://api.start.gg/gql/alpha", {
      method: "POST",
      body: JSON.stringify({
        query: `{
          tournament(slug: "${params?.tournamentSlug}") {
            id
            name
            slug
            startAt
            state
            isRegistrationOpen
            eventRegistrationClosesAt
            unpaidParticipants: participants(query: {
              perPage: 512,
              filter: {
                unpaid: true
              }
            }) {
              nodes {
                gamerTag
                user {
                  id
                }
              }
            }
            paidParticipants: participants(query: {
              perPage: 512,
              filter: {
                unpaid: false
              }
            }) {
              nodes {
                gamerTag
                user {
                  id
                }
              }
            }
            allParticipants: participants(query: {
              perPage: 512,
            }) {
              nodes {
                gamerTag
                user {
                  id
                }
              }
            }
            events(limit: 20) {
              id
              slug
              name
              numEntrants
              state
              startAt
              images {
                id
                url
                type
              }
              userEntrant {
                standing {
                  placement
                }
              }
            }
          }
        }`,
      }),
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const tournamentData: {
      data: {
        tournament: TournamentObj;
      };
    } = await response.json();
    return {
      tournamentData: tournamentData?.data,
    };
  } catch (e) {
    console.log(e);
  }
}

export default function Tournament({ loaderData }: Route.ComponentProps) {
  const { setNavTitle } = useNavContext();

  useEffect(() => {
    if (loaderData?.tournamentData?.tournament?.name) {
      console.log(loaderData?.tournamentData);
      setNavTitle(loaderData?.tournamentData?.tournament?.name);
    }
    return () => {
      setNavTitle("");
    };
  }, [loaderData, setNavTitle]);

  return (
    <div className="w-full pt-24">
      <p>Em Construção</p>
    </div>
  );
}
