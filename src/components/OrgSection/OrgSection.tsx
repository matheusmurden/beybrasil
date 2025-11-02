import type { ReactNode } from "react";
import classes from "./OrgSection.module.css";

export const OrgSection = ({ children }: { children: ReactNode }) => {
  return <section className={classes.OrgSection}>{children}</section>;
};
