export default () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#EDECE3] flex w-full justify-center py-2 text-center text-bold">
      {/* <div className="flex flex-col">
        <div className="container mx-auto px-4">
          <div className="flex flex-row justify-between py-8">
            <div className="flex flex-col gap-4">
              <span className="font-bold text-xl">Crop Connect</span>
              <span className="text-sm">
                Jl. Raya Janti No.143, Karang Jambe, Kec. Banguntapan, Bantul,
                Daerah Istimewa Yogyakarta 55198
              </span>
              <span className="text-sm">Telp: (0274) 368541</span>
              <span className="text-sm">Fax: (0274) 368541</span>
              <span className="text-sm">
                Email:
                <a href="mailto:" className="text-blue-500">
                  Email@email.com
                </a>
              </span>
            </div>
            <div className="flex flex-col gap-4">
              <span className="font-bold text-xl">Tautan</span>
              <span className="text-sm">Beranda</span>
              <span className="text-sm">Tentang Kami</span>
              <span className="text-sm">Kontak</span>
            </div>
            <div className="flex flex-col gap-4">
              <span className="font-bold text-xl">Sosial Media</span>
              <span className="text-sm">Facebook</span>
              <span className="text-sm">Instagram</span>
              <span className="text-sm">Twitter</span>
            </div>
          </div>
        </div> */}
      Crop Connect
      <br />
      Copyright © {year}. All right reserved.
      {/* </div> */}
    </footer>
  );
};
