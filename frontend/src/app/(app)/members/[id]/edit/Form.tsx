"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { updateMember } from "@src/app/actions";
import Button from "@src/components/ui/button";
import {
  InputField,
  SelectField,
  TextareaField,
} from "@src/components/ui/form";
import {
  hasDurationPassedSinceCreation,
  twoWeeksInMilliseconds,
} from "@src/helper/utils";
import { FormSchema, MemberSchema } from "@src/schema/member";
import { usePathname } from "next/navigation";
import { Session } from "next-auth";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

export default function Form({
  groups,
  member,
  user,
}: {
  groups: {
    id: string;
    name: string;
  }[];
  member: FormSchema;
  user: Session["user"];
}) {
  const [done, setDone] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();

  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<FormSchema>({
    defaultValues: member,
    resolver: zodResolver(MemberSchema),
  });

  const onSubmit = handleSubmit((data) => {
    startTransition(async () => {
      const response = await updateMember(data);

      if (response) {
        setDone(true);
      }
    });
  });

  return (
    <>
      {done ? (
        <div className="text-center">
          <h1 className="mb-5 text-4xl font-bold">
            開発チームに送信されました
          </h1>
          <p className="text-lg text-gray-600">
            ご協力ありがとうございます。開発チームが確認の上公開されます。
          </p>
          <img src="/undraw_Chasing_love_re_9r1c.png" alt="Chasing love" />
          {pathname ? (
            <Button
              title="議員ページに戻る ->"
              pathname={pathname.replace("/edit", "")}
            />
          ) : (
            <Button title="ホームに戻る ->" pathname="/" />
          )}
        </div>
      ) : !hasDurationPassedSinceCreation(
          user.createdAt,
          twoWeeksInMilliseconds
        ) ? (
        <>
          <h1 className="text-center text-8xl font-bold">Sorry...</h1>
          <div className="text-center">
            <img
              src="/undraw_Synchronize_re_4irq.png"
              alt="Synchronize"
              width="432"
              className="mx-auto mb-4"
              height="308"
            />
            <p className="mb-3 text-lg text-gray-600">
              安全のため、議員情報を更新するにはアカウント作成から2週間以上経過している必要があります
            </p>
            {pathname ? (
              <Button
                title="議員ページに戻る ->"
                pathname={pathname.replace("/edit", "")}
              />
            ) : (
              <Button title="ホームに戻る ->" pathname="/" />
            )}
          </div>
        </>
      ) : (
        <div>
          <h1 className="mb-5 text-center text-4xl font-bold">
            {member.name}議員の情報を更新する
          </h1>
          <form onSubmit={onSubmit}>
            <label className="mb-2 flex items-center font-bold">
              議員名
              <span className="ml-2 font-normal text-red-500">必須</span>
            </label>
            <InputField
              id="name"
              register={register}
              placeholder="議員名を入力"
              errors={errors}
            />
            <label className="mb-2 flex items-center font-bold">
              フルネーム
            </label>
            <div className="flex gap-x-4">
              <InputField
                id="firstName"
                register={register}
                placeholder="山田"
                errors={errors}
              />
              <InputField
                id="lastName"
                register={register}
                placeholder="太郎"
                errors={errors}
              />
            </div>
            <label className="mb-2 flex items-center font-bold">ひらがな</label>
            <div className="flex gap-x-4">
              <InputField
                id="firstNameHira"
                register={register}
                placeholder="やまだ"
                errors={errors}
              />
              <InputField
                id="lastNameHira"
                register={register}
                placeholder="たろう"
                errors={errors}
              />
            </div>
            <label className="mb-2 flex items-center font-bold">
              公式サイト
            </label>
            <InputField
              id="website"
              register={register}
              placeholder="https://example.com"
              errors={errors}
            />
            <label className="mb-2 flex items-center font-bold">Twitter</label>
            <InputField
              id="twitter"
              register={register}
              placeholder="@を含めないで入力"
              errors={errors}
            />
            <label className="mb-2 flex items-center font-bold">
              所属政党
              <span className="ml-2 font-normal text-red-500">必須</span>
            </label>
            <SelectField
              id="groupId"
              register={register}
              errors={errors}
              options={[
                { label: "無所属・その他", value: "" },
                ...groups.map((group) => ({
                  label: group.name,
                  value: group.id,
                })),
              ]}
            />
            <label className="mb-2 flex items-center font-bold">
              議会<span className="ml-2 font-normal text-red-500">必須</span>
            </label>
            <SelectField
              id="house"
              register={register}
              errors={errors}
              options={[
                { label: "参議院", value: "COUNCILLORS" },
                { label: "衆議院", value: "REPRESENTATIVES" },
              ]}
            />
            <label className="mb-2 flex items-center font-bold">説明</label>
            <TextareaField
              id="description"
              errors={errors}
              placeholder="議員の情報を入力..."
              register={register}
            />
            <div className="flex justify-center">
              <button
                className="bg-primary mt-3 rounded-full px-6 py-2 text-center text-xl font-bold text-white shadow transition-all duration-500 ease-in-out hover:shadow-md"
                disabled={isPending}
              >
                送信する
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
