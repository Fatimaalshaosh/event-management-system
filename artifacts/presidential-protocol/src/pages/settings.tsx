import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Bell, Monitor } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Settings() {
  const { t } = useTranslation();
  return (
    <Layout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t("pages.settings.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("pages.settings.subtitle")}</p>
        </div>

        <div className="space-y-6">
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <Bell className="h-6 w-6 text-primary" />
              <div>
                <CardTitle className="text-lg">{t("pages.settings.notifications")}</CardTitle>
                <p className="text-sm text-muted-foreground">{t("pages.settings.notificationsDesc")}</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="push-notif" className="flex-1 cursor-pointer">{t("pages.settings.pushNotif")}</Label>
                <Switch id="push-notif" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="email-notif" className="flex-1 cursor-pointer">{t("pages.settings.emailNotif")}</Label>
                <Switch id="email-notif" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="sms-notif" className="flex-1 cursor-pointer">{t("pages.settings.smsNotif")}</Label>
                <Switch id="sms-notif" defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <Monitor className="h-6 w-6 text-primary" />
              <div>
                <CardTitle className="text-lg">{t("pages.settings.appearance")}</CardTitle>
                <p className="text-sm text-muted-foreground">{t("pages.settings.appearanceDesc")}</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="dark-mode" className="flex-1 cursor-pointer">{t("pages.settings.darkMode")}</Label>
                <Switch id="dark-mode" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="animations" className="flex-1 cursor-pointer">{t("pages.settings.reduceMotion")}</Label>
                <Switch id="animations" />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button variant="outline" className="rounded-full px-8">{t("common.cancel")}</Button>
            <Button className="rounded-full px-8">{t("pages.settings.saveChanges")}</Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
