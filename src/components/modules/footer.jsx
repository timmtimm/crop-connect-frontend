export default () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#EDECE3] flex w-full justify-center py-4 md:py-9 text-center font-semibold text-gray-800">
      Crop Connect
      <br />
      Copyright © {year}. All right reserved.
    </footer>
  );
};
