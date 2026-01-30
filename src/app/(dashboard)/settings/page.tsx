"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IntegrationCard } from "@/components/settings/integration-card";
import { ProfileSettings } from "@/components/settings/profile-settings";
import { IntegrationStatus, IntegrationProvider } from "@/types";

const integrations: Array<{
  provider: IntegrationProvider;
  name: string;
  description: string;
  icon: string;
  color: string;
}> = [
  {
    provider: "clickup",
    name: "ClickUp",
    description: "Sync tasks with your ClickUp workspace",
    icon: "CheckSquare",
    color: "#7B68EE",
  },
  {
    provider: "slack",
    name: "Slack",
    description: "Import messages from Slack channels",
    icon: "MessageSquare",
    color: "#4A154B",
  },
  {
    provider: "outlook",
    name: "Outlook",
    description: "Connect your Microsoft Outlook email",
    icon: "Mail",
    color: "#0078D4",
  },
  {
    provider: "notion",
    name: "Notion",
    description: "Access your Notion pages and databases",
    icon: "FileText",
    color: "#000000",
  },
  {
    provider: "gdrive",
    name: "Google Drive",
    description: "Browse and access your Google Drive files",
    icon: "HardDrive",
    color: "#4285F4",
  },
];

export default function SettingsPage() {
  const { data: session } = useSession();
  const [integrationStatuses, setIntegrationStatuses] = useState<
    IntegrationStatus[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIntegrationStatuses();
  }, []);

  const fetchIntegrationStatuses = async () => {
    try {
      const response = await fetch("/api/integrations/status");
      if (response.ok) {
        const data = await response.json();
        setIntegrationStatuses(data.integrations);
      }
    } catch (error) {
      console.error("Failed to fetch integration statuses:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatus = (provider: IntegrationProvider): IntegrationStatus => {
    return (
      integrationStatuses.find((s) => s.provider === provider) || {
        provider,
        isConnected: false,
      }
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Settings</h1>

      <Tabs defaultValue="integrations">
        <TabsList className="mb-6">
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations">
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Connect your accounts to start syncing messages and tasks.
            </p>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="grid gap-4">
                {integrations.map((integration) => (
                  <IntegrationCard
                    key={integration.provider}
                    provider={integration.provider}
                    name={integration.name}
                    description={integration.description}
                    icon={integration.icon}
                    color={integration.color}
                    status={getStatus(integration.provider)}
                    onStatusChange={fetchIntegrationStatuses}
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="profile">
          <ProfileSettings user={session?.user} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
