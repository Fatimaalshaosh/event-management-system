import { useEffect } from "react";
import { useListContacts } from "@workspace/api-client-react";
import { setPeopleSource } from "@/lib/identity";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { FloatingAiDock } from "@/ai/floating-dock";

export function Layout({
  children,
  wide = false,
}: {
  children: React.ReactNode;
  /* When true the content stretches across the full available workspace width
   * (no centered max-width cap). Used by the dashboard so its 12-column grid
   * fills the whole area instead of sitting in a narrow centered column. */
  wide?: boolean;
}) {
  // Publish Contacts as the canonical person source once loaded, so every
  // identity surface (Mission Engine, Collaboration Hub, avatars, …) resolves
  // real people from Contacts. One fetch, deduped by React Query.
  const { data: contacts } = useListContacts();
  useEffect(() => {
    if (contacts) setPeopleSource(contacts);
  }, [contacts]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col w-full font-sans antialiased overflow-x-hidden selection:bg-primary selection:text-primary-foreground">
      <Sidebar />
      {/* ms-16 = margin-inline-start = margin-right in RTL, clearing the right-side sidebar */}
      <div className="flex-1 flex flex-col min-w-0 ms-16">
        <Topbar />
        <main
          className={`flex-1 p-8 w-full animate-in fade-in duration-500 ${
            wide ? "" : "max-w-7xl mx-auto"
          }`}
        >
          {children}
        </main>
      </div>
      {/* Global Executive AI — present on every Layout-wrapped (private) page */}
      <FloatingAiDock />
    </div>
  );
}
