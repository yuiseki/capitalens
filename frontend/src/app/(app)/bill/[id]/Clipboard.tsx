"use client";

import { useState } from "react";
import { AiOutlineLink } from "react-icons/ai";

export default function Clipboard() {
  const [button, setButton] = useState(false);

  const copyLink = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      setButton(true);
    } catch (err) {
      console.error("リンクのコピーに失敗しました:", err);
    }
  };

  return (
    <button
      className="block rounded-lg border bg-white px-2 py-4 text-center transition duration-500 hover:shadow-md md:px-4 md:py-6"
      onClick={copyLink}
    >
      <div className="flex justify-center">
        {button ? (
          <span className="mb-3 text-4xl">✨</span>
        ) : (
          <AiOutlineLink className="mb-3 text-4xl text-gray-400" />
        )}
      </div>
      <span className="font-bold">
        {button ? "コピーしました" : "リンクをコピー"}
      </span>
    </button>
  );
}
