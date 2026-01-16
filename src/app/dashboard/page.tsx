import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { ContentGrid } from "@/components/dashboard/ContentGrid";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

async function DashboardContent() {
  const session = await auth.api.getSession({ headers: await headers() });
  const userName = session?.user?.email?.split("@")[0] || "User";

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader
        title={`Welcome back, ${userName}!`}
        subtitle="Here's what's happening with your AI content today"
      />

      <div className="flex-1 p-4 md:p-6 space-y-6 md:space-y-8 overflow-y-auto dashboard-scrollbar">
        {/* Stats Overview */}
        <section>
          <StatsCards />
        </section>

        {/* Quick Actions and Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-6 lg:gap-8">
          {/* Left Column - Quick Actions */}
          <div className="lg:col-span-3 xl:col-span-4">
            <section>
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <QuickActions />
            </section>
          </div>

          {/* Right Column - Activity Feed */}
          <div className="lg:col-span-1">
            <section>
              <RecentActivity />
            </section>
          </div>
        </div>

        {/* Full Width Recent Content Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Recent Content</h2>
            <button className="text-sm text-primary hover:underline transition-colors">
              View all
            </button>
          </div>
          <ContentGrid />
        </section>
      </div>
    </div>
  );
}
