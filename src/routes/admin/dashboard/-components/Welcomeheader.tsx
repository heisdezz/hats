import { pb } from "#/client/pb";
import { ClientOnly } from "@tanstack/react-router";
import { createClientOnlyFn, createIsomorphicFn } from "@tanstack/react-start";
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
};

const get_today = createIsomorphicFn().client(() => {
  return new Date().toLocaleDateString(undefined, DATE_FORMAT);
});

export default function WelcomeHeader() {
  const email = pb.authStore.record?.email as string | undefined;
  const name = email?.split("@")[0];
  const today = get_today();

  return (
    <div className="mx-6 mt-6 rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-primary-content px-8 py-7 flex items-center justify-between gap-4 shadow-md">
      <div className="flex flex-col gap-1">
        {/*<p className="text-sm font-medium opacity-80">{today}</p>*/}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {getGreeting()}
          <ClientOnly>{name ? `, ${name}` : ""} 👋</ClientOnly>
        </h1>
        <p className="text-sm opacity-70 mt-0.5">
          Here's what's happening in your store today.
        </p>
      </div>
      <div className="hidden sm:flex flex-col items-end gap-1 shrink-0 opacity-80">
        <div className="text-5xl font-black tabular-nums">
          <ClientOnly>
            {new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </ClientOnly>
        </div>
      </div>
    </div>
  );
}
