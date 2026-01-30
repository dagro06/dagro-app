import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Inbox,
  CheckSquare,
  Zap,
  Link2,
  ArrowRight,
  MessageSquare,
  Mail,
  FileText,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">Dagro</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold tracking-tight mb-6">
          Your Unified
          <br />
          <span className="text-primary">Productivity Hub</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          All your messages, tasks, and files from Slack, Outlook, Notion, and
          more in one place. Powered by AI to help you stay organized.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/signup">
            <Button size="lg" className="gap-2">
              Start Free <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="#features">
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </Link>
        </div>
      </section>

      {/* Integration logos */}
      <section className="container mx-auto px-4 py-12">
        <p className="text-center text-sm text-muted-foreground mb-6">
          INTEGRATES WITH YOUR FAVORITE TOOLS
        </p>
        <div className="flex items-center justify-center gap-8 flex-wrap">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MessageSquare className="w-6 h-6" />
            <span className="font-medium">Slack</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="w-6 h-6" />
            <span className="font-medium">Outlook</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <FileText className="w-6 h-6" />
            <span className="font-medium">Notion</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <CheckSquare className="w-6 h-6" />
            <span className="font-medium">ClickUp</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Everything You Need
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl border p-6 shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Inbox className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Unified Inbox</h3>
            <p className="text-muted-foreground">
              All your messages from Slack, Outlook, and more in one
              chronological feed. Never miss an important message again.
            </p>
          </div>
          <div className="bg-white rounded-xl border p-6 shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <CheckSquare className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Smart Task Management</h3>
            <p className="text-muted-foreground">
              AI automatically extracts action items from your messages and
              creates tasks. Stay on top of everything effortlessly.
            </p>
          </div>
          <div className="bg-white rounded-xl border p-6 shadow-sm">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Link2 className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Deep Integrations</h3>
            <p className="text-muted-foreground">
              Connect ClickUp, Notion, Google Drive, and more. Sync tasks
              bidirectionally and access files from anywhere.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-primary rounded-2xl p-12 text-center text-primary-foreground">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
            Join thousands of professionals who have simplified their workflow
            with Dagro.
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="gap-2">
              Create Free Account <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">Dagro</span>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Dagro. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
