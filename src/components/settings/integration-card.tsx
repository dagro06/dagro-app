"use client";

import { useState } from "react";
import { IntegrationProvider, IntegrationStatus } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  CheckSquare,
  MessageSquare,
  Mail,
  FileText,
  HardDrive,
  Check,
  X,
  Loader2,
  ExternalLink,
} from "lucide-react";

interface IntegrationCardProps {
  provider: IntegrationProvider;
  name: string;
  description: string;
  icon: string;
  color: string;
  status: IntegrationStatus;
  onStatusChange: () => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  CheckSquare,
  MessageSquare,
  Mail,
  FileText,
  HardDrive,
};

export function IntegrationCard({
  provider,
  name,
  description,
  icon,
  color,
  status,
  onStatusChange,
}: IntegrationCardProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const Icon = iconMap[icon] || CheckSquare;

  const handleConnect = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/integrations/${provider}/auth-url`);
      if (!response.ok) {
        throw new Error("Failed to get auth URL");
      }

      const data = await response.json();
      window.location.href = data.url;
    } catch {
      toast({
        title: "Error",
        description: "Failed to initiate connection. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/integrations/${provider}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to disconnect");
      }

      toast({
        title: "Disconnected",
        description: `${name} has been disconnected.`,
      });

      onStatusChange();
    } catch {
      toast({
        title: "Error",
        description: "Failed to disconnect. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: color + "20" }}
            >
              <Icon className="w-6 h-6" style={{ color }} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium">{name}</h3>
                {status.isConnected ? (
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    <Check className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                    <X className="w-3 h-3 mr-1" />
                    Not connected
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{description}</p>
              {status.isConnected && status.accountName && (
                <p className="text-sm text-muted-foreground mt-1">
                  Connected as: {status.accountName}
                </p>
              )}
              {status.lastSync && (
                <p className="text-xs text-muted-foreground mt-1">
                  Last synced: {new Date(status.lastSync).toLocaleString()}
                </p>
              )}
              {status.error && (
                <p className="text-xs text-red-500 mt-1">{status.error}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {status.isConnected ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnect}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Disconnect"
                )}
              </Button>
            ) : (
              <Button size="sm" onClick={handleConnect} disabled={loading}>
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <ExternalLink className="w-4 h-4 mr-2" />
                )}
                Connect
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
