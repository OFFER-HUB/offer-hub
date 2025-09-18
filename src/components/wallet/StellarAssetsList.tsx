import Image from "next/image";

export interface AssetProps {
  id: string;
  assetName: string;
  assetImage: string;
  assetAbrv: string;
  assetBalance: number;
  assetInDollar: number;
  percentageMovement: number;
  movementType: "up" | "down" | "neutral";
}

interface StellarAssetList {
  assets: AssetProps[];
}

function StellarAssetsList({ assets }: StellarAssetList) {
  return (
    <div className="mt-[3.75rem] bg-[#F8F8F8] relative w-full h-[21.6875rem] overflow-scroll no-scrollbar px-[1.5rem] py-[0.375rem]">
      <span className="w-full text-[#002333] text-[1.25rem] font-medium sticky top-0 left-0 bg-[#F8F8F8]">
        Assets
      </span>
      <div className="w-full mt-[2rem]">
        {assets.map((asset) => (
          <Asset
            key={asset.id}
            id={asset.id}
            assetName={asset.assetName}
            assetImage={asset.assetImage}
            assetAbrv={asset.assetAbrv}
            assetBalance={asset.assetBalance}
            assetInDollar={asset.assetInDollar}
            percentageMovement={asset.percentageMovement}
            movementType={asset.movementType}
          />
        ))}
      </div>
    </div>
  );
}

export default StellarAssetsList;

function Asset({
  assetName,
  assetImage,
  assetAbrv,
  assetBalance,
  assetInDollar,
  percentageMovement,
  movementType,
}: AssetProps) {
  return (
    <div className="w-full h-[4.8125rem] flex justify-between border-b border-b-[#E4E3FF]">
      <div className="flex items-center gap-x-[1rem]">
        <Image
          src={assetImage || ""}
          alt={assetName}
          width={40}
          height={40}
          quality={90}
          className="w-[2.5rem] h-[2.5rem]"
        />
        <div className="flex flex-col">
          <p className="font-bold text-[#424242] text-base">{assetName}</p>
          <p className="font-medium text-[#42424299] text-sm">
            {assetBalance} {assetAbrv}
          </p>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <p className="text-[#424242] text-base font-bold">${assetInDollar}</p>
        <p
          className={`${
            movementType === "up"
              ? "text-[#3ACC6C]"
              : movementType === "down"
              ? "text-[#FF1212]"
              : "text-[#42424299]"
          } text-sm font-medium`}
        >
          {movementType === "up" ? "+" : movementType === "down" ? "-" : ""}
          {percentageMovement}%
        </p>
      </div>
    </div>
  );
}
