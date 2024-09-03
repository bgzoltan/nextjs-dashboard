"use client";

import Link from "next/link";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { Button } from "@/app/ui/button";
import { createCustomer } from "@/app/lib/actions";
import { ChangeEvent, useState } from "react";

import ShowMessage from "../show-message";
import { Message } from "@/app/lib/definitions";
import { useRouter } from "next/navigation";

export default function Form() {
  const [fileName, setFileName] = useState("There is no selected file.");
  const [message, setMessage] = useState<Message>({
    content: "",
    type: "",
    showMessage: false,
    redirect: "",
  });

  const router = useRouter();

  const fileValidation = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setMessage({
        ...message,
        content: "There is no selected file",
        type: "user info",
        showMessage: true,
      });
      return;
    }

    if (e.target.files[0].size < 10000) setFileName(e.target.files[0].name);
    else {
      setMessage({
        ...message,
        content: "The size of the file is too large!",
        type: "error",
        showMessage: true,
      });
    }
    const file = e.target.files[0];

    if (
      !["image/webp", "image/jpeg", "image/png"].find(
        (element) => element === file.type
      )
    ) {
      setMessage({
        ...message,
        content: "This is not an image file",
        type: "error",
        showMessage: true,
      });
    }
  };

  const handleMessageClick = () => {
    const newMessage: Message | null = {
      ...message,
      showMessage: false,
      redirect: "",
    };
    setFileName("Theres is no selected file.");
    setMessage(newMessage);
    if (message.redirect !== "") {
      router.push(message.redirect);
    }
  };

  async function onSubmit(formData: FormData) {
    const result = await createCustomer(formData);

    if (!result) {
      setMessage({
        ...message,
        content: "Form submitted successfully",
        type: "user info",
        showMessage: true,
        redirect: "/dashboard/customers",
      });
    } else if (result.error) {
      setMessage({
        ...message,
        content: result.error,
        type: "critical error",
        showMessage: true,
      });
    }
  }

  return (
    <>
      <form action={onSubmit}>
        <fieldset>
          <legend className="mb-2 block text-sm font-medium">
            Perdsonal data
          </legend>
          <div className="rounded-md bg-gray-50 p-4 md:p-6">
            <div className="mb-4">
              <label
                htmlFor="customer-name"
                className="mb-2 block text-sm font-medium"
              >
                Customer full name
              </label>
              <div className="relative">
                <input
                  id="customer-name"
                  name="name"
                  type="string"
                  placeholder="Customer name..."
                  className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                />
                <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
              </div>
            </div>

            <div className="mb-4">
              <label
                htmlFor="customer-email"
                className="mb-2 block text-sm font-medium"
              >
                Email
              </label>
              <div className="relative">
                <input
                  id="customer-email"
                  name="email"
                  type="string"
                  placeholder="Customer email..."
                  className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                />
                <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
              </div>
            </div>
            <div className="mb-4">
              <label
                htmlFor="user-image"
                className="peer w-32 rounded-md border text-white bg-blue-600 py-2 pl-2 text-sm outline-2 block cursor-pointer"
              >
                Upload a picture
              </label>
              <input
                type="file"
                id="user-image"
                name="userImage"
                className="peer w-full rounded-md border border-gray-200 py-2 pl-2 text-sm outline-2 placeholder:text-gray-500 hidden"
                onChange={(e) => fileValidation(e)}
              />
              <div>{fileName}</div>
            </div>
          </div>
        </fieldset>
        <div className="mt-6 flex justify-end gap-4">
          <Link
            href="/dashboard/customers"
            className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
          >
            Cancel
          </Link>
          <Button type="submit">Create Customer</Button>
        </div>
      </form>
      <ShowMessage message={message} handleMessageClick={handleMessageClick} />
    </>
  );
}
