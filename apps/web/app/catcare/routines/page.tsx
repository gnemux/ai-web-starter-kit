import Link from "next/link";
import { EmptyState, ErrorState } from "@xwlc/ui";

import {
  CatCareBowlActionIcon,
  CatCarePlusCircleIcon,
  CatCareSaveIcon
} from "../catcare-action-icons";
import { CatCareItemTypeIcon } from "../catcare-item-type-icon";
import { CatCareToast } from "../catcare-toast";
import { getCatCareContentContext } from "../catcare-shell";
import {
  CatCareButton,
  CatCarePanel
} from "../owner-flow-components";
import { copyCatCareRoutineAction, saveCatCareRoutineLocalAction } from "../actions";
import { BrandAutocompleteInput } from "./brand-autocomplete-input";
import {
  CustomRoutineItemsClient,
  type CustomRoutineItemDraft
} from "./custom-routine-items-client";
import { RoutineCatTabsClient } from "./routine-cat-tabs-client";
import { RoutineSaveForm } from "./routine-save-form-client";
import { RoutineScheduleControl } from "./routine-schedule-control";
import {
  getCatCareRoutineWorkspacePreload,
  type CatCareItem,
  type CatCareLibraryItem,
  type CatCareRoutine,
  type CatCareRoutineItem,
  type CatCareRoutineWorkspacePreload
} from "@/lib/catcare/product-service";

type RoutineSearchParams = Promise<{ cat_id?: string; copied?: string; saved?: string }>;

const routineCards = [
  {
    accent: "teal",
    aliases: [],
    category: "meal",
    iconType: "dry_food",
    key: "dry_food",
    subtitle: "每日主食",
    subtitleEn: "Daily staple",
    title: "主粮",
    titleEn: "Dry food"
  },
  {
    accent: "rose",
    aliases: [],
    category: "meal",
    iconType: "wet_food",
    key: "canned",
    subtitle: "湿粮加餐",
    subtitleEn: "Wet food",
    title: "罐头",
    titleEn: "Canned"
  },
  {
    accent: "amber",
    aliases: [],
    category: "treat",
    iconType: "treat",
    key: "treats",
    subtitle: "奖励与训练",
    subtitleEn: "Rewards",
    title: "零食",
    titleEn: "Treats"
  },
  {
    accent: "sky",
    category: "water",
    iconType: "water",
    key: "water",
    aliases: ["饮水"],
    subtitle: "换水清洁",
    subtitleEn: "Fresh water",
    title: "换水",
    titleEn: "Fresh water"
  },
  {
    accent: "violet",
    category: "litter",
    iconType: "litter",
    key: "litter",
    aliases: ["猫砂"],
    subtitle: "猫砂盆维护",
    subtitleEn: "Litter box",
    title: "清理猫砂",
    titleEn: "Litter cleanup"
  },
  {
    accent: "coral",
    aliases: [],
    category: "play",
    iconType: "play",
    key: "play",
    subtitle: "互动陪伴",
    subtitleEn: "Interaction",
    title: "陪玩",
    titleEn: "Play"
  }
] as const;

const fallbackValues = {
  canned: { brand: "", frequency: "weekly_3", instructions: "半罐", timeHint: "12:30,18:30,20:30" },
  dry_food: { brand: "", frequency: "daily_2", instructions: "50g", timeHint: "08:00,18:30" },
  litter: { brand: "", frequency: "daily", instructions: "铲 1 次", timeHint: "21:00" },
  play: { frequency: "daily", instructions: "15 分钟", timeHint: "19:00" },
  treats: { brand: "", frequency: "daily", instructions: "2-3 颗", timeHint: "18:30" },
  water: { frequency: "daily", instructions: "换新鲜水，全天保持清洁", timeHint: "" }
} as const;

const maxRoutineFrequencyCount = 12;

const fixedRoutineTitles: ReadonlySet<string> = new Set(
  routineCards.flatMap((card) => [card.title, ...(card.aliases ?? [])])
);

export default async function CatCareRoutinesPage({
  searchParams
}: {
  searchParams: RoutineSearchParams;
}) {
  const params = await searchParams;
  const [context, workspaceResult] = await Promise.all([
    getCatCareContentContext(),
    getCatCareRoutineWorkspacePreload(params.cat_id)
  ]);
  const locale = context.locale;

  return (
    <>
      {!workspaceResult.ok ? (
        <ErrorState
          badgeLabel="Needs review"
          description={`${workspaceResult.error.code}: ${workspaceResult.error.message}`}
          title="喂养习惯暂时不可用"
        />
      ) : !workspaceResult.data.selectedCat ? (
        <CatCarePanel>
          <EmptyState
            description={
              locale === "en"
                ? "Create a cat profile before setting reusable care routines."
                : "先创建猫咪档案，再设置可复用的喂养与照护习惯。"
            }
            title={locale === "en" ? "No cat profile yet" : "还没有猫咪档案"}
          />
          <div className="mt-6 flex justify-center">
            <CatCareButton href="/catcare/cats/new">
              <CatCarePlusCircleIcon />
              {locale === "en" ? "New cat profile" : "新建猫咪档案"}
            </CatCareButton>
          </div>
        </CatCarePanel>
      ) : (
        <RoutineWorkspace
          justCopied={params.copied === "1"}
          justSaved={params.saved === "1"}
          locale={locale}
          workspace={workspaceResult.data}
        />
      )}
    </>
  );
}

function RoutineWorkspace({
  justCopied,
  justSaved,
  locale,
  workspace
}: {
  justCopied: boolean;
  justSaved: boolean;
  locale: "zh" | "en";
  workspace: CatCareRoutineWorkspacePreload;
}) {
  const copy = {
    description:
      locale === "en"
        ? "Create reusable feeding and care tasks. Care plans will reference this routine."
        : "创建并保存可重复的喂养与照护任务，生成照护计划时会自动引用。",
    helper:
      locale === "en"
        ? "Temporary one-off events belong in Events, not in this reusable routine."
        : "临时换粮、洗澡、打疫苗等一次性事项，请通过「事件记录」添加。",
    saved:
      locale === "en"
        ? "Routine saved."
        : "习惯已保存。",
    copied:
      locale === "en"
        ? "Routine copied. Review the amount, products, and timing for this cat."
        : "已复制习惯。请按这只猫的体重、用品和时间再检查一遍。",
    save: locale === "en" ? "Save routine" : "保存习惯",
    saveNext:
      locale === "en"
        ? "Save and set items"
        : "保存并设置食物用品",
    title:
      locale === "en"
        ? "Reusable routine settings"
        : "可复用习惯设置",
  };
  const selectedCatId = workspace.selectedCat?.id;

  if (!selectedCatId) {
    return null;
  }

  return (
    <div className="mx-auto grid w-full max-w-[1196px] gap-6">
      <CatCareToast message={justSaved ? copy.saved : justCopied ? copy.copied : null} />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[#101a32]">
            {copy.title}
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#526177]">
            {copy.description}
          </p>
        </div>
        <RoutineCatTabsClient cats={workspace.cats} initialCatId={selectedCatId} />
      </div>

      {workspace.cats.map((cat) => {
        const routine = workspace.routineByCatId[cat.id] ?? null;
        const careItems = workspace.itemsByCatId[cat.id] ?? [];
        const routineSourceCats = workspace.routineSourceCatsByCatId[cat.id] ?? [];
        const itemsByTitle = new Map(
          (routine?.items ?? []).map((item) => [item.title, item])
        );
        const customItems: CustomRoutineItemDraft[] = (routine?.items ?? [])
          .filter((item) => !fixedRoutineTitles.has(item.title))
          .map((item) => ({
            category:
              item.category === "meal" ||
              item.category === "treat" ||
              item.category === "medicine"
                ? item.category
                : "treat",
            enabled: item.enabled,
            frequency: normalizeRoutineFrequency(item.frequency, "daily"),
            instructions: item.instructions ?? "",
            timeHint: item.timeHint ?? "",
            title: item.title
          }));

        return (
          <section
            className="grid gap-6"
            data-routine-cat-panel={cat.id}
            hidden={cat.id !== selectedCatId}
            id={`routine-panel-${cat.id}`}
            key={cat.id}
            role="tabpanel"
            style={cat.id !== selectedCatId ? { display: "none" } : undefined}
          >
            <RoutineCopyPanel
              locale={locale}
              routineSourceCats={routineSourceCats}
              selectedCatId={cat.id}
            />

            <RoutineSaveForm
              action={saveCatCareRoutineLocalAction}
              catId={cat.id}
              key={cat.id}
              savedMessage={copy.saved}
            >
              <div className="grid gap-5 lg:grid-cols-3">
                {routineCards.map((card) => (
                  <RoutineCard
                    card={card}
                    familyProductOptions={getFamilyProductOptions(workspace.libraryItems, card.key)}
                    item={getRoutineItemForCard(itemsByTitle, card)}
                    key={card.key}
                    locale={locale}
                  />
                ))}
              </div>

              <CustomRoutineItemsClient
                initialItems={customItems}
                libraryItems={workspace.libraryItems}
                locale={locale}
              />

              <CareItemsContextPanel
                careItems={careItems}
                locale={locale}
                selectedCatId={cat.id}
              />

              <div className="rounded-2xl border border-[#f3d5b8] bg-[#fffaf4] p-5 text-sm leading-7 text-[#7a5a3a]">
                <span className="font-semibold text-[#d96b1f]">
                  {locale === "en" ? "Note: " : "提示："}
                </span>
                {copy.helper}
              </div>

              <div className="grid gap-4 sm:grid-cols-[1fr_1fr]">
                <CatCareButton name="intent" type="submit" value="stay" variant="secondary">
                  <CatCareSaveIcon />
                  {copy.save}
                </CatCareButton>
                <CatCareButton name="intent" type="submit" value="items">
                  <CatCareBowlActionIcon />
                  {copy.saveNext}
                </CatCareButton>
              </div>
            </RoutineSaveForm>
          </section>
        );
      })}
    </div>
  );
}

function RoutineCopyPanel({
  locale,
  routineSourceCats,
  selectedCatId
}: {
  locale: "zh" | "en";
  routineSourceCats: Array<{ id: string; name: string }>;
  selectedCatId: string;
}) {
  if (routineSourceCats.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-[#d9e0ea] bg-white p-5">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div>
          <h2 className="text-lg font-semibold text-[#101a32]">
            {locale === "en" ? "Reuse another cat's routine" : "复用其它猫习惯"}
          </h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-[#526177]">
            {locale === "en"
              ? "Copy a saved routine to this cat, then adjust amount, products, and timing."
              : "适合多猫饮食相近的家庭；会复制到当前猫，再按体重、用品和时间微调。"}
          </p>
        </div>
        <div className="flex max-w-full gap-3 overflow-x-auto pb-1">
          {routineSourceCats.map((cat) => (
            <form action={copyCatCareRoutineAction} className="shrink-0" key={cat.id}>
              <input name="sourceCatId" type="hidden" value={cat.id} />
              <input name="targetCatId" type="hidden" value={selectedCatId} />
              <CatCareButton type="submit" variant="secondary">
                <CatCarePlusCircleIcon />
                {locale === "en" ? `Copy ${cat.name}` : `用${cat.name}习惯覆盖`}
              </CatCareButton>
            </form>
          ))}
        </div>
      </div>
    </section>
  );
}

function RoutineCard({
  card,
  familyProductOptions,
  item,
  locale
}: {
  card: (typeof routineCards)[number];
  familyProductOptions: string[];
  item: CatCareRoutineItem | null;
  locale: "zh" | "en";
}) {
  const fallback = fallbackValues[card.key];
  const enabled = item?.enabled ?? true;
  const isFoodLike =
    card.key === "dry_food" || card.key === "canned" || card.key === "treats";
  const parsedInstructions = parseRoutineInstructions(item?.instructions);
  const selectedFrequency = normalizeRoutineFrequency(
    item?.frequency,
    fallback.frequency
  );
  const initialTime =
    card.key === "water" &&
    (item?.timeHint === "08:00" || item?.timeHint === "09:00")
      ? fallback.timeHint
      : item?.timeHint ?? fallback.timeHint;
  const enabledInputId = `routine-${card.key}-enabled`;

  return (
    <section className="rounded-2xl border border-[#e2e6ee] bg-white p-5 shadow-sm shadow-slate-900/[0.04]">
      <input
        aria-label={locale === "en" ? `Enable ${card.titleEn}` : `启用${card.title}`}
        className="peer sr-only"
        defaultChecked={enabled}
        id={enabledInputId}
        name={`${card.key}.enabled`}
        type="checkbox"
      />
      <div className="flex items-start justify-between gap-4 opacity-55 transition peer-checked:opacity-100 peer-checked:[&_.routine-off-badge]:hidden peer-checked:[&_.routine-switch-knob]:translate-x-6 peer-checked:[&_.routine-switch-track]:bg-[#07847f]">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#f2fbf8] text-[#07847f] ring-1 ring-[#d9eee7]">
            <RoutineCardIcon iconType={card.iconType} />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-[#101a32]">
                {locale === "en" ? card.titleEn : card.title}
              </h2>
              <span className="routine-off-badge rounded-full bg-[#eef2f7] px-2.5 py-1 text-xs font-semibold text-[#526177]">
                {locale === "en" ? "Off" : "已停用"}
              </span>
            </div>
            <p className="mt-1 text-sm font-semibold text-[#526177]">
              {locale === "en" ? card.subtitleEn : card.subtitle}
            </p>
          </div>
        </div>
        <label
          className="relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center"
          htmlFor={enabledInputId}
        >
          <span className="routine-switch-track absolute inset-0 rounded-full bg-[#d9e0ea] transition" />
          <span className="routine-switch-knob absolute left-1 h-6 w-6 rounded-full bg-white shadow-sm transition" />
        </label>
      </div>

      <div className="pointer-events-none mt-5 grid gap-3 opacity-45 grayscale transition peer-checked:pointer-events-auto peer-checked:opacity-100 peer-checked:grayscale-0">
        <div className="grid gap-2">
          <span className="text-xs font-semibold text-[#526177]">
            {locale === "en" ? "Repeat" : "频率"}
          </span>
          <RoutineScheduleControl
            allowNoFixedTime
            frequencyName={`${card.key}.frequency`}
            initialTime={initialTime}
            initialValue={selectedFrequency}
            locale={locale}
            timeName={`${card.key}.time`}
          />
        </div>
        {isFoodLike ? (
          <div className="grid gap-2">
            <label className="grid gap-2">
              <span className="text-xs font-semibold text-[#526177]">
                {locale === "en" ? "Default product" : "默认产品"}
              </span>
              <BrandAutocompleteInput
                defaultValue={parsedInstructions.brand}
                extraOptions={familyProductOptions}
                locale={locale}
                name={`${card.key}.brand`}
                productType={getFoodProductType(card.key)}
              />
            </label>
            {card.key === "treats" ? (
              <p className="text-xs font-semibold leading-5 text-[#75839a]">
                {locale === "en"
                  ? "Add multiple treat SKUs below, one product per row."
                  : "多种零食可在下方逐条添加，每行保存一个产品和规则。"}
              </p>
            ) : null}
          </div>
        ) : null}
        <label className="grid gap-2">
          <span className="text-xs font-semibold text-[#526177]">
            {isFoodLike
              ? locale === "en"
                ? "Amount"
                : "用量"
              : locale === "en"
                ? "Instructions"
                : "说明"}
          </span>
          <input
            className="h-12 rounded-xl border border-[#d9e0ea] bg-white px-4 text-sm font-semibold text-[#16233b] outline-none focus:border-[#07847f] focus:ring-4 focus:ring-[#07847f]/10"
            defaultValue={
              stripAmountFrequencyPrefix(parsedInstructions.instructions) ||
              fallback.instructions
            }
            name={`${card.key}.instructions`}
          />
        </label>
      </div>
    </section>
  );
}

function RoutineCardIcon({ iconType }: { iconType: string }) {
  return <CatCareItemTypeIcon className="h-8 w-8" itemType={iconType} />;
}

function CareItemsContextPanel({
  careItems,
  locale,
  selectedCatId
}: {
  careItems: CatCareItem[];
  locale: "zh" | "en";
  selectedCatId: string;
}) {
  if (careItems.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-[#b8c5d8] bg-[#fbfdfc] p-5">
        <h2 className="text-lg font-semibold text-[#101a32]">
          {locale === "en" ? "Food and care items" : "食物用品联动"}
        </h2>
        <p className="mt-2 text-sm font-semibold leading-6 text-[#526177]">
          {locale === "en"
            ? "Add multiple treats, litter, medicine, and supplies there. Care plans merge them with this routine."
            : "多种零食、猫砂、药品和备用用品可以在「食物用品」逐条添加；生成计划时会与本页习惯合并。"}
        </p>
        <Link
          className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#07847f] px-5 text-sm font-semibold text-white transition hover:bg-[#056d69]"
          href={`/catcare/items?cat_id=${selectedCatId}`}
        >
          {locale === "en" ? "Add items" : "添加食物用品"}
        </Link>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-[#d9e0ea] bg-white p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#101a32]">
            {locale === "en" ? "Linked food and care items" : "已记录食物用品"}
          </h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-[#526177]">
            {locale === "en"
              ? "These item records will be merged into care plans with the routine above."
              : "这些记录会和上面的喂养习惯一起进入照护计划，不需要重复填进单个零食字段。"}
          </p>
        </div>
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#07847f] px-5 text-sm font-semibold text-[#07847f] transition hover:bg-[#e6f7f2]"
          href={`/catcare/items?cat_id=${selectedCatId}`}
        >
          {locale === "en" ? "Manage items" : "管理用品"}
        </Link>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {careItems.map((item) => (
          <div
            className="rounded-xl border border-[#e2e6ee] bg-[#fbfdfc] p-4"
            key={item.id}
          >
            <p className="truncate text-sm font-semibold text-[#101a32]">
              {item.name}
            </p>
            <p className="mt-1 truncate text-xs font-semibold text-[#75839a]">
              {formatCareItemSummary(item, locale)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function formatCareItemSummary(item: CatCareItem, locale: "zh" | "en") {
  const amount = formatCareItemAmount(item.defaultAmount);
  const frequency = formatCareItemFrequency(item.defaultFrequency, locale);

  return (
    [amount, frequency].filter(Boolean).join(" / ") ||
    (locale === "en" ? "No default amount" : "未设置默认用量")
  );
}

function formatCareItemAmount(value: string | null) {
  const amount = value ? stripAmountFrequencyPrefix(value) : value;

  return amount || value;
}

function stripAmountFrequencyPrefix(value: string) {
  return value
    .trim()
    .replace(/^(每天|每日|天天|每周|每两日|每2日|隔日)\s*/u, "");
}

function formatCareItemFrequency(value: string | null, locale: "zh" | "en") {
  const match = /^(daily|every_2_days|weekly)(?:_(\d+))?$/.exec(value ?? "");

  if (!match) {
    return value;
  }

  const count = Number(match[2] ?? "1");
  const countText =
    count > 1 ? ` ${count} ${locale === "en" ? "times" : "次"}` : "";

  if (match[1] === "weekly") {
    return locale === "en" ? `Weekly${countText}` : `每周${countText}`;
  }

  if (match[1] === "every_2_days") {
    return locale === "en" ? `Every 2 days${countText}` : `每两日${countText}`;
  }

  return locale === "en" ? `Daily${countText}` : `每日${countText}`;
}

function getRoutineItemForCard(
  itemsByTitle: Map<string, CatCareRoutineItem>,
  card: (typeof routineCards)[number]
) {
  return (
    itemsByTitle.get(card.title) ??
    (card.aliases ?? [])
      .map((title) => itemsByTitle.get(title))
      .find((item): item is CatCareRoutineItem => Boolean(item)) ??
    null
  );
}

function parseRoutineInstructions(value?: string | null) {
  const text = value ?? "";
  const separator = " · ";
  const separatorIndex = text.indexOf(separator);

  if (separatorIndex < 0) {
    return { brand: "", instructions: text };
  }

  return {
    brand: text.slice(0, separatorIndex),
    instructions: text.slice(separatorIndex + separator.length)
  };
}

function normalizeRoutineFrequency(
  value: string | null | undefined,
  fallback: string
) {
  if (value === "weekly") {
    return "weekly_1";
  }

  if (
    typeof value === "string" &&
    isValidRoutineFrequency(value)
  ) {
    return value;
  }

  return fallback;
}

function isValidRoutineFrequency(value: string) {
  const match = /^(daily|every_2_days|weekly)(?:_(\d+))?$/.exec(value);

  if (!match) {
    return false;
  }

  const count = Number(match[2] ?? "1");
  return (
    Number.isInteger(count) &&
    count > 0 &&
    count <= maxRoutineFrequencyCount
  );
}

function getFoodProductType(cardKey: (typeof routineCards)[number]["key"]) {
  if (cardKey === "dry_food") {
    return "dry_food";
  }

  if (cardKey === "canned") {
    return "wet_food";
  }

  return "treat";
}

function getFamilyProductOptions(
  items: CatCareLibraryItem[],
  cardKey: (typeof routineCards)[number]["key"]
) {
  if (cardKey !== "dry_food" && cardKey !== "canned" && cardKey !== "treats") {
    return [];
  }

  const itemType = getFoodProductType(cardKey);

  return items
    .filter((item) => item.itemType === itemType)
    .map((item) => item.name);
}
