import { Accordion } from "@mantine/core";
import { sortEventSetsByIdentifier } from "~/helpers";
import { type EventObj } from "~/types";
import { EventSetCard } from "./EventSetCard";

export const EventPhases = ({
  event,
  isReportView = false,
}: {
  event?: EventObj;
  isReportView?: boolean;
}) => {
  if (!event) {
    return;
  }

  const phases = event?.phases;

  return (
    <section className="grid">
      {phases?.map((phase) => {
        const sets = sortEventSetsByIdentifier({
          sets: phase?.sets?.nodes ?? [],
        }).toReversed();
        return (
          <Accordion defaultValue={String(phases?.[0]?.id)} key={phase.id}>
            <Accordion.Item value={String(phase.id)}>
              <Accordion.Control
                className="dark:text-gray-100 dark:bg-neutral-600 dark:hover:bg-neutral-500"
                value={String(phase.id)}
              >
                {phase.name}
              </Accordion.Control>
              <Accordion.Panel>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {sets.map(
                    (set) =>
                      !!set?.id && (
                        <EventSetCard
                          isReportView={isReportView}
                          key={set?.id}
                          set={set}
                          event={event}
                        />
                      ),
                  )}
                </div>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        );
      })}
    </section>
  );
};
