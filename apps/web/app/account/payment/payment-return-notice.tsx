type PaymentReturnStatus = "cancel" | "error" | "failure" | "success";

export function PaymentReturnNotice({
  context = "default",
  status
}: {
  context?: "catcare" | "default";
  status?: string;
}) {
  const normalizedStatus = normalizePaymentReturnStatus(status);

  if (!normalizedStatus) {
    return null;
  }

  const copy = getPaymentReturnCopy(normalizedStatus, context);

  return (
    <section className={`rounded-2xl border p-4 ${copy.className}`}>
      <p className="text-sm font-semibold">{copy.title}</p>
      <p className="mt-1 text-sm font-semibold leading-6">{copy.description}</p>
    </section>
  );
}

function normalizePaymentReturnStatus(
  status?: string
): PaymentReturnStatus | null {
  if (
    status === "cancel" ||
    status === "error" ||
    status === "failure" ||
    status === "success"
  ) {
    return status;
  }

  return null;
}

function getPaymentReturnCopy(
  status: PaymentReturnStatus,
  context: "catcare" | "default"
) {
  if (status === "success") {
    return {
      className: "border-[#bfe5d7] bg-[#f2fbf8] text-[#07847f]",
      description:
        context === "catcare"
          ? "智能照护次数已更新，可以继续生成清单或复盘。"
          : "套餐权益已更新，可以继续操作。",
      title: "支付成功"
    };
  }

  if (status === "cancel") {
    return {
      className: "border-[#d9e0ea] bg-white text-[#526177]",
      description: "你已取消支付，当前套餐和智能照护次数没有变化。",
      title: "支付已取消"
    };
  }

  return {
    className: "border-[#f0c9c2] bg-[#fff4f2] text-[#b33a2f]",
    description: "支付没有完成，当前套餐和智能照护次数没有变化。",
    title: "支付未完成"
  };
}
