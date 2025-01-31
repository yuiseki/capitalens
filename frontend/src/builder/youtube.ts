import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY as string;

const prisma = new PrismaClient();

type Item = {
  snippet: {
    title: string;
    description: string;
    publishedAt: string;
    resourceId: {
      videoId: string;
    };
    thumbnails: {
      default: {
        url: string;
      };
    };
  };
};

async function getChannelId(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    console.log(`Error: Fetch request failed with status: ${response.status}`);
    return null;
  }

  const html = await response.text();
  const channelId = html.match(/(?<=channelId(":"|"\scontent="))[^"]+/g);
  return channelId ? channelId[0] : null;
}

(async function () {
  try {
    const members = await prisma.member.findMany({
      select: {
        id: true,
        youtube: true,
      },
      where: {
        NOT: {
          youtube: "",
        },
        youtube: {
          not: null,
        },
      },
    });

    for (const member of members) {
      if (member.youtube === null) continue;

      let channelId;
      if (!member.youtube.startsWith("UC")) {
        channelId = await getChannelId(
          `https://www.youtube.com/@${member.youtube}`
        );

        if (!channelId) {
          channelId = await getChannelId(
            `https://www.youtube.com/user/${member.youtube}`
          );
        }
      } else {
        channelId = member.youtube;
      }

      if (channelId) {
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${YOUTUBE_API_KEY}`
        );

        if (!response.ok) {
          console.log(
            `Error: Fetch request failed with status: ${response.status}`
          );
          continue;
        }

        const json = await response.json();

        const videos = await fetch(
          `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${json.items[0].contentDetails.relatedPlaylists.uploads}&key=${YOUTUBE_API_KEY}`
        );

        if (!videos.ok) {
          console.log(
            `Error: Fetch request failed with status: ${videos.status}`
          );
          continue;
        }

        const res = await videos.json();

        if (res.items) {
          await prisma.timeline.createMany({
            data: res.items.map((item: Item) => ({
              title: item.snippet.title,
              contentSnippet: item.snippet.description,
              dateMiliSeconds: new Date(item.snippet.publishedAt).getTime(),
              isoDate: item.snippet.publishedAt,
              link:
                "https://www.youtube.com/watch?v=" +
                item.snippet.resourceId.videoId,
              memberId: member.id,
              ogImageURL: item.snippet.thumbnails.default.url,
            })),
          });

          setTimeout(() => {}, 1000);
        } else {
          console.log("Error: res.items is undefined");
        }
      } else {
        console.log(
          `Error: Fetch request failed ${member.id} ${member.youtube}`
        );
      }
    }
  } catch (error) {
    console.error(error);
  }
})();
