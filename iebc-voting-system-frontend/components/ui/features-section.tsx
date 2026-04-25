'use client';

export function FeaturesSection() {
  return (
    <section className="mt-12 grid gap-6 lg:grid-cols-3">
      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Built for Kenya</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Designed to support secure voter registration and biometric verification with local election needs in mind.
        </p>
      </div>
      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Modern UX</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Clear navigation, actionable buttons and a polished layout improve usability for voters and administrators.
        </p>
      </div>
      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Secure workflows</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Biometric onboarding, role-based access, and election transparency help build trust across the voting process.
        </p>
      </div>
    </section>
  );
}
