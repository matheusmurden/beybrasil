import { track } from "@vercel/analytics";
import { getRowArrValues } from "../../utils";
import classes from "./OrgSection.module.css";

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
        <div style={{ display: "flex", flexDirection: "row", gap: "0.6rem" }}>
          {!!props.instagram && (
            <p>
              <a
                target="_blank"
                rel="noreferer"
                href={`https://www.instagram.com/${props.instagram?.replace("@", "")}`}
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
                {props.instagram}
              </a>
            </p>
          )}
          {!!props.whatsapp && (
            <p>
              <a
                target="_blank"
                rel="noreferer"
                href={props.whatsapp}
                onClick={
                  import.meta.env.PROD
                    ? () => {
                        track("Org WhatsApp Click", {
                          org: props.acronym,
                          orgName: props.name,
                        });
                      }
                    : undefined
                }
              >
                WhatsApp
              </a>
            </p>
          )}
          {!!props.tiktok && (
            <p>
              <a
                target="_blank"
                rel="noreferer"
                href={props.tiktok}
                onClick={
                  import.meta.env.PROD
                    ? () => {
                        track("Org TikTok Click", {
                          org: props.acronym,
                          orgName: props.name,
                        });
                      }
                    : undefined
                }
              >
                TikTok
              </a>
            </p>
          )}
          {!!props.youtube && (
            <p>
              <a
                target="_blank"
                rel="noreferer"
                href={props.youtube}
                onClick={
                  import.meta.env.PROD
                    ? () => {
                        track("Org YouTube Click", {
                          org: props.acronym,
                          orgName: props.name,
                        });
                      }
                    : undefined
                }
              >
                YouTube
              </a>
            </p>
          )}
          {!!props.externalLinks && (
            <p>
              <a
                target="_blank"
                rel="noreferer"
                href={props.externalLinks}
                onClick={
                  import.meta.env.PROD
                    ? () => {
                        track("Org LinkTree Click", {
                          org: props.acronym,
                          orgName: props.name,
                        });
                      }
                    : undefined
                }
              >
                LinkTree
              </a>
            </p>
          )}
        </div>
      </div>
    </section>
  );
};
