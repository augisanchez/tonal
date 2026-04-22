import { useCallback, useMemo } from 'react';
import { useTonalStore } from './store/useTonalStore';
import { findFormat } from './data/formats';
import { FILM_STOCKS } from './data/filmStocks';
import { deriveZoneMarkers } from './hooks/useZoneEngine';
import { useCamera } from './hooks/useCamera';
import { useFrameAnalysis } from './hooks/useFrameAnalysis';
import { computeExposureRecommendation } from './hooks/useExposureRecommendation';

import {
  EVDisplay,
  ShadowWarningButton,
  HighlightWarningButton,
} from './components/header';
import {
  PreviewArea,
  ZoneMarker,
  SpotMarker,
  ClippingOverlay,
  FalseColorOverlay,
} from './components/viewfinder';
import { Histogram, PresetDots } from './components/readouts';
import {
  FilmInfoBar,
  ApertureSlider,
  ShutterSlider,
  IsoSlider,
  ExpCompSlider,
} from './components/controls';
import {
  FilmSelectionSheet,
  OnboardingCarousel,
  LandscapeOverlay,
} from './components/sheets';

function fovZoom(focalLength: number, standardFL: number): number {
  return Math.max(1, focalLength / standardFL);
}

/** Formats are stored in native (landscape) orientation. Phone is portrait,
 *  so aspects ≥ 1 invert for the viewfinder. */
function toPortraitAspect(nativeAspect: number): number {
  return nativeAspect >= 1 ? 1 / nativeAspect : nativeAspect;
}

export default function App() {
  // ── Store selectors ──────────────────────────────────────────────────
  const film = useTonalStore((s) => s.selectedFilm);
  const aperture = useTonalStore((s) => s.aperture);
  const shutter = useTonalStore((s) => s.shutter);
  const expComp = useTonalStore((s) => s.expComp);
  const formatKey = useTonalStore((s) => s.format);
  const aspectId = useTonalStore((s) => s.aspectRatioId);
  const focalLength = useTonalStore((s) => s.focalLength);
  const shadowWarning = useTonalStore((s) => s.shadowWarningEnabled);
  const highlightWarning = useTonalStore((s) => s.highlightWarningEnabled);
  const isFrozen = useTonalStore((s) => s.isFrozen);
  const toggleFrozen = useTonalStore((s) => s.toggleFrozen);
  const isApertureLocked = useTonalStore((s) => s.isApertureLocked);
  const isShutterLocked = useTonalStore((s) => s.isShutterLocked);
  const isIsoLocked = useTonalStore((s) => s.isIsoLocked);
  const calibrationMedianLog = useTonalStore((s) => s.calibrationMedianLog);
  const setCalibrationMedianLog = useTonalStore((s) => s.setCalibrationMedianLog);
  const isSpotModeActive = useTonalStore((s) => s.isSpotModeActive);
  const toggleSpotMode = useTonalStore((s) => s.toggleSpotMode);
  const spotPosition = useTonalStore((s) => s.spotPosition);
  const setSpotPosition = useTonalStore((s) => s.setSpotPosition);
  const isFalseColorActive = useTonalStore((s) => s.isFalseColorActive);
  const toggleFalseColor = useTonalStore((s) => s.toggleFalseColor);

  // ── Derived layout values ────────────────────────────────────────────
  const fmt = findFormat(formatKey);
  const aspectOpt = fmt.aspects.find((a) => a.id === aspectId) ?? fmt.aspects[0];
  const zoom = fovZoom(focalLength, aspectOpt.standardFL);
  const displayAspect = toPortraitAspect(aspectOpt.aspect);

  // ── Camera + scene analysis ──────────────────────────────────────────
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

  // ── Exposure recommendation ──────────────────────────────────────────
  const availableISOs = useMemo(
    () =>
      FILM_STOCKS.filter(
        (f) => f.manufacturer === film.manufacturer && f.film === film.film,
      )
        .map((f) => f.ei)
        .sort((a, b) => a - b),
    [film.manufacturer, film.film],
  );

  const rec = computeExposureRecommendation({
    aperture,
    shutter,
    iso: film.ei,
    expComp,
    medianLog: analysis?.medianLog ?? null,
    apertureLocked: isApertureLocked,
    shutterLocked: isShutterLocked,
    isoLocked: isIsoLocked,
    availableISOs,
    calibrationMedianLog,
  });

  const zones = deriveZoneMarkers(film, expComp, analysis);

  // ── Preview interactions ─────────────────────────────────────────────
  const handlePreviewTap = useCallback(
    (x: number, y: number) => {
      if (isSpotModeActive) {
        setSpotPosition({ x, y });
      } else {
        toggleFrozen();
      }
    },
    [isSpotModeActive, setSpotPosition, toggleFrozen],
  );

  const spotZone = useMemo(() => {
    if (!spotPosition || !analysis) return null;
    const col = Math.max(
      0,
      Math.min(analysis.gridW - 1, Math.floor(spotPosition.x * analysis.gridW)),
    );
    const row = Math.max(
      0,
      Math.min(analysis.gridH - 1, Math.floor(spotPosition.y * analysis.gridH)),
    );
    const z = analysis.cellZones[row * analysis.gridW + col];
    return z >= 0 ? z : null;
  }, [spotPosition, analysis]);

  const onToggleCalibration = useCallback(() => {
    if (calibrationMedianLog != null) {
      setCalibrationMedianLog(null);
      return;
    }
    if (analysis?.medianLog != null && Number.isFinite(analysis.medianLog)) {
      setCalibrationMedianLog(analysis.medianLog);
    }
  }, [calibrationMedianLog, analysis, setCalibrationMedianLog]);

  // ── Render ───────────────────────────────────────────────────────────
  return (
    <div className="h-[100svh] w-full bg-white text-ink font-sans flex justify-center overflow-hidden">
      {/* Hidden canvas lives here so useFrameAnalysis owns its dimensions. */}
      <canvas ref={canvasRef} className="hidden" />

      <div
        className="relative w-full max-w-[430px] h-full flex flex-col"
        style={{
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {/* Header — warnings flanking the reading */}
        <header className="shrink-0 flex items-start justify-between px-6 pt-2 pb-1">
          <ShadowWarningButton />
          <EVDisplay
            kelvin={analysis?.kelvin ?? 5500}
            sceneDRStops={analysis?.sceneDRStops ?? null}
            filmDRStops={film.totalDR}
            sceneEV={rec.sceneEV}
            deltaStops={rec.deltaStops}
            mode={rec.mode}
            isCalibrated={calibrationMedianLog != null}
            canCalibrate={analysis?.medianLog != null}
            onToggleCalibration={onToggleCalibration}
            isSpotModeActive={isSpotModeActive}
            onToggleSpotMode={toggleSpotMode}
            isFalseColorActive={isFalseColorActive}
            onToggleFalseColor={toggleFalseColor}
          />
          <HighlightWarningButton />
        </header>

        {/* Viewfinder — fills remaining vertical space */}
        <section className="flex-1 min-h-0 flex items-center justify-center px-6 py-2">
          <PreviewArea
            videoRef={videoRef}
            aspect={displayAspect}
            zoom={zoom}
            isReady={isReady}
            isPermissionDenied={isPermissionDenied}
            onRequestCamera={requestCamera}
            isFrozen={isFrozen}
            isSpotModeActive={isSpotModeActive}
            onTap={handlePreviewTap}
            overlay={
              <>
                <FalseColorOverlay analysis={analysis} active={isFalseColorActive} />
                <ClippingOverlay
                  analysis={analysis}
                  minZone={film.minZone}
                  maxZone={film.maxZone}
                  showShadow={shadowWarning}
                  showHighlight={highlightWarning}
                />
              </>
            }
          >
            {zones.map((z) => (
              <ZoneMarker key={`${z.zone}-${z.label}`} {...z} />
            ))}
            {spotPosition && (
              <SpotMarker x={spotPosition.x} y={spotPosition.y} zone={spotZone} />
            )}
          </PreviewArea>
        </section>

        {/* Readouts below the viewfinder */}
        <div className="shrink-0 px-6 pt-1">
          <Histogram
            analysis={analysis}
            filmMinZone={film.minZone}
            filmMaxZone={film.maxZone}
          />
        </div>
        <div className="shrink-0">
          <PresetDots />
        </div>

        {/* Film info + exposure controls */}
        <section className="shrink-0 px-6 flex flex-col gap-2 pb-4">
          <FilmInfoBar />
          <ApertureSlider effectiveValue={rec.aperture} isAuto={!isApertureLocked} />
          <ShutterSlider effectiveValue={rec.shutter} isAuto={!isShutterLocked} />
          <IsoSlider effectiveValue={rec.iso} isAuto={!isIsoLocked} />
          <ExpCompSlider />
        </section>
      </div>

      {/* Overlay surfaces */}
      <FilmSelectionSheet />
      <OnboardingCarousel />
      <LandscapeOverlay />
    </div>
  );
}
