import { useState } from "react";
import { Message } from "../lib/definitions";

interface ShowMessageProp {
  message: Message;
  handleMessageClick: () => void;
}

export default function ShowMessage({
  message,
  handleMessageClick,
}: ShowMessageProp) {
  return (
    <>
      {message.showMessage && (
        <div className="fixed left-0 top-0 flex w-screen h-screen justify-center items-center">
          <div className="flex justify-center items-center h-[100px] w-auto bg-pink-700 text-orange-100 p-3 rounded border-pink-700">
            <div className=" bg-pink-700 text-orange-100 rounded border-pink-700 p-2">
              {message?.content}
            </div>
            <button
              className=" bg-pink-400 text-orange-100 rounded border-pink-700 p-2"
              onClick={handleMessageClick}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
}
