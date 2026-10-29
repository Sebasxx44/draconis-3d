import { HeaderTA } from "@/components/layout/HeaderTA";
import { FooterTA } from "@/components/layout/FooterTA";
import { HeroTA } from "@/components/sections/HeroTA";
import { DragonCollectionTA } from "@/components/sections/DragonCollectionTA";
import { FeaturedDragonTA } from "@/components/sections/FeaturedDragonTA";
import { CustomizationTA } from "@/components/sections/CustomizationTA";
import { PrintingProcessTA } from "@/components/sections/PrintingProcessTA";
import { GalleryTA } from "@/components/sections/GalleryTA";
import { ContactTA } from "@/components/sections/ContactTA";
import { WhatsAppButtonTA } from "@/components/ui/WhatsAppButtonTA";
import { RevealTA } from "@/components/ui/RevealTA";

const Home = () => (
  <>
    <a className="skip-link" href="#contenido">
      Saltar al contenido
    </a>
    <HeaderTA />
    <main id="contenido">
      <HeroTA />
      <RevealTA>
        <DragonCollectionTA />
      </RevealTA>
      <RevealTA>
        <FeaturedDragonTA />
      </RevealTA>
      <RevealTA>
        <CustomizationTA />
      </RevealTA>
      <RevealTA>
        <PrintingProcessTA />
      </RevealTA>
      <RevealTA>
        <GalleryTA />
      </RevealTA>
      <ContactTA />
    </main>
    <FooterTA />
    <WhatsAppButtonTA className="floating-whatsapp">Hablemos</WhatsAppButtonTA>
  </>
);

export default Home;
