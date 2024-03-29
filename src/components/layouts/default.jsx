import Footer from "@/components/modules/footer";
import Navbar from "@/components/modules/navbar";
import { useProfileUser } from "@/context/profileUserContext";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default (props) => {
  const { homepage, children, isAuth, roles } = props;
  const router = useRouter();
  const { isLoadingProfile, isAuthenticated, checkRole } = useProfileUser();

  const handleCheckRole = () => {
    if (Array.isArray(roles)) {
      let flag = false;
      roles.forEach((role) => {
        if (!checkRole(true, role)) {
          flag = true;
        }
      });
      return !flag;
    } else {
      return !checkRole(true, roles);
    }
  };

  if (isAuth) {
    useEffect(() => {
      if (!isLoadingProfile && !isAuthenticated) {
        router.replace({
          pathname: "/login",
        });
      }
      if (!isLoadingProfile && isAuthenticated && roles && handleCheckRole()) {
        router.replace({
          pathname: "/",
        });
      }
    }, [isLoadingProfile, isAuthenticated]);
  }

  return (
    <div className="bg-[#F7F6F0] flex flex-col min-h-screen">
      <Navbar />
      <main className={`${!homepage && "container mx-auto my-8 px-2"} flex-1`}>
        {children}
      </main>
      <Footer />
    </div>
  );
};
