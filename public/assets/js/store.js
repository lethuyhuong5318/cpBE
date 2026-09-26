import { api, session } from "./api.js";

let currentUser = null;

export const store = {
  get me() {
    return currentUser;
  },
  async loadMe(force = false) {
    if (!session.isLoggedIn()) return null;
    if (!currentUser || force) currentUser = await api.getMe();
    return currentUser;
  },
  setMe(user) {
    currentUser = { ...currentUser, ...user };
  },
  logout() {
    currentUser = null;
    session.clear();
  },
};
