"use server";

import prisma from "@src/lib/prisma";
import { auth } from "@auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { zact } from "zact/server";

export const DeleteComment = zact(z.object({ id: z.string().cuid() }))(
  async (data) => {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        error: "Unauthorized",
      };
    }
    const comment = await prisma.videoComment.findUnique({
      where: { id: data.id },
    });

    if (comment?.userId !== session.user.id) {
      return {
        error: "You are not authorized.",
      };
    }

    const res = await prisma.videoComment.delete({
      where: {
        id: data.id,
      },
    });

    revalidatePath("/");

    return res;
  }
);

export const addComment = zact(
  z.object({ comment: z.string(), id: z.string().cuid() })
)(async (data) => {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      error: "Unauthorized",
    };
  }

  const res = await prisma.videoComment.create({
    data: {
      user: { connect: { id: session.user.id } },
      comment: data.comment,
      video: { connect: { id: data.id } },
    },
  });

  revalidatePath("/");

  return res;
});