import { Layout } from "@/components/layout";
import { EventForm } from "@/components/events/event-form";

export default function EventsNew() {
  return (
    <Layout>
      <EventForm
        mode="create"
        defaults={{
          nameAr: "",
          name: "",
          date: "",
          locationAr: "",
          location: "",
          status: "draft",
          eventType: "visitOfficial",
          priority: "medium",
          vipLevel: "standard",
          countryAr: "",
          country: "",
          notes: "",
        }}
      />
    </Layout>
  );
}
