import DataLoader from "dataloader";
import { User } from "../entities/User";

// [1, 7, 8, 15] -> key integer for this (posts) ->
// [{id: 1, username: "tim"}, {}, {}, {}] -> it should find user id
export const createUserLoader = () => new DataLoader<number, User>(async userIds => {
  const users = await User.findByIds(userIds as number[]);
  const userIdToUser: Record<number, User> = {};
  users.forEach((u) => {
    userIdToUser[u.id] = u;
  });
  return userIds.map((userId) => userIdToUser[userId])
});