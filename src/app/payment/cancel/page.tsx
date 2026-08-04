import Link from "next/link";

export const metadata = {
  title: "Payment cancelled | Majid",
};

export default function PaymentCancelPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface p-6">
      <section className="w-full max-w-lg rounded-[32px] border border-border bg-card p-8 text-center shadow-xl sm:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FEF9C3] text-3xl text-[#854D0E]">
          !
        </div>
        <h1 className="mt-6 text-3xl font-black text-foreground">
          Payment cancelled
        </h1>
        <p className="mt-3 text-sm font-medium leading-6 text-muted-foreground">
          No payment has been confirmed. You can return to your pricing plan and
          try again whenever you are ready.
        </p>
        <Link
          href="/shopkeeper/pricing"
          className="mt-8 inline-flex rounded-2xl bg-[#84CC16] px-6 py-3 text-sm font-black text-white transition hover:bg-[#76b813]"
        >
          Return to pricing
        </Link>
      </section>
    </main>
  );
}
