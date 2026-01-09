import { getRowArrValues } from "../../utils";
import classes from "./OrgSection.module.css";
import { SocialNetworkBadge } from "../SocialNetworkBadge";
import manualContent from "~/assets/manualContent.json" with { type: "json" };
import { useMemo } from "react";
import { Button } from "@mantine/core";
import { useNavigate } from "react-router";

export interface OrgSectionProps {
  acronym: string;
  name: string;
  region?: string;
  states?: string[];
  cities?: string[];
  instagram?: string;
  whatsapp?: string;
  youtube?: string;
  tiktok?: string;
  externalLinks?: string;
}

export const OrgSection: React.FC<OrgSectionProps> = (props) => {
  const leagueData = useMemo(() => {
    const data =
      manualContent?.[
        props.acronym.toLowerCase() as keyof typeof manualContent
      ];
    if (data?.["league" as keyof typeof data]) {
      return data;
    }
    return undefined;
  }, [props.acronym]);

  const navigate = useNavigate();

  return (
    <section className={classes.OrgSection}>
      <div>
        <h1>{props.acronym}</h1>
        <h2>{props.name}</h2>
      </div>
      <div>
        <p>{props.region}</p>
        <p>Estado(s): {getRowArrValues(props.states ?? [])}</p>
        <p>Cidade(s): {getRowArrValues(props.cities ?? [])}</p>
        <div className={classes.SocialNetworks}>
          {!!props.instagram && (
            <SocialNetworkBadge
              name={props.name}
              acronym={props.acronym}
              networkType="instagram"
              networkValue={props.instagram}
            />
          )}
          {!!props.whatsapp && (
            <SocialNetworkBadge
              name={props.name}
              acronym={props.acronym}
              networkType="whatsapp"
              networkValue={props.whatsapp}
            />
          )}
          {!!props.tiktok && (
            <SocialNetworkBadge
              name={props.name}
              acronym={props.acronym}
              networkType="tiktok"
              networkValue={props.tiktok}
            />
          )}
          {!!props.youtube && (
            <SocialNetworkBadge
              name={props.name}
              acronym={props.acronym}
              networkType="youtube"
              networkValue={props.youtube}
            />
          )}
          {!!props.externalLinks && (
            <SocialNetworkBadge
              name={props.name}
              acronym={props.acronym}
              networkType="externalLink"
              networkValue={props.externalLinks}
            />
          )}
        </div>
      </div>
      {!!leagueData && (
        <Button
          className="mt-4"
          onClick={() => navigate(`/league/${props.acronym.toLowerCase()}`)}
        >
          Ver Página no BeyBrasil
        </Button>
      )}
    </section>
  );
};
