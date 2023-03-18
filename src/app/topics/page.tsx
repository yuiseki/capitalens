import prisma from "@src/lib/prisma";
import { FaHashtag } from "react-icons/fa";
import Link from "next/link";
import type { Metadata } from "next";

export const revalidate = 3600;

async function getTopicViews() {
  const data = await prisma.views.findMany({
    take: 100,
    orderBy: {
      count: "desc",
    },
    select: {
      name: true,
    },
  });

  return data;
}

export const metadata: Metadata = {
  title: "注目のトピック",
};

export default async function Page() {
  const topics = await getTopicViews();

  return (
    <div className="mx-auto max-w-screen-xl px-4 md:px-8 my-12">
      <h1 className="font-bold mb-7 text-3xl md:text-4xl">🔍注目のトピック</h1>
      <p className="mb-3">
        注目のトピックは国会での発言数、本サイトでの各トピックのアクセス数で決定されています。
      </p>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-8 rounded-md">
        {topics.map((view) => (
          <Link
            href={`/topics/${view.name}`}
            className="px-6 py-4 flex items-center border"
            key={view.name}
          >
            <div className="p-5 rounded-full bg-[#e0efff] mr-4">
              <FaHashtag className="text-3xl text-[#3ea8ff]" />
            </div>
            <span className="font-bold text-lg">{view.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}