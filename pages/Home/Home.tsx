import { useRef, useEffect, useMemo } from "react";
import * as faceapi from "face-api.js";

function Home() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const cameraWidth = useMemo(() => {
    if (videoRef.current?.clientWidth) {
      console.log(videoRef.current.clientWidth);
      return videoRef.current?.clientWidth;
    }

    return 640;
  }, [videoRef.current?.clientWidth]);

  const cameraHeight = useMemo(() => {
    if (videoRef.current?.clientHeight) {
      return videoRef.current?.clientHeight;
    }

    return 480;
  }, [videoRef.current?.clientHeight]);

  useEffect(() => {
    startVideo();

    videoRef && loadModels();
  }, []);

  const loadModels = () => {
    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      faceapi.nets.faceExpressionNet.loadFromUri("/models"),
    ]).then(() => {
      faceDetection();
    });
  };

  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((currentStream) => {
        if (videoRef && videoRef.current)
          videoRef.current.srcObject = currentStream;
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const faceDetection = async () => {
    if (videoRef && videoRef.current && canvasRef && canvasRef.current) {
      setInterval(async () => {
        const detections = await faceapi
          .detectAllFaces(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions()
          )
          .withFaceLandmarks()
          .withFaceExpressions();

        if (canvasRef && canvasRef.current)
          canvasRef.current.innerHtml = faceapi.createCanvasFromMedia(
            videoRef.current
          );

        faceapi.matchDimensions(canvasRef.current, {
          width: cameraWidth,
          height: cameraHeight,
        });

        const resized = faceapi.resizeResults(detections, {
          width: cameraWidth,
          height: cameraHeight,
        });

        faceapi.draw.drawDetections(canvasRef.current, resized);
        faceapi.draw.drawFaceLandmarks(canvasRef.current, resized);
        faceapi.draw.drawFaceExpressions(canvasRef.current, resized);
      }, 100);
    }
  };

  return (
    <div className="app">
      <div className="app__video">
        <video crossOrigin="anonymous" ref={videoRef} autoPlay></video>
      </div>
      <canvas ref={canvasRef} className="app__canvas" />
    </div>
  );
}

export default Home;
