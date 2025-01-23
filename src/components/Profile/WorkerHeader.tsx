import Image from "next/image";

// Images
import WorkerBannerImage from "@/assets/img/workerBanner.svg";
import WorkerProfileImage from "@/assets/img/workerProfile.svg";
import VerifiedIcon from "@/assets/img/verifiedIcon.svg";

// Icons
import HireIcon from "@/assets/img/hireIcon.svg";
import ShareIcon from "@/assets/img/shareIcon.svg";
import OptionsIcon from "@/assets/img/optionsIcon.svg";

export default function WorkerHeader() {
  return (
    <div className="mx-4 md:mx-10">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Banner */}
        <div className="h-32 md:h-48 bg-cover bg-center rounded-t-lg">
          <Image
            src={WorkerBannerImage}
            alt="Banner"
            width={1597}
            height={284}
            className="w-full h-full object-cover rounded-t-lg"
          />
        </div>

        {/* Contenedor de información */}
        <div className="relative flex flex-col md:flex-row items-center px-4 md:px-7">
          {/* Foto de perfil */}
          <div className="rounded-full overflow-hidden mt-[-50px] md:mt-[-115px]">
            <Image
              src={WorkerProfileImage}
              alt="Perfil"
              width={252}
              height={252}
              className="w-24 h-24 md:w-48 md:h-48"
            />
          </div>

          {/* Detalles del perfil */}
          <div className="mt-4 md:mt-0 md:ml-6 text-center md:text-left">
            {/* Nombre y verificación */}
            <div className="flex flex-col md:flex-row items-center md:items-start mt-2 md:mt-[63px]">
              <h2 className="text-2xl md:text-[64px] font-inter text-black leading-tight">
                Josh Johnson
              </h2>
              <Image
                src={VerifiedIcon}
                alt="Verified"
                width={26}
                height={28}
                className="w-6 h-6 md:w-[52px] md:h-[56px] md:ml-4"
              />
            </div>
            {/* Rol */}
            <p className="text-gray-600 font-Inter text-sm md:text-[24px] mt-2 md:mt-[-15px] mb-3">
              Designer
            </p>
          </div>

          {/* Botones de acción */}
          <div className="mt-4 md:mt-5 md:ml-auto flex items-center justify-center gap-4 md:gap-6">
            {/* Botón de más opciones */}
            <button className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full hover:bg-gray-200">
              <Image
                src={OptionsIcon}
                alt="Options"
                width={20}
                height={5}
                className="w-5 h-1 md:w-[25px] md:h-[7px]"
              />
            </button>

            {/* Botón de compartir */}
            <button className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full hover:bg-gray-200">
              <Image
                src={ShareIcon}
                alt="Share"
                width={30}
                height={30}
                className="w-6 h-6 md:w-[40px] md:h-[40px]"
              />
            </button>

            {/* Botón de contratar */}
            <button className="px-4 py-2 md:px-7 md:py-2 rounded-full bg-[#159A9C] text-white text-sm md:text-base hover:bg-[#0e7a7b] flex items-center gap-2">
              <Image
                src={HireIcon}
                alt="Hire"
                width={18}
                height={18}
                className="w-5 h-5 md:w-[30px] md:h-[30px]"
              />
              <span className="hidden md:inline">Hire</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
