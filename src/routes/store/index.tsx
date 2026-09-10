import { createFileRoute } from "@tanstack/react-router";
import { ssr_pb } from "#/client/pb";
import Hero from "./-components/Hero";
import Features from "./-components/Features";
import JewelryGrid from "./-components/JewleryGrid";
import HatsGrid from "./-components/HatsGrid";
import CustomMade from "./-components/CustomMade";
import Feedbacks, { type ReviewWithDetails } from "./-components/FeedBacks";
import WriteUp from "./-components/WriteUp";

export const Route = createFileRoute("/store/")({
  loader: () =>
    ssr_pb()
      .collection("reviews")
      .getList<ReviewWithDetails>(1, 6, {
        sort: "-created",
        expand: "user,product",
      })
      .catch(() => ({
        items: [],
        totalItems: 0,
        totalPages: 0,
        page: 1,
        perPage: 6,
      })),
  component: Home,
});

function Home() {
  const reviewsData = Route.useLoaderData();

  return (
    <div className="space-y-16 lg:space-y-24 pb-12">
      <Hero />
      <Features />
      <HatsGrid />
      <JewelryGrid />
      <CustomMade />
      <Feedbacks initialData={reviewsData} />
      <WriteUp />
    </div>
  );
}
