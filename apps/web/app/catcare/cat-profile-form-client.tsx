"use client";

import {
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type RefObject
} from "react";

import {
  catBreedOptions,
  catGenderOptions,
  getCatBreedOption,
  getCatIllustrationSrc,
  getLifeStageFromBirthDate,
  type CatGender,
  type CatLifeStage
} from "@/lib/catcare/cat-profile-options";
import type { Locale } from "@/lib/i18n";

import {
  CatCareArrowLeftIcon,
  CatCareBowlActionIcon,
  CatCareCalendarIcon,
  CatCareChevronDownIcon,
  CatCareSaveIcon,
  CatCareSearchIcon,
  CatCareUploadIcon
} from "./catcare-action-icons";
import {
  catCareInputClass,
  CatCareBottomActions,
  CatCareButton,
  CatCareField,
  CatCarePanel,
  CatCareStepBar
} from "./owner-flow-components";

type CatProfileFormCat = {
  id: string;
  name: string;
  gender: CatGender | null;
  birthDate: string | null;
  lifeStage: CatLifeStage | null;
  breed: string | null;
  weightKg: number | null;
  photoUrl: string | null;
  safetyNotes: string | null;
  notes: string | null;
};

type CatProfileFormAction = (formData: FormData) => void | Promise<void>;

type CatProfileFormErrors = Partial<
  Record<"birthDate" | "breed" | "name" | "weight", string>
>;

const genderLabels: Record<CatGender, string> = {
  female: "母猫",
  male: "公猫",
  unknown: "不确定"
};

const lifeStageLabels: Record<CatLifeStage, string> = {
  adult: "成年",
  kitten: "幼猫",
  senior: "老年",
  unknown: "未知"
};

const englishGenderLabels: Record<CatGender, string> = {
  female: "Female",
  male: "Male",
  unknown: "Not sure"
};

const englishLifeStageLabels: Record<CatLifeStage, string> = {
  adult: "Adult",
  kitten: "Kitten",
  senior: "Senior",
  unknown: "Unknown"
};

function copy(locale: Locale) {
  const en = locale === "en";

  return {
    back: en ? "Back to profiles" : "返回多猫档案",
    birthDate: en ? "Birth date" : "生日日期",
    breed: en ? "Breed" : "品种",
    breedHelper: en
      ? "Search and choose from common household and recognised breeds."
      : "搜索并选择常见家猫与专业机构认可的主流品种。",
    breedInvalid: en
      ? "Choose a breed from the list, or select Not sure."
      : "请从列表中选择品种，或选择“不确定”。",
    complete: en ? "Complete" : "完成",
    gender: en ? "Gender" : "性别",
    name: en ? "Cat name" : "猫咪姓名",
    nameRequired: en ? "Enter the cat name." : "请输入猫咪姓名。",
    noBreed: en ? "No matching breed" : "没有匹配的品种",
    nextMonth: en ? "Next month" : "下个月",
    photoHelper: en
      ? "Breed illustration is used by default. Uploaded photo takes priority."
      : "默认按品种匹配插画；上传照片后优先使用照片。",
    photoPick: en ? "Change photo" : "更换照片",
    photoReset: en ? "Use breed illustration" : "恢复品种插画",
    previousMonth: en ? "Previous month" : "上个月",
    preview: en ? "Preview" : "猫咪预览",
    required: en ? "Required" : "必填",
    birthDateInvalid: en
      ? "Choose a birth date that is not in the future."
      : "请选择不晚于今天的生日日期。",
    save: en ? "Save profile" : "保存档案",
    saveChanges: en ? "Save changes" : "保存修改",
    safety: en ? "Safety notes" : "安全与注意事项",
    safetyPlaceholder: en
      ? "Diet, temperament, restrictions, allergies, or temporary care notes..."
      : "饮食、性格、禁忌或临时注意事项，例如：对某些食物过敏、胆小怕生等...",
    searchBreed: en ? "Search breed" : "搜索品种",
    setRoutine: en ? "Save and set routine" : "保存并设置喂养习惯",
    stepHealth: en ? "Safety and health" : "安全与健康",
    stepInfo: en ? "Basic information" : "基本信息",
    title: en ? "Basic information" : "基础信息",
    today: en ? "Today" : "今天",
    uploadChosen: en ? "Photo selected" : "已选择照片",
    uploadPriority: en
      ? "Your uploaded photo stays when the breed changes."
      : "已上传照片会在更换品种时保留。",
    weight: en ? "Weight" : "体重",
    weightInvalid: en
      ? "Enter a weight from 0.1 to 30 kg."
      : "请输入 0.1 到 30 kg 的体重。"
  };
}

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDateDisplay(value: string) {
  return value.replace(/-/g, "/");
}

function parseDateInput(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  return new Date(year, month - 1, day);
}

function getMonthDays(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: Array<Date | null> = [];

  for (let index = 0; index < startOffset; index += 1) {
    days.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    days.push(new Date(year, month, day));
  }

  while (days.length % 7 !== 0) {
    days.push(null);
  }

  return days;
}

export function CatProfileFormClient({
  action,
  cat,
  locale,
  mode
}: {
  action: CatProfileFormAction;
  cat?: CatProfileFormCat;
  locale: Locale;
  mode: "create" | "edit";
}) {
  const labels = copy(locale);
  const initialBreed = getCatBreedOption(cat?.breed);
  const initialPhoto = cat?.photoUrl ?? getCatIllustrationSrc(initialBreed.illustration);
  const initialHasUploadedPhoto =
    !!cat?.photoUrl && !cat.photoUrl.startsWith("/catcare/cats/");
  const initialGender = cat?.gender === "female" ? "female" : "male";
  const initialBirthDate = cat?.birthDate ?? "2021-06-20";
  const initialWeight = cat?.weightKg ? String(cat.weightKg) : "4.5";
  const [birthDate, setBirthDate] = useState(initialBirthDate);
  const [breedId, setBreedId] = useState(initialBreed.id);
  const [breedQuery, setBreedQuery] = useState<string>(
    locale === "en" ? initialBreed.labelEn : initialBreed.label
  );
  const [breedOpen, setBreedOpen] = useState(false);
  const [gender, setGender] = useState<CatGender>(initialGender);
  const [name, setName] = useState(cat?.name ?? "奶茶");
  const [photoFileName, setPhotoFileName] = useState("");
  const [photoPreview, setPhotoPreview] = useState(initialPhoto);
  const [preserveUploadedPhoto, setPreserveUploadedPhoto] =
    useState(initialHasUploadedPhoto);
  const [weight, setWeight] = useState(initialWeight);
  const [formErrors, setFormErrors] = useState<CatProfileFormErrors>({});
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() =>
    parseDateInput(initialBirthDate)
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedBreed = getCatBreedOption(breedId);
  const defaultPhoto = getCatIllustrationSrc(selectedBreed.illustration);
  const photoUrl =
    preserveUploadedPhoto && photoPreview !== defaultPhoto ? cat?.photoUrl ?? defaultPhoto : defaultPhoto;
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const lifeStage = getLifeStageFromBirthDate(birthDate);
  const filteredBreeds = useMemo(() => {
    const query = breedQuery.trim().toLowerCase();
    const options = query
      ? catBreedOptions.filter((breed) => {
          const target = `${breed.label} ${breed.labelEn} ${breed.englishName}`.toLowerCase();
          return target.includes(query);
        })
      : catBreedOptions;

    return options.slice(0, 10);
  }, [breedQuery]);

  function isSelectedBreedQueryValid() {
    const query = breedQuery.trim().toLowerCase();
    const breed = getCatBreedOption(breedId);

    return [breed.label, breed.labelEn, breed.englishName]
      .map((value) => value.toLowerCase())
      .includes(query);
  }

  function validateForm() {
    const nextErrors: CatProfileFormErrors = {};
    const numericWeight = Number(weight);

    if (!name.trim()) {
      nextErrors.name = labels.nameRequired;
    }

    if (!birthDate || birthDate > today) {
      nextErrors.birthDate = labels.birthDateInvalid;
    }

    if (!isSelectedBreedQueryValid()) {
      nextErrors.breed = labels.breedInvalid;
    }

    if (
      weight &&
      (!Number.isFinite(numericWeight) || numericWeight <= 0 || numericWeight > 30)
    ) {
      nextErrors.weight = labels.weightInvalid;
    }

    setFormErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!validateForm()) {
      event.preventDefault();
    }
  }

  function selectBreed(nextBreedId: string) {
    const nextBreed = getCatBreedOption(nextBreedId);
    setBreedId(nextBreed.id);
    setBreedQuery(locale === "en" ? nextBreed.labelEn : nextBreed.label);
    setBreedOpen(false);
    setFormErrors((errors) => ({ ...errors, breed: undefined }));

    if (!preserveUploadedPhoto) {
      setPhotoPreview(getCatIllustrationSrc(nextBreed.illustration));
    }
  }

  function handleBreedSearch(value: string) {
    setBreedQuery(value);
    setBreedOpen(true);

    const exact = catBreedOptions.find(
      (breed) =>
        breed.label === value ||
        breed.labelEn.toLowerCase() === value.toLowerCase() ||
        breed.englishName.toLowerCase() === value.toLowerCase()
    );

    if (exact) {
      setBreedId(exact.id);
      setFormErrors((errors) => ({ ...errors, breed: undefined }));
      if (!preserveUploadedPhoto) {
        setPhotoPreview(getCatIllustrationSrc(exact.illustration));
      }
      return;
    }

    setBreedId("unknown");
    setFormErrors((errors) => ({ ...errors, breed: labels.breedInvalid }));
    if (!preserveUploadedPhoto) {
      const fallback = getCatBreedOption("unknown");
      setPhotoPreview(getCatIllustrationSrc(fallback.illustration));
    }
  }

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];

    if (!file) {
      return;
    }

    setPhotoFileName(file.name);
    setPreserveUploadedPhoto(true);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function restoreBreedIllustration() {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setPhotoFileName("");
    setPreserveUploadedPhoto(false);
    setPhotoPreview(defaultPhoto);
  }

  function updateWeight(value: string) {
    const cleaned = value.replace(/[^\d.]/g, "");
    const hasDecimalPoint = cleaned.includes(".");
    const [whole = "", decimal = ""] = cleaned.split(".");
    const normalizedWhole = whole || (hasDecimalPoint ? "0" : "");
    const normalized = hasDecimalPoint
      ? `${normalizedWhole}.${decimal.slice(0, 1)}`
      : normalizedWhole;
    const numericWeight = Number(normalized);

    setWeight(Number.isFinite(numericWeight) && numericWeight > 30 ? "30" : normalized);
    setFormErrors((errors) => ({ ...errors, weight: undefined }));
  }

  return (
    <form
      action={action}
      className="mx-auto grid w-full max-w-[1196px] gap-7"
      onSubmit={handleSubmit}
    >
      {cat ? <input name="id" type="hidden" value={cat.id} /> : null}
      <input name="breed" type="hidden" value={breedId} />
      <input name="photoUrl" type="hidden" value={photoUrl} />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CatCareStepBar
          steps={[
            { active: true, label: labels.stepInfo },
            { label: labels.stepHealth },
            { label: labels.complete }
          ]}
        />
        <CatCareButton href="/catcare/cats" variant="ghost">
          <CatCareArrowLeftIcon />
          {labels.back}
        </CatCareButton>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_332px]">
        <CatCarePanel>
          <div className="mb-7 flex items-baseline gap-3">
            <h2 className="text-2xl font-semibold text-[#101a32]">
              {labels.title}
            </h2>
            <p className="text-base font-semibold text-[#526177]">
              {labels.required}
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <CatCareField error={formErrors.name} label={labels.name}>
              <input
                className={catCareInputClass}
                maxLength={80}
                name="name"
                onChange={(event) => {
                  setName(event.currentTarget.value);
                  setFormErrors((errors) => ({ ...errors, name: undefined }));
                }}
                required
                value={name}
              />
            </CatCareField>

            <CatCareField label={labels.gender}>
              <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-[#d9e0ea] bg-[#f8fbfa] p-1">
                {catGenderOptions.filter((option) => option.id !== "unknown").map((option) => {
                  const active = gender === option.id;
                  return (
                    <label
                      className={`flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-2 text-sm font-semibold transition sm:px-3 sm:text-base ${
                        active
                          ? "bg-white text-[#07847f] shadow-sm"
                          : "text-[#526177] hover:text-[#243653]"
                      }`}
                      key={option.id}
                    >
                      <input
                        checked={active}
                        className="sr-only"
                        name="gender"
                        onChange={() => setGender(option.id)}
                        required
                        type="radio"
                        value={option.id}
                      />
                      {locale === "en" ? option.labelEn : option.label}
                    </label>
                  );
                })}
              </div>
            </CatCareField>

            <CatCareField error={formErrors.birthDate} label={labels.birthDate}>
              <div
                className="relative"
                onBlur={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget)) {
                    setDatePickerOpen(false);
                  }
                }}
              >
                <input name="birthDate" type="hidden" value={birthDate} />
                <button
                  aria-expanded={datePickerOpen}
                  className={`${catCareInputClass} flex items-center justify-between gap-4 px-5 text-left`}
                  onClick={() => setDatePickerOpen((open) => !open)}
                  type="button"
                >
                  <span className="flex min-w-0 items-center gap-4">
                    <CatCareCalendarIcon className="h-5 w-5 shrink-0 text-[#07847f]" />
                    <span>{formatDateDisplay(birthDate)}</span>
                  </span>
                  <CatCareChevronDownIcon className="h-5 w-5 shrink-0 text-[#07847f]" />
                </button>
                {datePickerOpen ? (
                  <CatCareDatePicker
                    labels={labels}
                    locale={locale}
                    maxDate={today}
                    onMonthChange={setVisibleMonth}
                    onSelect={(nextDate) => {
                      setBirthDate(nextDate);
                      setVisibleMonth(parseDateInput(nextDate));
                      setDatePickerOpen(false);
                      setFormErrors((errors) => ({
                        ...errors,
                        birthDate: undefined
                      }));
                    }}
                    selectedDate={birthDate}
                    visibleMonth={visibleMonth}
                  />
                ) : null}
              </div>
            </CatCareField>

            <CatCareField error={formErrors.breed} label={labels.breed}>
              <div className="relative">
                <CatCareSearchIcon className="pointer-events-none absolute left-4 top-5 h-5 w-5 text-[#07847f]" />
                <input
                  aria-autocomplete="list"
                  aria-expanded={breedOpen}
                  className={`${catCareInputClass} pr-12 pl-12`}
                  onBlur={() => window.setTimeout(() => setBreedOpen(false), 120)}
                  onChange={(event) => handleBreedSearch(event.currentTarget.value)}
                  onFocus={() => setBreedOpen(true)}
                  placeholder={labels.searchBreed}
                  role="combobox"
                  value={breedQuery}
                />
                <CatCareChevronDownIcon className="pointer-events-none absolute right-4 top-5 h-5 w-5 text-[#07847f]" />
                {breedOpen ? (
                  <div className="absolute z-20 mt-2 max-h-72 w-full overflow-auto rounded-xl border border-[#d9e0ea] bg-white p-2 shadow-xl shadow-slate-900/10">
                    {filteredBreeds.length > 0 ? (
                      filteredBreeds.map((breed) => (
                        <button
                          className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-3 text-left transition hover:bg-[#eef8f4] ${
                            breed.id === breedId ? "bg-[#eef8f4]" : ""
                          }`}
                          key={breed.id}
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => selectBreed(breed.id)}
                          type="button"
                        >
                          <span className="font-semibold text-[#16233b]">
                            {locale === "en" ? breed.labelEn : breed.label}
                          </span>
                          <span className="shrink-0 text-xs font-semibold uppercase tracking-normal text-[#7b8798]">
                            {breed.group}
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-4 text-sm font-semibold text-[#526177]">
                        {labels.noBreed}
                      </div>
                    )}
                  </div>
                ) : null}
                <p className="mt-2 text-xs font-medium leading-5 text-[#6d7890]">
                  {labels.breedHelper}
                </p>
              </div>
            </CatCareField>

            <CatCareField error={formErrors.weight} label={labels.weight}>
              <div className="flex h-14 overflow-hidden rounded-xl border border-[#d9e0ea] bg-white focus-within:border-[#07847f] focus-within:ring-4 focus-within:ring-[#07847f]/10">
                <input
                  className="h-14 min-w-0 flex-1 px-5 text-base font-semibold leading-none text-[#16233b] outline-none"
                  inputMode="decimal"
                  maxLength={4}
                  name="weightKg"
                  onChange={(event) => updateWeight(event.currentTarget.value)}
                  pattern="^(?:[1-9]|[12]\d|30)(?:\.\d)?$"
                  placeholder="4.5"
                  value={weight}
                />
                <span className="flex w-16 items-center justify-center border-l border-[#d9e0ea] text-base font-semibold text-[#243653]">
                  kg
                </span>
              </div>
            </CatCareField>

          </div>

          <div className="mt-7 grid gap-6">
            <CatCareField label={labels.safety}>
              <textarea
                className={`${catCareInputClass} min-h-36 resize-none py-4`}
                defaultValue={cat?.safetyNotes ?? ""}
                maxLength={2000}
                name="safetyNotes"
                placeholder={labels.safetyPlaceholder}
              />
            </CatCareField>
            <input
              name="notes"
              type="hidden"
              value={cat?.notes ?? "Created from CatCare owner cat profile flow."}
            />
          </div>
        </CatCarePanel>

        <CatProfilePreview
          birthDate={birthDate}
          breedLabel={locale === "en" ? selectedBreed.labelEn : selectedBreed.label}
          gender={gender}
          lifeStage={lifeStage}
          locale={locale}
          labels={labels}
          fileInputRef={fileInputRef}
          name={name}
          onPhotoChange={handlePhotoChange}
          photoFileName={photoFileName}
          photoSrc={photoPreview}
          showRestorePhoto={preserveUploadedPhoto}
          onRestorePhoto={restoreBreedIllustration}
          weight={weight}
        />
      </div>

      <CatCareBottomActions>
        <CatCareButton href="/catcare/cats" variant="ghost">
          <CatCareArrowLeftIcon />
          {labels.back}
        </CatCareButton>
        <CatCareButton name="intent" type="submit" value="view" variant="secondary">
          <CatCareSaveIcon />
          {mode === "create" ? labels.save : labels.saveChanges}
        </CatCareButton>
        <CatCareButton name="intent" type="submit" value="routine">
          <CatCareBowlActionIcon />
          {labels.setRoutine}
        </CatCareButton>
      </CatCareBottomActions>
    </form>
  );
}

function CatProfilePreview({
  birthDate,
  breedLabel,
  gender,
  labels,
  fileInputRef,
  lifeStage,
  locale,
  name,
  onPhotoChange,
  onRestorePhoto,
  photoFileName,
  photoSrc,
  showRestorePhoto,
  weight
}: {
  birthDate: string | null;
  breedLabel: string;
  fileInputRef: RefObject<HTMLInputElement | null>;
  gender: CatGender;
  labels: ReturnType<typeof copy>;
  lifeStage: CatLifeStage;
  locale: Locale;
  name: string;
  onPhotoChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRestorePhoto: () => void;
  photoFileName: string;
  photoSrc: string;
  showRestorePhoto: boolean;
  weight: string;
}) {
  return (
    <CatCarePanel>
      <h2 className="text-xl font-semibold text-[#101a32]">{labels.preview}</h2>
      <div className="mt-6 grid justify-items-center text-center">
        <div className="relative">
          <img
            alt=""
            className="h-56 w-56 rounded-full bg-[#fff8f0] object-cover"
            src={photoSrc}
          />
          <input
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            name="photo"
            onChange={onPhotoChange}
            ref={fileInputRef}
            type="file"
          />
        </div>
        <button
          className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[#dff4ee] px-5 text-sm font-semibold text-[#07847f] transition hover:bg-[#cfeee5]"
          onClick={() => fileInputRef.current?.click()}
          type="button"
        >
          <CatCareUploadIcon className="h-4 w-4" />
          {labels.photoPick}
        </button>
        {showRestorePhoto ? (
          <button
            className="mt-2 inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[#d9e0ea] bg-white px-5 text-sm font-semibold text-[#526177] transition hover:border-[#07847f]/50 hover:bg-[#f7fbfa] [&>[data-catcare-action-icon]]:h-4 [&>[data-catcare-action-icon]]:w-4"
            onClick={onRestorePhoto}
            type="button"
          >
            <CatCareArrowLeftIcon />
            {labels.photoReset}
          </button>
        ) : null}
        <p className="mt-2 max-w-64 text-sm font-medium leading-5 text-[#6d7890]">
          {photoFileName
            ? `${labels.uploadChosen}: ${photoFileName}。${labels.uploadPriority}`
            : labels.photoHelper}
        </p>
        <div className="mt-5 flex max-w-full items-center justify-center gap-3">
          <h3 className="min-w-0 break-words text-3xl font-semibold leading-tight text-[#101a32]">
            {name}
          </h3>
          <span className="shrink-0 whitespace-nowrap rounded-full bg-[#dff4ee] px-3 py-1 text-sm font-semibold text-[#07847f]">
            {locale === "en" ? englishGenderLabels[gender] : genderLabels[gender]}
          </span>
        </div>
        <p className="mt-2 text-base font-medium text-[#526177]">
          {locale === "en"
            ? englishLifeStageLabels[lifeStage]
            : lifeStageLabels[lifeStage]}
        </p>
      </div>

      <div className="mt-7 rounded-xl border border-[#e2e6ee] bg-white px-4">
        {[
          [labels.birthDate, birthDate || (locale === "en" ? "Not set" : "未填写")],
          [labels.breed, breedLabel],
          [labels.weight, weight ? `${weight} kg` : locale === "en" ? "Not set" : "未填写"],
          [
            locale === "en" ? "Life stage" : "生命阶段",
            locale === "en"
              ? englishLifeStageLabels[lifeStage]
              : lifeStageLabels[lifeStage]
          ]
        ].map(([label, value]) => (
          <div
            className="flex min-h-14 items-center justify-between gap-4 border-b border-dashed border-[#e2e6ee] last:border-b-0"
            key={label}
          >
            <span className="text-sm font-semibold text-[#526177]">{label}</span>
            <span className="text-right text-sm font-semibold text-[#101a32]">
              {value}
            </span>
          </div>
        ))}
      </div>
    </CatCarePanel>
  );
}

function CatCareDatePicker({
  labels,
  locale,
  maxDate,
  onMonthChange,
  onSelect,
  selectedDate,
  visibleMonth
}: {
  labels: ReturnType<typeof copy>;
  locale: Locale;
  maxDate: string;
  onMonthChange: (date: Date) => void;
  onSelect: (date: string) => void;
  selectedDate: string;
  visibleMonth: Date;
}) {
  const max = parseDateInput(maxDate);
  const monthDays = getMonthDays(visibleMonth);
  const weekdays =
    locale === "en"
      ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      : ["日", "一", "二", "三", "四", "五", "六"];
  const monthTitle =
    locale === "en"
      ? visibleMonth.toLocaleDateString("en", { month: "long", year: "numeric" })
      : `${visibleMonth.getFullYear()}年${visibleMonth.getMonth() + 1}月`;

  function changeMonth(offset: number) {
    onMonthChange(
      new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + offset, 1)
    );
  }

  return (
    <div className="absolute left-0 z-30 mt-2 w-full max-w-[360px] rounded-2xl border border-[#d9e0ea] bg-white p-4 shadow-xl shadow-slate-900/10">
      <div className="flex items-center justify-between gap-3">
        <p className="text-base font-semibold text-[#101a32]">{monthTitle}</p>
        <div className="flex items-center gap-2">
          <button
            aria-label={labels.previousMonth}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#d9e0ea] text-[#07847f] transition hover:bg-[#eef8f4]"
            onClick={() => changeMonth(-1)}
            type="button"
          >
            <span aria-hidden="true" className="text-xl leading-none">
              ‹
            </span>
          </button>
          <button
            aria-label={labels.nextMonth}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#d9e0ea] text-[#07847f] transition hover:bg-[#eef8f4]"
            onClick={() => changeMonth(1)}
            type="button"
          >
            <span aria-hidden="true" className="text-xl leading-none">
              ›
            </span>
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center">
        {weekdays.map((weekday) => (
          <span
            className="flex h-8 items-center justify-center text-xs font-semibold text-[#6d7890]"
            key={weekday}
          >
            {weekday}
          </span>
        ))}
        {monthDays.map((date, index) => {
          if (!date) {
            return <span aria-hidden="true" key={`empty-${index}`} />;
          }

          const value = formatDateInput(date);
          const selected = value === selectedDate;
          const disabled = date > max;

          return (
            <button
              className={`flex h-9 items-center justify-center rounded-lg text-sm font-semibold transition ${
                selected
                  ? "bg-[#07847f] text-white shadow-sm shadow-teal-900/20"
                  : "text-[#16233b] hover:bg-[#eef8f4]"
              } ${disabled ? "cursor-not-allowed text-[#b8c1cf] hover:bg-transparent" : ""}`}
              disabled={disabled}
              key={value}
              onClick={() => onSelect(value)}
              type="button"
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      <button
        className="mt-4 inline-flex min-h-10 items-center justify-center rounded-lg bg-[#eef8f4] px-4 text-sm font-semibold text-[#07847f] transition hover:bg-[#dff4ee]"
        onClick={() => onSelect(maxDate)}
        type="button"
      >
        {labels.today}
      </button>
    </div>
  );
}
