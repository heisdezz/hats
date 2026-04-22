import { createFileRoute } from "@tanstack/react-router";
import Hero from "./-components/Hero";
import Features from "./-components/Features";
import JewelryGrid from "./-components/JewleryGrid";
import HatsGrid from "./-components/HatsGrid";
import CustomMade from "./-components/CustomMade";
import Feedbacks from "./-components/FeedBacks";
import WriteUp from "./-components/WriteUp";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <div className="space-y-24">
      <Hero />
      <Features />
      <JewelryGrid />
      <HatsGrid />
      <CustomMade />
      <Feedbacks />
      <WriteUp />
    </div>
  );
}
