import { User } from "../../model";
import { db } from "../../utils";

const updateProfile = async (name: string, data: string) => {
  try {
    const profile = JSON.parse(data);
    const userProfile = {
      ...profile,
      lastModifiedAt: new Date(Date.now()).toISOString(),
    };
    const user = new User(db);
    const { success, query, error } = await user.updateUser(name, userProfile);
    if (!success) throw error;
    else return query[0];
  } catch (err) {
    throw err;
  }
};

const deleteUser = async (ids: Array<string>) => {
  try {
    const user = new User(db);
    const { success, error } = await user.deleteUser(ids);
    if (!success) throw error;
  } catch (err) {
    throw err;
  }
};

export { updateProfile, deleteUser };
