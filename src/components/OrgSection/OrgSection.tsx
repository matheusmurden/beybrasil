import { track } from "@vercel/analytics";
import { getRowArrValues } from "../../utils";
import classes from "./OrgSection.module.css";

export interface OrgSectionProps {
  acronym: string;
  name: string;
  region?: string;
  states?: string[];
  cities?: string[];
  instagram?: string[];
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
        {!!props.instagram?.[1] && (
          <p>
            <a
              target="_blank"
              rel="noreferer"
              href={props.instagram?.[1]}
              onClick={
                import.meta.env.PROD
                  ? () => {
                      track("Org Instagram Click", {
                        org: props.acronym,
                        orgName: props.name,
                      });
                    }
                  : undefined
              }
            >
              {props.instagram?.[0] ?? ""}
            </a>
          </p>
        )}
      </div>
    </section>
  );
};
