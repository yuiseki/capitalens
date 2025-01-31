"use client";

import { Menu, Transition } from "@headlessui/react";
import clsx from "clsx";
import type { Route } from "next";
import Link from "next/link";
import type { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { Fragment } from "react";
import { FiSettings } from "react-icons/fi";
import { MdOutlineLogout } from "react-icons/md";

type NavigationItem = {
  name: string;
  elementType: "link" | "button";
  href?: Route<string> | URL;
  icon: React.ReactElement;
  onClick?: () => void;
};

const userNavigation: NavigationItem[] = [
  {
    name: "アカウント設定",
    elementType: "link",
    href: "/dashboard/settings",
    icon: <FiSettings color="#93a5b1" />,
  },
  {
    name: "ログアウト",
    elementType: "button",
    icon: <MdOutlineLogout color="#93a5b1" />,
    onClick: () => signOut(),
  },
];

export default function UserMenu({ user }: { user: Session["user"] }) {
  return (
    <Menu as="div" className="relative">
      <div>
        <Menu.Button className="flex text-sm focus:outline-none focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
          <img
            className="h-10 w-10 rounded-full border border-gray-200"
            src={user.image ?? "/noimage.png"}
            alt={user.name || "メニューを開く"}
          />
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {userNavigation.map((item) => (
            <Menu.Item key={item.name}>
              {({ active }) =>
                item.elementType === "link" && item.href ? (
                  <Link
                    href={item.href}
                    className={clsx(
                      active ? "bg-gray-100" : "",
                      "flex items-center px-4 py-2 text-gray-700"
                    )}
                  >
                    <span className="mr-1">{item.icon}</span>
                    {item.name}
                  </Link>
                ) : (
                  <button
                    onClick={item.onClick}
                    className={clsx(
                      active ? "bg-gray-100" : "",
                      "flex w-full items-center px-4 py-2 text-gray-700"
                    )}
                  >
                    <span className="mr-1">{item.icon}</span>
                    {item.name}
                  </button>
                )
              }
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
