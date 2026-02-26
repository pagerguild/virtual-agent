import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/sign-out-button";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Settings</h1>
        <SignOutButton />
      </div>

      {/* User Info */}
      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Account</h2>
        <div className="mt-4 space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-500">Email</label>
            <p className="mt-1 text-gray-900" data-testid="user-email">
              {user?.email ?? "Not available"}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">User ID</label>
            <p className="mt-1 font-mono text-sm text-gray-600">
              {user?.id ?? "Not available"}
            </p>
          </div>
          {user?.created_at && (
            <div>
              <label className="text-sm font-medium text-gray-500">
                Account Created
              </label>
              <p className="mt-1 text-gray-600">
                {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Placeholder for future settings */}
      <section className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6">
        <h2 className="text-lg font-semibold text-gray-400">
          More Settings Coming Soon
        </h2>
        <p className="mt-2 text-sm text-gray-400">
          Additional settings like notification preferences, artist profile
          management, and billing will be added in future updates.
        </p>
      </section>
    </div>
  );
}
