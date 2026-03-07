import { Accordion } from "@mantine/core";
import { sortEventSetsByIdentifier } from "~/helpers";
import { type EventObj } from "~/types";
import { EventSetCard } from "./EventSetCard";

export const EventPhases = ({ event }: { event: EventObj }) => {
  return (
    <section className="grid">
      {event?.phases?.map((phase) => {
        const sets = sortEventSetsByIdentifier({ sets: phase.sets.nodes });
        return (
          <Accordion
            defaultValue={String(event?.phases?.[0]?.id)}
            key={phase.id}
          >
            <Accordion.Item value={String(phase.id)}>
              <Accordion.Control
                className="dark:text-gray-100 dark:hover:bg-neutral-500"
                value={String(phase.id)}
              >
                {phase.name}
              </Accordion.Control>
              <Accordion.Panel>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                  {sets.map((set) => (
                    <EventSetCard key={set.id} set={set} event={event} />
                  ))}
                </div>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        );
      })}
    </section>
  );
};
