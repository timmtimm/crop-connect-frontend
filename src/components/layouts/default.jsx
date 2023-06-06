import Footer from "@/components/modules/footer";
import Navbar from "@/components/modules/navbar";
import { useProfileUser } from "@/context/profileUserContext";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default (props) => {
  const { children, isAuth, roles, className } = props;
  const router = useRouter();
  const { isLoadingProfile, isAuthenticated, checkRole } = useProfileUser();

  const handleCheckRole = () => {
    if (Array.isArray(roles)) {
      let flag = true;
      roles.forEach((role) => {
        if (!checkRole(true, role)) {
          flag = false;
        }
      });
      return flag;
    } else {
      return !checkRole(true, roles);
    }
  };

  if (isAuth) {
    useEffect(() => {
      if (!isLoadingProfile && !isAuthenticated) {
        router.replace({
          pathname: "/login",
          query: {
            redirect: JSON.stringify({
              pathname: router.pathname,
              query: router.query,
            }),
          },
        });
      }

      if (roles) {
        if (handleCheckRole()) {
          router.replace({
            pathname: "/",
          });
        }
      }
    }, [isLoadingProfile, isAuthenticated]);
  }

  return (
    <div className="bg-[#F7F6F0] flex flex-col min-h-screen">
      <Navbar />
      <main
        className={`container mx-auto my-8 flex-1 px-2 sm:px-0 ${className}`}
      >
        {children}
      </main>
      <Footer />
    </div>
  );
};
