import { get } from "@/lib/axios";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { createContext, useContext, useEffect, useState } from "react";

const profileUserContext = createContext();

export const ProfileUserProvider = ({ children }) => {
  const router = useRouter();
  const [profileUser, setProfileUser] = useState({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const getProfileUser = async () => {
    const { data } = await get("/api/v1/user/profile");

    if (data) {
      setProfileUser(data);
      setIsAuthenticated(true);
    } else logout();

    setIsLoadingProfile(false);
  };

  const logout = () => {
    setIsLoadingProfile(true);
    Cookies.remove("token");
    setProfileUser({});
    router.push("/");
    setIsAuthenticated(false);
    setIsLoadingProfile(false);
  };

  const checkRole = (condition, role) => {
    return condition ? profileUser?.role == role : profileUser?.role != role;
  };

  useEffect(() => {
    if (Cookies.get("token")) {
      getProfileUser();
    } else {
      setIsLoadingProfile(false);
    }
  }, [Cookies.get("token")]);

  return (
    <profileUserContext.Provider
      value={{
        profileUser,
        isLoadingProfile,
        isAuthenticated,
        setIsAuthenticated,
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
