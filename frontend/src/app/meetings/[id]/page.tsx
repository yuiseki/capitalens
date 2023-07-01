import prisma from "@src/lib/prisma";
import { notFound } from "next/navigation";
import Video from "./Video";
import type { Metadata } from "next";
import dayjs from "dayjs";
import { config } from "@site.config";
import { auth } from "@/auth";
import { Meeting } from "@src/types/meeting";
import SetPlaceHolder from "@src/hooks/placeholder";

export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata | undefined> {
  const meeting = await getMeeting(params.id);

  if (!meeting) {
    notFound();
  }

  return {
    title:
      (meeting.house === "COUNCILLORS" ? "参議院 " : "衆議院 ") +
      meeting.meeting_name +
      " " +
      dayjs(meeting.date).format("YY/MM/DD"),
    description: meeting.summary,
    twitter: {
      description:
        meeting.summary ??
        `${dayjs(meeting.date).format("YYYY年MM月DD日")}の${
          meeting.house === "COUNCILLORS" ? "参議院 " : "衆議院 "
        } ${meeting.meeting_name}の情報をチェックする`,
      title:
        (meeting.house === "COUNCILLORS" ? "参議院 " : "衆議院 ") +
        meeting.meeting_name,
    },
    openGraph: {
      title:
        (meeting.house === "COUNCILLORS" ? "参議院 " : "衆議院 ") +
        meeting.meeting_name,
      siteName: config.siteMeta.title,
      url: `${config.siteRoot}meetings/${meeting.id}`,
      locale: "ja-JP",
    },
  };
}

async function getMeeting(id: string) {
  const meeting = await prisma.video.findFirst({
    where: { id },
    include: {
      utterances: {
        include: {
          words: true,
        },
      },
      videoComments: {
        include: {
          user: {
            select: {
              name: true,
              image: true,
              id: true,
            },
          },
        },
      },
      annotations: {
        include: {
          member: {
            include: {
              group: true,
            },
          },
        },
      },
    },
  });

  const json: Meeting = JSON.parse(JSON.stringify(meeting));

  return json;
}

export default async function Page({ params }: { params: { id: string } }) {
  const meetingPromise = getMeeting(params.id);
  const sessionPromise = auth();

  const [session, meeting] = await Promise.all([
    sessionPromise,
    meetingPromise,
  ]);

  if (!meeting) {
    notFound();
  }

  return (
    <>
      <section className="mx-auto max-w-screen-xl px-4 md:px-8">
        <Video user={session?.user} meeting={meeting} />
      </section>
      <SetPlaceHolder
        placeholder={`${meeting.meeting_name}の最近の会議を教えてください`}
      />
    </>
  );
}
