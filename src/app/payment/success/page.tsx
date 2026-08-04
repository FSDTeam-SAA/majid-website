import Link from "next/link";

export const metadata = {
  title: "Payment received | Majid",
};

export default function PaymentSuccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface p-6">
      <section className="w-full max-w-lg rounded-[32px] border border-border bg-card p-8 text-center shadow-xl sm:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#DCFCE7] text-3xl text-[#166534]">
          ✓
        </div>
        <h1 className="mt-6 text-3xl font-black text-foreground">
          Payment received
        </h1>
        <p className="mt-3 text-sm font-medium leading-6 text-muted-foreground">
          myPOS has returned you to Majid. Your balance will update once the
          secure payment confirmation is processed.
        </p>
        <Link
          href="/shopkeeper/payment/history"
          className="mt-8 inline-flex rounded-2xl bg-[#84CC16] px-6 py-3 text-sm font-black text-white transition hover:bg-[#76b813]"
        >
          View payment history
        </Link>
      </section>
    </main>
  );
}
