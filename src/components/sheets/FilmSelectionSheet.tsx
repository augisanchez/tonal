import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useTonalStore } from '../../store/useTonalStore';
import {
  CATEGORY_ORDER,
  CATEGORY_SHORT,
  FILM_STOCKS,
  groupFilmsByCategory,
  type FilmGroup,
} from '../../data/filmStocks';
import { FORMAT_SHORT, FORMATS, findFormat } from '../../data/formats';
import type { FilmCategory, FilmStock, FormatKey } from '../../types';
import { Pill, SectionHeader } from '../primitives';

// ── Sheet-local helpers ─────────────────────────────────────────────────

/** Horizontal scrolling strip used by tab and chip rows. Bleeds into the sheet's
 *  padding so the first/last item can sit flush with the edge. */
function ScrollRow({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return (
    <div
      className={`flex overflow-x-auto -mx-6 px-6 pb-0.5 scrollbar-none ${wide ? 'gap-2' : 'gap-1.5'}`}
      style={{ scrollbarWidth: 'none' }}
    >
      {children}
    </div>
  );
}

function FilmCard({
  group,
  selected,
  onClick,
}: {
  group: FilmGroup;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col gap-1.5 p-2 rounded-[10px] text-left border transition-colors ${
        selected ? 'border-ink bg-grey-100' : 'border-transparent active:bg-grey-100/60'
      }`}
    >
      <div className="w-full aspect-[4/3] rounded-[6px] bg-grey-100" aria-hidden />
      <div className="text-[13px] font-semibold tracking-tight leading-[16px]">{group.film}</div>
      <div className="text-[11px] text-ink-soft leading-[14px]">{group.manufacturer}</div>
    </button>
  );
}

function AspectCard({
  aspect,
  name,
  ratio,
  selected,
  onClick,
}: {
  aspect: number;
  name: string;
  ratio: string;
  selected: boolean;
  onClick: () => void;
}) {
  // Always render the rectangle in portrait orientation to match the viewfinder
  const portrait = aspect >= 1 ? 1 / aspect : aspect;
  const w = portrait >= 1 ? 52 : Math.round(52 * portrait);
  const h = portrait >= 1 ? Math.round(52 / portrait) : 52;

  return (
    <button
      onClick={onClick}
      className={`shrink-0 flex flex-col items-center gap-2 px-3 py-3 rounded-[10px] border min-w-[96px] transition-colors ${
        selected ? 'border-ink bg-grey-100' : 'border-grey-200 active:bg-grey-100/60'
      }`}
    >
      <div className="flex items-center justify-center h-[56px]">
        <div
          className={selected ? 'bg-ink' : 'bg-grey-300'}
          style={{ width: `${w}px`, height: `${h}px` }}
        />
      </div>
      <div className="text-[13px] font-semibold tracking-tight leading-tight text-center">
        {name}
      </div>
      <div className="text-[11px] text-ink-soft leading-none">{ratio}</div>
    </button>
  );
}

// ── Sheet ───────────────────────────────────────────────────────────────

export function FilmSelectionSheet() {
  const isOpen = useTonalStore((s) => s.isFilmSheetOpen);
  const close = useTonalStore((s) => s.closeFilmSheet);
  const selectedFilm = useTonalStore((s) => s.selectedFilm);
  const setFilm = useTonalStore((s) => s.setFilm);
  const formatKey = useTonalStore((s) => s.format);
  const setFormat = useTonalStore((s) => s.setFormat);
  const aspectId = useTonalStore((s) => s.aspectRatioId);
  const setAspectRatioId = useTonalStore((s) => s.setAspectRatioId);
  const focalLength = useTonalStore((s) => s.focalLength);
  const setFocalLength = useTonalStore((s) => s.setFocalLength);

  const [workingFilm, setWorkingFilm] = useState<FilmStock>(selectedFilm);
  const [category, setCategory] = useState<FilmCategory>(selectedFilm.category);
  const [workingFormat, setWorkingFormat] = useState<FormatKey>(formatKey);
  const [workingAspectId, setWorkingAspectId] = useState(aspectId);
  const [workingFocal, setWorkingFocal] = useState(focalLength);

  useEffect(() => {
    if (isOpen) {
      setWorkingFilm(selectedFilm);
      setCategory(selectedFilm.category);
      setWorkingFormat(formatKey);
      setWorkingAspectId(aspectId);
      setWorkingFocal(focalLength);
    }
  }, [isOpen, selectedFilm, formatKey, aspectId, focalLength]);

  const availableCategories = useMemo(
    () => CATEGORY_ORDER.filter((c) => FILM_STOCKS.some((f) => f.category === c)),
    [],
  );

  const groups = useMemo(() => groupFilmsByCategory(category), [category]);
  const currentGroup =
    groups.find(
      (g) => g.manufacturer === workingFilm.manufacturer && g.film === workingFilm.film,
    ) ?? groups[0];

  const fmtDef = findFormat(workingFormat);

  if (!isOpen) return null;

  const pickCategory = (c: FilmCategory) => {
    if (c === category) return;
    setCategory(c);
    const firstGroup = groupFilmsByCategory(c)[0];
    if (firstGroup) setWorkingFilm(firstGroup.stocks[0]);
  };

  const pickFilmGroup = (g: FilmGroup) => setWorkingFilm(g.stocks[0]);
  const pickEI = (stock: FilmStock) => setWorkingFilm(stock);

  const pickFormat = (key: FormatKey) => {
    if (key === workingFormat) return;
    const next = findFormat(key);
    setWorkingFormat(key);
    setWorkingAspectId(next.aspects[0].id);
    if (!next.focalLengths.includes(workingFocal)) {
      setWorkingFocal(next.aspects[0].standardFL);
    }
  };

  const pickAspect = (id: string) => setWorkingAspectId(id);
  const pickFocal = (mm: number) => setWorkingFocal(mm);

  const commitAndClose = () => {
    setFilm(workingFilm);
    if (workingFormat !== formatKey) setFormat(workingFormat);
    setAspectRatioId(workingAspectId);
    setFocalLength(workingFocal);
    close();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <button
        aria-label="Close film selection"
        onClick={close}
        className="absolute inset-0 bg-black/30"
      />

      <div className="relative bg-white rounded-t-[16px] max-h-[92vh] flex flex-col shadow-[0_-8px_24px_rgba(0,0,0,0.08)]">
        {/* Drag handle */}
        <div className="shrink-0 flex items-center justify-center pt-2 pb-1">
          <div className="w-9 h-1 rounded-full bg-grey-200" />
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 pt-2 pb-4 flex flex-col gap-6">
          {/* FILM */}
          <section className="flex flex-col gap-3">
            <SectionHeader>Film</SectionHeader>
            <ScrollRow>
              {availableCategories.map((c) => (
                <Pill
                  key={c}
                  variant="tab"
                  selected={category === c}
                  onClick={() => pickCategory(c)}
                >
                  {CATEGORY_SHORT[c]}
                </Pill>
              ))}
            </ScrollRow>
            <div className="grid grid-cols-3 gap-2">
              {groups.map((g) => (
                <FilmCard
                  key={g.key}
                  group={g}
                  selected={
                    g.manufacturer === workingFilm.manufacturer && g.film === workingFilm.film
                  }
                  onClick={() => pickFilmGroup(g)}
                />
              ))}
            </div>
          </section>

          {/* RATING / ISO */}
          {currentGroup && currentGroup.stocks.length > 1 && (
            <section className="flex flex-col gap-2">
              <SectionHeader>
                {category === 'digital' ? 'ISO' : 'Rating (Push / Pull)'}
              </SectionHeader>
              <div className="flex gap-1.5 flex-wrap">
                {currentGroup.stocks.map((s) => (
                  <Pill
                    key={s.id}
                    variant="chip"
                    selected={s.ei === workingFilm.ei}
                    onClick={() => pickEI(s)}
                  >
                    ISO {s.ei}
                  </Pill>
                ))}
              </div>
            </section>
          )}

          {/* FORMAT */}
          <section className="flex flex-col gap-3">
            <SectionHeader>Format</SectionHeader>
            <ScrollRow>
              {FORMATS.map((f) => (
                <Pill
                  key={f.key}
                  variant="tab"
                  selected={workingFormat === f.key}
                  onClick={() => pickFormat(f.key)}
                >
                  {FORMAT_SHORT[f.key]}
                </Pill>
              ))}
            </ScrollRow>
            <ScrollRow wide>
              {fmtDef.aspects.map((a) => (
                <AspectCard
                  key={a.id}
                  aspect={a.aspect}
                  name={a.name}
                  ratio={a.ratio}
                  selected={workingAspectId === a.id}
                  onClick={() => pickAspect(a.id)}
                />
              ))}
            </ScrollRow>
          </section>

          {/* FOCAL LENGTH */}
          <section className="flex flex-col gap-3">
            <SectionHeader>Focal Length</SectionHeader>
            <ScrollRow>
              {fmtDef.focalLengths.map((mm) => (
                <Pill
                  key={mm}
                  variant="chip"
                  selected={workingFocal === mm}
                  onClick={() => pickFocal(mm)}
                >
                  {mm}mm
                </Pill>
              ))}
            </ScrollRow>
          </section>
        </div>

        {/* Done — pinned to bottom */}
        <div
          className="shrink-0 px-6 pt-3"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}
        >
          <button
            onClick={commitAndClose}
            className="w-full bg-accent text-white rounded-[14px] py-3.5 px-5 text-[17px] font-semibold tracking-tight active:opacity-90"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
