import { db } from "@/lib/db";
import { requireRole, CITIES, INSTITUTION_TYPES } from "@/lib/cover";
import { saveInstitution } from "../actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Institution - AHK Cover Network" };

export default async function InstitutionSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireRole("HEAD_TEACHER");
  const { error } = await searchParams;
  const institution = await db.institution.findFirst({ where: { ownerId: user.id } });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {institution ? "Institution details" : "Set up your institution"}
        </h1>
        <p className="mt-1 text-gray-500">
          Teachers see these details when they apply. Your phone is only shared with the teacher you confirm.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={saveInstitution} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Institution name</label>
              <Input name="name" required defaultValue={institution?.name} placeholder="e.g. Kadıköy English Academy" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Type</label>
                <Select name="type" defaultValue={institution?.type ?? "LANGUAGE_COURSE"}>
                  {Object.entries(INSTITUTION_TYPES).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Phone</label>
                <Input name="phone" type="tel" defaultValue={institution?.phone ?? ""} placeholder="+90 5xx xxx xx xx" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">City</label>
                <Select name="city" required defaultValue={institution?.city ?? "İstanbul"}>
                  {CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">District</label>
                <Input name="district" defaultValue={institution?.district ?? ""} placeholder="e.g. Kadıköy" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Address</label>
              <Input name="address" defaultValue={institution?.address ?? ""} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Website</label>
              <Input name="website" type="url" defaultValue={institution?.website ?? ""} placeholder="https://" />
            </div>
            <Button type="submit">{institution ? "Save" : "Continue"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
