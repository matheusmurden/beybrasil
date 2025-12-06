import { getRowArrValues } from "../../utils";
import classes from "./OrgSection.module.css";
import { SocialNetworkBadge } from "../SocialNetworkBadge";

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
    </section>
  );
};
