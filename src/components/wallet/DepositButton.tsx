"use client";

import Image from "next/image";

interface DepositButtonProp {
  onDeposit: () => void;
}

function DepositButton({ onDeposit }: DepositButtonProp) {
  return (
    <div
      className="w-[30rem] cursor-pointer h-[2.25rem] mt-[0.75rem] flex justify-center items-center gap-2 text-white font-bold text-[0.9375rem] bg-[#149A9B] rounded-[1.5rem]"
      onClick={() => onDeposit()}
    >
      <Image
        src="/deposit.svg"
        alt="deposit"
        width={18}
        height={14}
        className="w-[1.125rem] h-[0.875rem]"
      />
      Deposit
    </div>
  );
}

export default DepositButton;
