import { Suspense } from "react";
import PaymentContent from "./PaymentContent";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentContent />
    </Suspense>
  );
}