import { createRoot } from "react-dom/client";
import { useEffect, useReducer, useState } from "react";
import { eventReducer } from "./Reducer/EventReducer";
import { MonthViewCalendar } from "./Components/MonthViewCalendar";
import { Header } from "./Components/Header";
import { WeekViewCalendar } from "./Components/WeekViewCalendar";
import { Modal } from "./Components/Modal";
import { Form, FormData } from "./Components/Form";
import { calendarAPI } from "./Helpers/calendarAPI";
import type { Event } from "./Helpers/createCalendarAPI";
import { Spinner } from "./Components/Spinner";

export interface OnClickFormData {
  date?: string;
  start?: string;
  end?: string;
}

export function App({ initialEvents }: { initialEvents: Event[] }) {
  const [calendarState, dispatchCalendarActions] = useReducer(eventReducer, {
    today: new Date(),
    activeDay: new Date(),
    events: initialEvents,
    isLoading: false,
    isError: false,
  });

  const [formModalState, setFormModalState] = useState<
    OnClickFormData | undefined
  >();

  const onSave = (formValues: FormData) => {
    calendarAPI
      .createEvent(formValues)
      .then((event) => {
        dispatchCalendarActions({
          type: "SAVE_EVENT_SUCCESS",
          payload: event,
        });
        setFormModalState(undefined);
      })
      .catch(() => {
        // return dispatchCalendarActions({ type: "SAVE_EVENT_FAILURE" });
        return "calendarAPI.createEvent error";
      });
  };

  const onTimeClick = (onClickFormData: OnClickFormData) => {
    setFormModalState(onClickFormData);
  };

  const handleEventDelete = (id: number) => {
    calendarAPI
      .deleteEvent(id)
      .then(() => {
        dispatchCalendarActions({
          type: "DELETE_EVENT",
          payload: id,
        });
      })
      .catch((error) => {
        console.error("Error deleting event:", error);
      });
  };

  return (
    <>
      <Header
        onTodayClick={() => dispatchCalendarActions({ type: "TODAY" })}
        onPrevClick={() => dispatchCalendarActions({ type: "BACK_WEEK" })}
        onNextClick={() => dispatchCalendarActions({ type: "NEXT_WEEK" })}
        activeDay={calendarState.activeDay}
      />

      <main className="main-wrapper">
        <aside className="side-wrapper">
          <button
            className="open-event-modal button oval"
            onClick={() => {
              setFormModalState({});
            }}
          >
            <img src="./assets/svg/add.svg" alt="Google add icon." />
            Create
          </button>
          {formModalState && (
            <Modal
              onClose={() => {
                setFormModalState(undefined);
              }}
            >
              <Form onSave={onSave} initFormData={formModalState} />
            </Modal>
          )}

          <MonthViewCalendar
            onPrevClick={() => dispatchCalendarActions({ type: "BACK_MONTH" })}
            onNextClick={() => dispatchCalendarActions({ type: "NEXT_MONTH" })}
            onDayClick={(date: Date) =>
              dispatchCalendarActions({
                type: "CLICKED_ACTIVE_DAY",
                payload: date,
              })
            }
            activeDay={calendarState.activeDay}
          />
        </aside>

        <WeekViewCalendar
          onTimeClick={onTimeClick}
          onDayClick={(date: Date) =>
            dispatchCalendarActions({
              type: "CLICKED_ACTIVE_DAY",
              payload: date,
            })
          }
          today={calendarState.today}
          handleEventDelete={handleEventDelete}
          activeDay={calendarState.activeDay}
          events={calendarState.events}
        />
      </main>
    </>
  );
}

const Root = () => {
  const [events, setEvents] = useState<undefined | Event[]>(undefined);

  //try to use query for this code

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    calendarAPI
      .listEvents()
      .then((events) => {
        setEvents(events);
      })
      .catch(() => {
        throw new Error("Error fetching events");
      });
  }, []);

  return events ? <App initialEvents={events} /> : <Spinner />;
};

const container = document.getElementById("root");
if (!container) {
  throw new Error("no container to render to");
}

const root = createRoot(container);
root.render(<Root />);
