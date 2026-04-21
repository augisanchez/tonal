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

/** Formats are stored in native (landscape) orientation. Phone is portrait,
 *  so aspects ≥ 1 invert for the viewfinder. */
function toPortraitAspect(nativeAspect: number): number {
  return nativeAspect >= 1 ? 1 / nativeAspect : nativeAspect;
}

export default function App() {
  const film = useTonalStore((s) => s.selectedFilm);
  const expComp = useTonalStore((s) => s.expComp);
  const formatKey = useTonalStore((s) => s.format);
  const aspectId = useTonalStore((s) => s.aspectRatioId);
  const focalLength = useTonalStore((s) => s.focalLength);
  const shadowWarning = useTonalStore((s) => s.shadowWarningEnabled);
  const highlightWarning = useTonalStore((s) => s.highlightWarningEnabled);
  const isFrozen = useTonalStore((s) => s.isFrozen);
  const toggleFrozen = useTonalStore((s) => s.toggleFrozen);

  const fmt = findFormat(formatKey);
  const aspectOpt = fmt.aspects.find((a) => a.id === aspectId) ?? fmt.aspects[0];
  const zoom = fovZoom(focalLength, aspectOpt.standardFL);
  const displayAspect = toPortraitAspect(aspectOpt.aspect);

  const { videoRef, canvasRef, isReady, isPermissionDenied, requestCamera } = useCamera();

  const analysis = useFrameAnalysis({
    videoRef,
    canvasRef,
    isReady,
    containerAspect: displayAspect,
    zoom,
    film,
    expComp,
    active: !isFrozen,
  });

  const zones = deriveZoneMarkers(film, expComp, analysis);

  return (
    <div className="h-[100svh] w-full bg-white text-ink font-sans flex justify-center overflow-hidden">
      <canvas ref={canvasRef} className="hidden" />

      <div
        className="relative w-full max-w-[430px] h-full flex flex-col"
        style={{
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {/* Top bar — fixed height */}
        <header className="shrink-0 flex items-start justify-between px-6 pt-2 pb-1">
          <ShadowWarningButton />
          <EVDisplay
            kelvin={analysis?.kelvin ?? 5500}
            sceneDRStops={analysis?.sceneDRStops ?? null}
            filmDRStops={film.totalDR}
          />
          <HighlightWarningButton />
        </header>

        {/* Preview — fills whatever vertical space is left */}
        <section className="flex-1 min-h-0 flex items-center justify-center px-6 py-2">
          <PreviewArea
            videoRef={videoRef}
            aspect={displayAspect}
            zoom={zoom}
            isReady={isReady}
            isPermissionDenied={isPermissionDenied}
            onRequestCamera={requestCamera}
            isFrozen={isFrozen}
            onToggleFreeze={toggleFrozen}
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

        {/* Preset dots — fixed height */}
        <div className="shrink-0 flex items-center justify-center gap-2 py-1" aria-hidden>
          <span className="w-2 h-2 rounded-full bg-ink" />
          <span className="w-2 h-2 rounded-full bg-grey-200" />
          <span className="text-[10px] text-grey-300 pl-1">+</span>
        </div>

        {/* Controls — fixed height, never shrinks */}
        <section className="shrink-0 px-6 flex flex-col gap-2 pb-4">
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
