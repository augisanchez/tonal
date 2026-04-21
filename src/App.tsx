import { useTonalStore } from './store/useTonalStore';
import { findFormat } from './data/formats';
import { deriveZoneMarkers } from './hooks/useZoneEngine';
import { useCamera } from './hooks/useCamera';
import { useFrameAnalysis } from './hooks/useFrameAnalysis';
import { PreviewArea } from './components/PreviewArea';
import { ZoneMarker } from './components/ZoneMarker';
import { ClippingOverlay } from './components/ClippingOverlay';
import { EVDisplay } from './components/EVDisplay';
import { ShadowWarningButton, HighlightWarningButton } from './components/WarningIcons';
import { FilmInfoBar } from './components/FilmInfoBar';
import { ApertureSlider } from './components/ApertureSlider';
import { ShutterSlider } from './components/ShutterSlider';
import { ExpCompSlider } from './components/ExpCompSlider';
import { FilmSelectionSheet } from './components/FilmSelectionSheet';

function fovZoom(focalLength: number, standardFL: number): number {
  return Math.max(1, focalLength / standardFL);
}

export default function App() {
  const film = useTonalStore((s) => s.selectedFilm);
  const expComp = useTonalStore((s) => s.expComp);
  const formatKey = useTonalStore((s) => s.format);
  const aspectId = useTonalStore((s) => s.aspectRatioId);
  const focalLength = useTonalStore((s) => s.focalLength);
  const shadowWarning = useTonalStore((s) => s.shadowWarningEnabled);
  const highlightWarning = useTonalStore((s) => s.highlightWarningEnabled);

  const fmt = findFormat(formatKey);
  const aspectOpt = fmt.aspects.find((a) => a.id === aspectId) ?? fmt.aspects[0];
  const zoom = fovZoom(focalLength, aspectOpt.standardFL);

  const { videoRef, canvasRef, isReady, isPermissionDenied, requestCamera } = useCamera();

  const analysis = useFrameAnalysis({
    videoRef,
    canvasRef,
    isReady,
    containerAspect: aspectOpt.aspect,
    zoom,
    film,
    expComp,
  });

  const zones = deriveZoneMarkers(film, expComp, analysis);

  return (
    <div className="min-h-[100svh] w-full bg-white text-ink font-sans flex justify-center">
      <canvas ref={canvasRef} className="hidden" />

      <div
        className="relative w-full max-w-[430px] flex flex-col items-stretch"
        style={{
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <header className="flex items-start justify-between px-6 pt-2 pb-1">
          <ShadowWarningButton />
          <EVDisplay
            kelvin={analysis?.kelvin ?? 5500}
            sceneDRStops={analysis?.sceneDRStops ?? null}
            filmDRStops={film.totalDR}
          />
          <HighlightWarningButton />
        </header>

        <section className="flex-1 flex flex-col items-center justify-center px-6 py-4">
          <PreviewArea
            videoRef={videoRef}
            aspect={aspectOpt.aspect}
            zoom={zoom}
            isReady={isReady}
            isPermissionDenied={isPermissionDenied}
            onRequestCamera={requestCamera}
            overlay={
              <ClippingOverlay
                analysis={analysis}
                minZone={film.minZone}
                maxZone={film.maxZone}
                showShadow={shadowWarning}
                showHighlight={highlightWarning}
              />
            }
          >
            {zones.map((z) => (
              <ZoneMarker key={`${z.zone}-${z.label}`} {...z} />
            ))}
          </PreviewArea>
        </section>

        <div className="flex items-center justify-center gap-2 pb-2" aria-hidden>
          <span className="w-2 h-2 rounded-full bg-ink" />
          <span className="w-2 h-2 rounded-full bg-grey-200" />
          <span className="text-[10px] text-grey-300 pl-1">+</span>
        </div>

        <section className="px-6 flex flex-col gap-3 pb-4">
          <FilmInfoBar />
          <ApertureSlider />
          <ShutterSlider />
          <ExpCompSlider />
        </section>
      </div>

      <FilmSelectionSheet />
    </div>
  );
}
