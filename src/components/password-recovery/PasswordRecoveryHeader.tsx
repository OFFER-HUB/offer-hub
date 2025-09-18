import Image from "next/image";
import user_profile from "../../../public/offer_hub_profile.svg";

const PasswordRecoveryHeader = () => {
  return (
    <header className="border-b border-gray-200">
      <div className=" mx-auto px-10 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <div className="text-base font-bold text-gray-900 flex items-center">
            <div className=" rounded-full mr-2 flex items-center justify-center overflow-hidden">
              <Image
                src="/oh-logo.png"
                alt="OH Logo"
                width={60}
                height={50}
                className="object-contain"
              />
            </div>
            OFFER HUB
          </div>
        </div>

        <span>
          <Image src={user_profile} alt="icon user profile" />
        </span>
      </div>
    </header>
  );
};

export default PasswordRecoveryHeader;
