import { get } from "@/lib/axios";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { createContext, useContext, useEffect, useState } from "react";

const profileUserContext = createContext();

export const ProfileUserProvider = ({ children }) => {
  const router = useRouter();
  const [profileUser, setProfileUser] = useState({});
  const [isLoadingProfile, setIsLoading] = useState(false);

  const getProfileUser = async () => {
    setIsLoading(true);
    const { data } = await get("/api/v1/user/profile");

    if (data) setProfileUser(data);
    else handleLogout();

    setIsLoading(false);
  };

  const logout = () => {
    setIsLoading(true);
    Cookies.remove("token");
    setProfileUser({});
    router.push("/");
    setIsLoading(false);
  };

  const checkRole = (condition, role) => {
    return condition ? profileUser?.role == role : profileUser?.role != role;
  };

  useEffect(() => {
    if (Cookies.get("token")) {
      getProfileUser();
    }
  }, [Cookies.get("token")]);

  return (
    <profileUserContext.Provider
      value={{
        profileUser,
        isLoadingProfile,
        setProfileUser,
        getProfileUser,
        checkRole,
        logout,
      }}
    >
      {children}
    </profileUserContext.Provider>
  );
};

export const useProfileUser = () => useContext(profileUserContext);
