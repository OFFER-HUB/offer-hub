interface WalletBalanceProp {
  walletBalance: number;
  percentageMovement: number;
  movementType: "up" | "down" | "neutral";
}

function WalletBalance({
  walletBalance,
  percentageMovement,
  movementType,
}: WalletBalanceProp) {
  return (
    <div className="border-[2px] border-[#149A9B] w-[30rem] h-[7.44rem] rounded-[0.4375rem] text-center flex flex-col items-center justify-center gap-[0.5rem]">
      <p className="text-[#424242] text-[2rem] font-bold">${walletBalance}</p>
      <p
        className={`${
          movementType === "up"
            ? "text-[#3ACC6C]"
            : movementType === "down"
            ? "text-[#FF1212]"
            : "text-[#42424299]"
        } text-[1.125rem] font-medium`}
      >
        {movementType === "up" ? "+" : movementType === "down" ? "-" : ""}
        {percentageMovement}%
      </p>
    </div>
  );
}

export default WalletBalance;
