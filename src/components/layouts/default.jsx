import Footer from "@/components/modules/footer";
import Navbar from "@/components/modules/navbar";

export default (props) => {
  const { children } = props;

  return (
    <div className="bg-[#F7F6F0] flex flex-col min-h-screen">
      <Navbar />
      <main className="container mx-auto my-8 flex-1">{children}</main>
      <Footer />
    </div>
  );
};
