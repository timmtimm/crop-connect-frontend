import Modal from "@/components/elements/modal";
import Seo from "@/components/elements/seo";
import Status, { convertStatusForProposal } from "@/components/elements/status";
import Dashboard from "@/components/layouts/dashboard";
import Loading from "@/components/modules/loading";
import NotFound from "@/components/templates/notFound";
import { proposalStatus, roleUser } from "@/constant/constant";
import { fetcher, putWithJSON } from "@/lib/axios";
import { runOnce } from "@/lib/swr";
import { dateFormatToIndonesia, setNumberFormat } from "@/utils/utilities";
import { Alert, Button, Slide, Snackbar } from "@mui/material";
import { HttpStatusCode } from "axios";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import useSWR from "swr";

const column = [
  {
    section: "Informasi Komoditas",
    tableColumn: [
      {
        id: "code",
        label: "Kode",
        customDisplayRow: (data) => data?.commodity?.code,
      },
      {
        id: "name",
        label: "Nama",
        customDisplayRow: (data) => data?.commodity?.name,
      },
      {
        id: "seed",
        label: "Benih",
        customDisplayRow: (data) => data?.commodity?.seed,
      },
      {
        id: "plantingPeriod",
        label: "Jangka waktu penanaman",
        customDisplayRow: (data) =>
          `${setNumberFormat(data?.commodity?.plantingPeriod)} hari`,
      },
      {
        id: "perennials",
        label: "Perennials",
        customDisplayRow: (data) =>
          data?.commodity?.perennials ? "Ya" : "Tidak",
      },
    ],
  },
  {
    section: "Informasi Proposal",
    tableColumn: [
      {
        id: "code",
        label: "Kode",
        customDisplayRow: null,
      },
      {
        id: "name",
        label: "Nama",
        customDisplayRow: null,
      },
      {
        id: "status",
        label: "Status",
        customDisplayRow: (data) => (
          <div className="flex items-center w-full justify-end md:justify-start">
            <Status
              type={convertStatusForProposal(data?.status)}
              status={data?.status}
            />
          </div>
        ),
      },
      {
        id: "description",
        label: "Deskripsi",
        customDisplayRow: (data) => data?.description || "Tidak ada deskripsi",
      },
      {
        id: "address",
        label: "Alamat",
        customDisplayRow: null,
      },
      {
        id: "plantingArea",
        label: "Luas Lahan tanam",
        customDisplayRow: (data) => (
          <span>
            {setNumberFormat(data?.plantingArea)} km<sup>2</sup>
          </span>
        ),
      },
      {
        id: "createdAt",
        label: "Tanggal Dibuat",
        customDisplayRow: (data) =>
          dateFormatToIndonesia(data?.createdAt, true),
      },
    ],
  },
  {
    section: "Informasi Petani",
    tableColumn: [
      {
        id: "_id",
        label: "ID",
        customDisplayRow: (data) => data?.commodity?.farmer?._id,
      },
      {
        id: "name",
        label: "Nama",
        customDisplayRow: (data) => data?.commodity?.farmer?.name,
      },
      {
        id: "email",
        label: "Email",
        customDisplayRow: (data) => data?.commodity?.farmer?.email,
      },
      {
        id: "phoneNumber",
        label: "Nomor Telepon",
        customDisplayRow: (data) => data?.commodity?.farmer?.phoneNumber,
      },
    ],
  },
];

export default () => {
  const router = useRouter();
  const { id } = router.query;

  const [isLoading, setIsLoading] = useState(false);
  const [decision, setDecision] = useState("");
  const [error, setError] = useState({ message: "" });

  /* Snackbar */
  const [open, setOpen] = useState(false);
  const handleClick = () => setOpen(true);
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  /* Modal */
  const [openModal, setOpenModal] = useState(false);
  const handleModal = () => setOpenModal(!openModal);

  const { data: dataProposal, isLoading: proposalLoading } = useSWR(
    [`/api/v1/proposal/${id}`, {}],
    ([url, params]) => fetcher(url, params),
    runOnce
  );

  const handleDecision = async (e) => {
    setIsLoading(true);

    const data = await putWithJSON(`/api/v1/proposal/validate/${id}`, {
      status: decision,
    });
    if (data.status == HttpStatusCode.Ok) {
      router.push("/dashboard/validation-proposal");
    } else {
      setError({ ...error, message: data.message });
      handleClick();
    }

    setIsLoading(false);
  };

  return (
    <>
      <Seo
        title={
          proposalLoading
            ? "Loading..."
            : dataProposal?.status == HttpStatusCode.Ok
            ? `Detail Proposal ${dataProposal.data.name}`
            : `Proposal Tidak Ditemukan`
        }
      />
      {(isLoading || proposalLoading) && <Loading />}
      {openModal && (
        <Modal>
          <Image
            src="/search _ find, research, scan, article, document, file, magnifier_lg.png"
            width={160}
            height={160}
            alt="ilustrasi Cek Kembali"
          />
          <h2 className="text-xl text-center mt-4 font-bold">
            {decision == proposalStatus.approved
              ? "Apakah anda yakin ingin menyetujui proposal ini?"
              : "Apakah anda yakin ingin menolak proposal ini?"}
          </h2>
          <div className="flex flex-row gap-2">
            <Button
              className="text-right bg-[#DB3546] hover:bg-[#BA2D3C] normal-case font-bold mt-2"
              variant="contained"
              onClick={() => {
                handleModal();
                setDecision("");
              }}
            >
              Tidak
            </Button>
            <Button
              className="text-right bg-[#53A06C] hover:bg-[#3E8A4F] normal-case font-bold mt-2"
              variant="contained"
              onClick={handleDecision}
            >
              Ya
            </Button>
          </div>
        </Modal>
      )}
      <Snackbar
        open={open}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        TransitionComponent={Slide}
        autoHideDuration={3000}
        onClose={handleClose}
        message={error.message}
      >
        <Alert onClose={handleClose} severity="error" sx={{ width: "100%" }}>
          {error.message}
        </Alert>
      </Snackbar>
      <Dashboard roles={roleUser.validator}>
        {!proposalLoading && dataProposal?.status != HttpStatusCode.Ok && (
          <NotFound
            content="Proposal"
            urlRedirect="/dashboard/validation-proposal"
            redirectPageTitle="daftar proposal"
          />
        )}
        {!proposalLoading && dataProposal?.status == HttpStatusCode.Ok && (
          <>
            <h1 className="text-2xl font-bold mb-4">Detail Proposal</h1>
            <div className="flex flex-col gap-4 w-full bg-white p-4 rounded-xl shadow-md divide-y-2">
              {column.map((section, index) => (
                <div key={index}>
                  <h2
                    className={`text-lg font-bold ${
                      index == 0 ? "mb-2" : "my-2"
                    }`}
                  >
                    {section.section}
                  </h2>
                  <table className="w-full md:w-fit">
                    <tbody>
                      {section.tableColumn.map((column, index) => (
                        <tr key={index}>
                          <td className="flex flex-row items-center justify-between">
                            <span>{column.label}</span>
                            <span className="hidden md:flex text-right">:</span>
                          </td>
                          <td className="ml-2 text-right md:text-left">
                            {column.customDisplayRow
                              ? column.customDisplayRow(dataProposal?.data)
                              : dataProposal?.data[column.id]}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
            {dataProposal?.data.status == proposalStatus.pending && (
              <div className="flex w-full gap-2 justify-end">
                <Button
                  className="text-right bg-[#DB3546] hover:bg-[#BA2D3C] normal-case font-bold mt-2"
                  variant="contained"
                  onClick={() => {
                    handleModal();
                    setDecision(proposalStatus.rejected);
                  }}
                >
                  Tolak
                </Button>
                <Button
                  className="text-right bg-[#53A06C] hover:bg-[#3E8A4F] normal-case font-bold mt-2"
                  variant="contained"
                  onClick={() => {
                    handleModal();
                    setDecision(proposalStatus.approved);
                  }}
                >
                  Terima
                </Button>
              </div>
            )}
          </>
        )}
      </Dashboard>
    </>
  );
};
