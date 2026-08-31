import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  BrowserQRCodeReader,
  BrowserCodeReader,
  type IScannerControls,
} from "@zxing/browser";

import {
  HiOutlineCamera,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineRefresh,
} from "react-icons/hi";

import { ticketApi } from "../services/api";


type ScanState =
  | "idle"
  | "starting"
  | "scanning"
  | "processing"
  | "approved"
  | "rejected"
  | "error";


const SCANNER_ELEMENT_ID =
  "chills-vibes-qr-reader";


const Scanner = () => {

  /*
   * ============================================================
   * REFERENCES
   * ============================================================
   */

  const videoRef =
    useRef<HTMLVideoElement | null>(null);

  const readerRef =
    useRef<BrowserQRCodeReader | null>(null);

  const controlsRef =
    useRef<IScannerControls | null>(null);

  const mountedRef =
    useRef(false);

  const startingRef =
    useRef(false);

  const processingRef =
    useRef(false);


  /*
   * ============================================================
   * STATE
   * ============================================================
   */

  const [scanState, setScanState] =
    useState<ScanState>("idle");

  const [message, setMessage] =
    useState("");

  const [scannedAt, setScannedAt] =
    useState<string | null>(null);

  const [diagnostic, setDiagnostic] =
    useState(
      "CHECKPOINT 0: Scanner not started."
    );

  const [cameraName, setCameraName] =
    useState("");

  const [cameraCount, setCameraCount] =
    useState(0);


  /*
   * ============================================================
   * EXTRACT TICKET HASH
   * ============================================================
   */

  const extractTicketHash =
    useCallback(
      (decodedText: string) => {

        const value =
          decodedText.trim();

        /*
         * QR may contain:
         *
         * tkt_xxxxxxxxx
         *
         * OR:
         *
         * https://chillandvibes.com/tickets/verify/tkt_xxxxx
         */

        try {

          const url =
            new URL(value);

          const parts =
            url.pathname
              .split("/")
              .filter(Boolean);

          const last =
            parts[parts.length - 1];

          if (last) {
            return decodeURIComponent(
              last
            );
          }

        } catch {
          /*
           * Not a URL.
           */
        }

        return value;

      },
      []
    );


  /*
   * ============================================================
   * STOP SCANNER
   * ============================================================
   */

  const stopScanner =
    useCallback(() => {

      console.log(
        "[ZXING CLEANUP] Stopping scanner..."
      );


      /*
       * ZXing controls own the camera lifecycle.
       */
      if (
        controlsRef.current
      ) {

        try {

          controlsRef.current.stop();

          console.log(
            "[ZXING CLEANUP] controls.stop() completed."
          );

        } catch (error) {

          console.debug(
            "[ZXING CLEANUP] controls.stop() skipped:",
            error
          );

        }

        controlsRef.current =
          null;

      }


      /*
       * Be conservative with the video element.
       *
       * We do NOT remove DOM nodes.
       *
       * We do not call load().
       */
      const video =
        videoRef.current;

      if (video) {

        try {

          const stream =
            video.srcObject as
              | MediaStream
              | null;

          if (stream) {

            stream
              .getTracks()
              .forEach(
                (track) => {

                  try {
                    track.stop();
                  } catch {
                    // Already stopped.
                  }

                }
              );

          }

        } catch (error) {

          console.debug(
            "[ZXING CLEANUP] Video stream cleanup skipped:",
            error
          );

        }

        video.srcObject =
          null;

      }


      readerRef.current =
        null;


      console.log(
        "[ZXING CLEANUP] Complete."
      );

    }, []);


  /*
   * ============================================================
   * VERIFY TICKET
   * ============================================================
   */

  const verifyTicket =
    useCallback(
      async (decodedText: string) => {

        /*
         * Prevent repeated callbacks from the same QR.
         */
        if (
          processingRef.current
        ) {
          return;
        }

        processingRef.current =
          true;


        console.log(
          "=========================================="
        );


        console.log(
          "[QR CHECKPOINT 8] QR DECODED:",
          decodedText
        );


        if (
          mountedRef.current
        ) {

          setScanState(
            "processing"
          );

          setDiagnostic(
            "CHECKPOINT 8 PASSED: QR detected. Verifying ticket..."
          );

        }


        const ticketHash =
          extractTicketHash(
            decodedText
          );


        console.log(
          "[QR CHECKPOINT 9] Ticket hash:",
          ticketHash
        );


        try {

          setDiagnostic(
            "CHECKPOINT 9: Sending ticket to Django..."
          );


          const response =
            await ticketApi.scanTicket(
              ticketHash
            );


          console.log(
            "[QR CHECKPOINT 10] Django response:",
            response
          );


          stopScanner();


          if (
            !mountedRef.current
          ) {
            return;
          }


          if (
            response.status ===
            "APPROVED"
          ) {

            setScanState(
              "approved"
            );

            setMessage(
              response.message ||
                "Ticket valid! Welcome to Chill & Vibes."
            );

            setScannedAt(
              response.scanned_at ||
                null
            );

            setDiagnostic(
              "CHECKPOINT 10 PASSED: ENTRY APPROVED."
            );


            console.log(
              "[QR RESULT] APPROVED"
            );

          } else {

            setScanState(
              "rejected"
            );

            setMessage(
              response.error ||
                "Ticket rejected."
            );

            setDiagnostic(
              "CHECKPOINT 10: ENTRY REJECTED."
            );

            console.log(
              "[QR RESULT] REJECTED"
            );

          }

        } catch (
          error: unknown
        ) {

          console.error(
            "[QR CHECKPOINT 10 FAILED]",
            error
          );


          stopScanner();


          if (
            !mountedRef.current
          ) {
            return;
          }


          const axiosError =
            error as {
              response?: {
                data?: {
                  status?: string;
                  error?: string;
                };
              };
            };


          const backendStatus =
            axiosError.response
              ?.data?.status;

          const backendMessage =
            axiosError.response
              ?.data?.error;


          if (
            backendStatus ===
            "REJECTED"
          ) {

            setScanState(
              "rejected"
            );

            setMessage(
              backendMessage ||
                "Ticket rejected."
            );

            setDiagnostic(
              "CHECKPOINT 10: Django rejected the ticket."
            );

          } else {

            setScanState(
              "error"
            );

            setMessage(
              backendMessage ||
                "Unable to contact the ticket server."
            );

            setDiagnostic(
              "CHECKPOINT 10 FAILED: Backend verification failed."
            );

          }

        } finally {

          processingRef.current =
            false;

        }

        console.log(
          "=========================================="
        );

      },
      [
        extractTicketHash,
        stopScanner,
      ]
    );


  /*
   * ============================================================
   * START SCANNER
   * ============================================================
   */

  const startScanner =
    useCallback(
      async () => {

        if (
          startingRef.current
        ) {

          console.warn(
            "[ZXING START] Already starting."
          );

          return;

        }


        if (
          controlsRef.current
        ) {

          console.warn(
            "[ZXING START] Scanner already running."
          );

          return;

        }


        startingRef.current =
          true;

        processingRef.current =
          false;


        try {

          console.log(
            "=========================================="
          );

          console.log(
            "[ZXING START] Starting official ZXing camera flow..."
          );


          /*
           * ======================================================
           * CHECKPOINT 1
           * ======================================================
           */

          if (
            !navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia
          ) {

            throw new Error(
              "Browser camera APIs are unavailable."
            );

          }


          console.log(
            "[QR CHECKPOINT 1 PASSED] Browser camera API available."
          );


          /*
           * ======================================================
           * CHECKPOINT 2
           *
           * Video element must exist.
           * ======================================================
           */

          const video =
            videoRef.current;


          if (!video) {

            throw new Error(
              "Scanner video element does not exist."
            );

          }


          console.log(
            "[QR CHECKPOINT 2 PASSED] Video element exists."
          );


          /*
           * ======================================================
           * CHECKPOINT 3
           *
           * Create ZXing reader.
           * ======================================================
           */

          const reader =
            new BrowserQRCodeReader();


          readerRef.current =
            reader;


          console.log(
            "[QR CHECKPOINT 3 PASSED] ZXing reader created."
          );


          /*
           * ======================================================
           * CHECKPOINT 4
           *
           * Let ZXing list the actual cameras.
           *
           * This follows the official browser example.
           * ======================================================
           */

          setDiagnostic(
            "CHECKPOINT 4: Asking ZXing for available cameras..."
          );


          console.log(
            "[QR CHECKPOINT 4] Listing video input devices..."
          );


          const videoInputDevices =
            await BrowserCodeReader
              .listVideoInputDevices();


          console.log(
            "[QR CHECKPOINT 4] Devices returned:",
            videoInputDevices
          );


          if (
            !videoInputDevices ||
            videoInputDevices.length === 0
          ) {

            throw new Error(
              "ZXing did not find any video input devices."
            );

          }


          setCameraCount(
            videoInputDevices.length
          );


          console.log(
            "[QR CHECKPOINT 4 PASSED] ZXing found",
            videoInputDevices.length,
            "camera(s)."
          );


          /*
           * ======================================================
           * CHECKPOINT 5
           *
           * Choose an ACTUAL deviceId.
           *
           * No facingMode.
           * ======================================================
           */

          const environmentCamera =
            videoInputDevices.find(
              (device) =>
                /back|rear|environment/i.test(
                  device.label
                )
            );


          const selectedDevice =
            environmentCamera ||
            videoInputDevices[0];


          if (!selectedDevice) {

            throw new Error(
              "Unable to select a camera device."
            );

          }


          console.log(
            "[QR CHECKPOINT 5 PASSED] Selected camera:",
            selectedDevice
          );


          setCameraName(
            selectedDevice.label ||
              "Camera"
          );


          setDiagnostic(
            `CHECKPOINT 5 PASSED: Using ${selectedDevice.label || "camera"}.`
          );


          /*
           * ======================================================
           * CHECKPOINT 6
           *
           * THIS is the important part from the GitHub example.
           *
           * Give ZXing the real device ID.
           * Do not create constraints ourselves.
           * ======================================================
           */

          console.log(
            "[QR CHECKPOINT 6] Starting continuous ZXing decode..."
          );


          setDiagnostic(
            "CHECKPOINT 6: Starting camera decoder..."
          );


          const controls =
            await reader.decodeFromVideoDevice(
              selectedDevice.deviceId,
              video,

              async (
                result,
                error,
                callbackControls
              ) => {

                /*
                 * Keep the controls as soon as they're
                 * available.
                 */
                if (
                  !controlsRef.current &&
                  callbackControls
                ) {

                  controlsRef.current =
                    callbackControls;

                }


                /*
                 * No QR found in this frame.
                 *
                 * This is normal.
                 *
                 * NotFoundException, ChecksumException
                 * and FormatException are expected during
                 * continuous scanning.
                 */
                if (!result) {

                  if (
                    error
                  ) {

                    /*
                     * Only log unexpected errors.
                     *
                     * The expected QR-search exceptions
                     * are deliberately ignored.
                     */

                    const errorName =
                      error?.name;

                    if (
                      errorName !==
                        "NotFoundException" &&
                      errorName !==
                        "ChecksumException" &&
                      errorName !==
                        "FormatException"
                    ) {

                      console.debug(
                        "[ZXING FRAME] Decode issue:",
                        error
                      );

                    }

                  }

                  return;
                }


                /*
                 * ==================================================
                 * QR FOUND
                 * ==================================================
                 */

                console.log(
                  "[QR CHECKPOINT 7 PASSED] QR FOUND:",
                  result.getText()
                );


                await verifyTicket(
                  result.getText()
                );

              }
            );


          controlsRef.current =
            controls;


          /*
           * ======================================================
           * CHECKPOINT 6 PASSED
           * ======================================================
           */

          console.log(
            "[QR CHECKPOINT 6 PASSED] ZXing camera decoder started."
          );


          /*
           * ======================================================
           * CHECKPOINT 7
           * Confirm video stream.
           * ======================================================
           */

          const stream =
            video.srcObject as
              | MediaStream
              | null;


          if (
            stream
          ) {

            const track =
              stream.getVideoTracks()[0];


            if (
              track
            ) {

              const settings =
                track.getSettings();


              console.log(
                "[QR CHECKPOINT 7] Active video track:",
                {
                  label:
                    track.label,

                  deviceId:
                    settings.deviceId,

                  width:
                    settings.width,

                  height:
                    settings.height,

                  frameRate:
                    settings.frameRate,
                }
              );


              setCameraName(
                track.label ||
                  selectedDevice.label ||
                  "Camera"
              );

            }

          }


          console.log(
            "[QR CHECKPOINT 7] Video element:",
            {
              srcObject:
                Boolean(
                  video.srcObject
                ),

              readyState:
                video.readyState,

              width:
                video.videoWidth,

              height:
                video.videoHeight,

              paused:
                video.paused,

              autoplay:
                video.autoplay,

              playsInline:
                video.playsInline,
            }
          );


          if (
            video.videoWidth === 0 ||
            video.videoHeight === 0
          ) {

            throw new Error(
              "ZXing started, but the video element has no frames."
            );

          }


          setScanState(
            "scanning"
          );

          setMessage("");


          setDiagnostic(
            `CHECKPOINT 7 PASSED: Scanner live on ${cameraName || selectedDevice.label || "camera"}.`
          );


          console.log(
            "[QR CHECKPOINT 7 PASSED] CAMERA IS FULLY RUNNING."
          );


          console.log(
            "=========================================="
          );


        } catch (
          error: unknown
        ) {

          console.error(
            "[ZXING START FAILED]",
            error
          );


          stopScanner();


          if (
            mountedRef.current
          ) {

            setScanState(
              "error"
            );

            setMessage(
              error instanceof Error
                ? error.message
                : "Unable to start the QR scanner."
            );

            setDiagnostic(
              "SCANNER START FAILED. See console for the exact checkpoint."
            );

          }

        } finally {

          startingRef.current =
            false;

        }

      },
      [
        stopScanner,
        verifyTicket,
      ]
    );


  /*
   * ============================================================
   * COMPONENT LIFECYCLE
   * ============================================================
   */

  useEffect(() => {

    mountedRef.current =
      true;


    console.log(
      "[ZXING LIFECYCLE] Scanner mounted."
    );


    return () => {

      mountedRef.current =
        false;


      console.log(
        "[ZXING LIFECYCLE] Scanner unmounting."
      );


      stopScanner();

    };

  }, [stopScanner]);


  /*
   * ============================================================
   * RESET
   * ============================================================
   */

  const handleRestart =
    () => {

      stopScanner();

      processingRef.current =
        false;

      setScanState(
        "idle"
      );

      setMessage("");

      setScannedAt(null);

      setCameraName("");

      setDiagnostic(
        "CHECKPOINT 0: Scanner reset."
      );

    };


  /*
   * ============================================================
   * UI
   * ============================================================
   */

  return (
    <main className="min-h-screen bg-[#0A0A0A] px-4 py-8 text-bone sm:px-6">

      <div className="mx-auto flex min-h-[90vh] max-w-lg flex-col justify-center">


        {/* HEADER */}

        <div className="mb-8 text-center">

          <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-gold">
            Chill & Vibes
          </p>

          <h1 className="text-3xl font-extrabold sm:text-4xl">
            Gate Scanner
          </h1>

          <p className="mt-3 text-sm text-mute">
            Scan a guest ticket QR code to verify entry.
          </p>

        </div>


        {/* DIAGNOSTIC */}

        <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-center">

          <p className="text-xs text-mute">
            Scanner diagnostic
          </p>

          <p className="mt-1 text-xs font-semibold text-gold">
            {diagnostic}
          </p>

          {cameraCount > 0 && (
            <p className="mt-2 text-[10px] text-mute">
              {cameraCount} camera
              {cameraCount === 1
                ? ""
                : "s"} detected
            </p>
          )}

          {cameraName && (
            <p className="mt-1 text-[10px] text-mute">
              Camera: {cameraName}
            </p>
          )}

        </div>


        {/* CAMERA */}

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-4 shadow-glass">

          <div className="relative overflow-hidden rounded-2xl bg-black">

            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className={`aspect-square w-full object-cover ${
                scanState === "idle"
                  ? "hidden"
                  : "block"
              }`}
            />


            {scanState === "scanning" && (

              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">

                <div className="h-64 w-64 rounded-3xl border-2 border-gold/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />

              </div>

            )}


            {scanState === "idle" && (

              <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/20 px-6 text-center">

                <div className="mb-5 grid h-16 w-16 place-items-center rounded-full bg-gold/10 text-gold">

                  <HiOutlineCamera
                    size={32}
                  />

                </div>

                <h2 className="text-lg font-bold">
                  Ready to Scan
                </h2>

                <p className="mt-2 max-w-xs text-sm text-mute">
                  Position the guest's QR code inside
                  the scanning frame.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    void startScanner()
                  }
                  className="btn-gold mt-6 w-full"
                >
                  Start Scanner
                </button>

              </div>

            )}


            {scanState === "starting" && (

              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm">

                <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-gold/20 border-t-gold" />

                <p className="text-sm font-semibold text-gold">
                  Starting camera...
                </p>

              </div>

            )}


            {scanState === "processing" && (

              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm">

                <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-gold/20 border-t-gold" />

                <p className="text-sm font-semibold text-gold">
                  Verifying ticket...
                </p>

              </div>

            )}

          </div>

        </div>


        {/* APPROVED */}

        {scanState === "approved" && (

          <div className="mt-6 rounded-3xl border border-green-500/30 bg-green-500/[0.08] p-6 text-center">

            <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-green-500/10 text-green-400">

              <HiOutlineCheckCircle
                size={40}
              />

            </div>

            <h2 className="text-2xl font-extrabold text-green-400">
              ENTRY APPROVED
            </h2>

            <p className="mt-2 text-sm text-bone/80">
              {message}
            </p>

            {scannedAt && (

              <p className="mt-3 text-xs text-mute">
                Scanned at{" "}
                {new Date(
                  scannedAt
                ).toLocaleString()}
              </p>

            )}

            <button
              type="button"
              onClick={
                handleRestart
              }
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-bone"
            >

              <HiOutlineRefresh
                size={18}
              />

              Scan Next Ticket

            </button>

          </div>

        )}


        {/* REJECTED */}

        {scanState === "rejected" && (

          <div className="mt-6 rounded-3xl border border-red-500/30 bg-red-500/[0.08] p-6 text-center">

            <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-red-500/10 text-red-400">

              <HiOutlineExclamationCircle
                size={40}
              />

            </div>

            <h2 className="text-2xl font-extrabold text-red-400">
              ENTRY REJECTED
            </h2>

            <p className="mt-2 text-sm text-bone/80">
              {message}
            </p>

            <button
              type="button"
              onClick={
                handleRestart
              }
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-bone"
            >

              <HiOutlineRefresh
                size={18}
              />

              Scan Again

            </button>

          </div>

        )}


        {/* ERROR */}

        {scanState === "error" && (

          <div className="mt-6 rounded-3xl border border-orange-500/30 bg-orange-500/[0.08] p-6 text-center">

            <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-orange-500/10 text-orange-400">

              <HiOutlineExclamationCircle
                size={40}
              />

            </div>

            <h2 className="text-2xl font-extrabold text-orange-400">
              SCANNER ERROR
            </h2>

            <p className="mt-2 text-sm text-bone/80">
              {message}
            </p>

            <button
              type="button"
              onClick={
                handleRestart
              }
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-bone"
            >

              <HiOutlineRefresh
                size={18}
              />

              Try Again

            </button>

          </div>

        )}

        <p className="mt-8 text-center text-xs text-mute">
          Each valid ticket can only be scanned once.
        </p>

      </div>

    </main>
  );
};


export default Scanner;
