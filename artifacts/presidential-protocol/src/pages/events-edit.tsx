import { Layout } from "@/components/layout";
import { useGetEvent, getGetEventQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useRoute } from "wouter";
import { useTranslation } from "react-i18next";
import { EventForm, toDateTimeLocal } from "@/components/events/event-form";

export default function EventsEdit() {
  const { t } = useTranslation();
  const [, params] = useRoute("/events/:id/edit");
  const eventId = parseInt(params?.id || "0", 10);

  const { data: event, isLoading } = useGetEvent(eventId, {
    query: { enabled: !!eventId, queryKey: getGetEventQueryKey(eventId) },
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-2xl ms-auto space-y-8 pb-12">
          <Skeleton className="h-12 w-1/2 ms-auto" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </Layout>
    );
  }

  if (!event) {
    return (
      <Layout>
        <div className="max-w-2xl ms-auto py-20 text-center text-sm text-muted-foreground">
          {t("pages.eventForm.loadError")}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <EventForm
        mode="edit"
        eventId={eventId}
        defaults={{
          nameAr: event.nameAr ?? "",
          name: event.name ?? "",
          date: toDateTimeLocal(event.date),
          locationAr: event.locationAr ?? "",
          location: event.location ?? "",
          status: event.status ?? "draft",
          eventType: event.eventType ?? "visitOfficial",
          priority: event.priority ?? "medium",
          vipLevel: event.vipLevel ?? "standard",
          countryAr: event.countryAr ?? "",
          country: event.country ?? "",
          notes: event.notes ?? "",
        }}
      />
    </Layout>
  );
}
