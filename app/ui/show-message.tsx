import { Message } from "../lib/definitions";

interface ShowMessageProp {
  message: Message;
  handleMessageClick: () => void;
}

export default function ShowMessage({
  message,
  handleMessageClick,
}: ShowMessageProp) {
  let bgColor = "black";

  switch (message.type) {
    case "user info":
      bgColor = "mediumseagreen";
      break;
    case "critical error":
      bgColor = "tomato";
      break;
    case "error":
      bgColor = "orange";
      break;
    default:
      bgColor = "violet";
  }

  return (
    <>
      {message.showMessage && (
        <div className="fixed left-0 top-0 flex w-screen h-screen justify-center items-center">
          <div
            className="flex flex-col justify-center items-center min-w-52 p-2 rounded text-white"
            style={{ backgroundColor: bgColor }}
          >
            <p className="p-1">{message.type.toUpperCase()}</p>
            <p className="p-1">{message?.content}</p>
            <button
              className="w-24 bg-gray-400 text-white rounded p-1"
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
