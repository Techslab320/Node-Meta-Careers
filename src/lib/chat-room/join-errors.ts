export class ChatRoomJoinError extends Error {
  readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "ChatRoomJoinError";
    this.statusCode = statusCode;
  }
}
