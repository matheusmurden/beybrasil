import { track } from "@vercel/analytics";
import classNames from "classnames";
import classes from "./SocialNetworkBadge.module.css";

type NetworkType =
  | "instagram"
  | "tiktok"
  | "whatsapp"
  | "youtube"
  | "externalLink";

interface SocialNetworkBadgeProps {
  name: string;
  acronym: string;
  networkType: NetworkType;
  networkValue: string;
}

export const SocialNetworkBadge: React.FC<SocialNetworkBadgeProps> = ({
  name,
  acronym,
  networkType,
  networkValue,
}) => {
  const imageUrl = new URL(`/icons/${networkType}.svg`, import.meta.url).href;
  return (
    <div className={classNames(classes.Badge, classes[networkType])}>
      <a
        target="_blank"
        rel="noreferer"
        href={
          networkType === "instagram"
            ? `https://www.instagram.com/${networkValue?.replace("@", "")}`
            : networkValue
        }
        onClick={
          import.meta.env.PROD
            ? () => {
                track(`Org ${networkType} Click`, {
                  org: acronym,
                  orgName: name,
                });
              }
            : undefined
        }
        className={classes.Link}
        title={`${networkType} - ${name}`}
      >
        <img
          loading="lazy"
          src={imageUrl}
          height="24"
          width="24"
          alt={`${networkType} - ${name}`}
        />
      </a>
    </div>
  );
};
