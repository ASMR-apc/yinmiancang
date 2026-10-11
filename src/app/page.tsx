import { HeroSection } from "@/components/home/HeroSection";
import { TodayRecommend } from "@/components/home/TodayRecommend";
import { SceneEntrance } from "@/components/home/SceneEntrance";
import { ContinueListening } from "@/components/home/ContinueListening";
import { TriggerGrid } from "@/components/home/TriggerGrid";
import { BreathingPreview } from "@/components/home/BreathingPreview";
import { GoodnightWallPreview } from "@/components/home/GoodnightWallPreview";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TodayRecommend />
      <SceneEntrance />
      <ContinueListening />
      <TriggerGrid />
      <BreathingPreview />
      <GoodnightWallPreview />
    </>
  );
}
