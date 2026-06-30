export const locales = ["zh", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "zh";
export const localeCookieName = "starter_locale";

export function isLocale(value: string | undefined): value is Locale {
  return locales.includes(value as Locale);
}

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}

export type Dictionary = (typeof dictionaries)[Locale];

export const dictionaries = {
  zh: {
    common: {
      brandSubtitle: "eXtensible Web Launch Core",
      dashboard: "工作台",
      account: "账户",
      login: "登录",
      signUp: "注册",
      signIn: "登录",
      signOut: "退出",
      saving: "保存中...",
      working: "处理中...",
      backHome: "返回首页",
      language: "语言",
      currentLanguage: "当前语言",
      zh: "中文",
      en: "EN",
      status: {
        ready: "可用",
        inProgress: "进行中",
        planned: "计划中",
        risk: "需检查"
      },
      nav: {
        dashboard: "工作台",
        referenceProduct: "照护产品",
        account: "账户",
        profile: "个人资料",
        billing: "套餐",
        usage: "AI"
      },
      accountMenu: {
        label: "账户菜单",
        signedIn: "已登录",
        dashboard: "工作台",
        referenceProduct: "照护产品",
        account: "个人资料",
        billing: "套餐",
        usage: "AI",
        signOut: "退出登录",
        working: "退出中..."
      },
      footer: {
        ariaLabel: "页脚",
        description:
          "XWLC 是用于快速验证 Web 产品想法的商业化模板工程，优先提供真实可复用的账户、工作台和服务层边界。",
        languageTitle: "界面语言",
        productTitle: "产品入口",
        productLinks: {
          home: "首页",
          signUp: "注册",
          login: "登录",
          demo: "底座 Demo",
          dashboard: "工作台",
          referenceProduct: "照护产品",
          account: "个人资料",
          billing: "套餐",
          usage: "AI"
        },
        capabilitiesTitle: "产品预留位",
        capabilities: [
          "真实产品导航位",
          "核心业务入口位",
          "计费与权益入口位",
          "帮助与支持入口位"
        ],
        resourcesTitle: "工程预留位",
        resources: [
          "产品规格链接位",
          "服务边界文档位",
          "权限安全说明位",
          "部署观测说明位"
        ],
        copyright: "© {year} XWLC. 保留所有权利。"
      }
    },
    home: {
      brandSubtitle: "CatCare handoff workspace",
      badge: "猫咪临时照护",
      title: "临时照看猫咪，",
      titleAccent: "不用再靠聊天记录交代",
      description:
        "为主人准备猫咪档案、照护计划、交接发布和结果回收。账户、套餐、支付和 AI Credit 沿用底座能力，猫咪照护数据独立建模。",
      primaryAction: "创建照护计划",
      primaryActionSignedIn: "进入照护工作台",
      secondaryAction: "查看使用流程",
      secondaryActionSignedIn: "进入照护工作台",
      demoLink: "底座 Demo",
      trustLine: "适用于寄养、朋友代看、短期上门照护",
      metaLine: "猫咪档案 · 照护计划 · 发布交接 · 提交回收",
      stats: [
        {
          value: "1",
          label: "主人账户"
        },
        {
          value: "4",
          label: "照护流程"
        },
        {
          value: "AI",
          label: "摘要和提醒预留"
        }
      ],
      preview: {
        account: "主人账户",
        activePlan: "当前交接",
        aiCredit: "AI Credit",
        billing: "照护套餐",
        cat: "Mochi",
        handoff: "等待提交",
        note: "门禁卡放在玄关抽屉，异常时先电话联系主人。",
        plan: "周末寄养照护",
        publish: "已发布",
        result: "结果回收",
        taskOne: "晚上 8 点喂食，干粮 30g，水碗换新水。",
        taskTwo: "睡前确认猫砂盆，异常情况记录备注。",
        title: "猫咪照护计划"
      },
      callouts: [
        {
          title: "建档",
          description: "记录猫咪习惯、饮食、禁忌和临时注意事项。"
        },
        {
          title: "计划",
          description: "把照护任务、日期和交接说明整理成一张卡。"
        },
        {
          title: "发布",
          description: "主人发布交接，后续可接私密分享和权限控制。"
        },
        {
          title: "回收",
          description: "照看完成、备注和异常都会回到主人侧看板。"
        }
      ]
    },
    demo: {
      subtitle: "eXtensible Web Launch Core",
      badge: "Foundation Demo",
      title: "底座能力 Demo",
      description:
        "这里保留 starter kit 原有验证入口，用于检查登录、工作台、demo 数据、AI 草稿、套餐、支付和 AI Credit 等底座能力。CatCare 产品从首页和照护工作台进入。",
      signIn: "登录查看 Demo",
      openDashboard: "打开工作台",
      productLink: "返回 CatCare",
      backToDemo: "返回 Demo",
      cards: [
        {
          title: "账户与工作台",
          description: "验证 Supabase Auth、受保护页面和账户菜单。"
        },
        {
          title: "Demo 数据链路",
          description: "通过 demo item 检查页面、Server Action、service、Supabase 和 RLS。"
        },
        {
          title: "商业化能力",
          description: "复用套餐、支付、AI Credit 和 AI 草稿验证面，不把它们复制进产品页面。"
        }
      ],
      login: {
        subtitle: "eXtensible Web Launch Core",
        badge: "底座账户",
        title: "登录底座 Demo",
        description:
          "这个入口保留原有 demo 语境，默认登录后进入 `/dashboard`。认证仍复用同一套 Auth 服务。",
        welcomeBack: "欢迎回来",
        startWithEmail: "创建 Demo 账户",
        accessDashboard: "进入 Demo 工作台",
        providerNote: "邮箱密码用于当前环境的底座 Demo 账户。"
      }
    },
    referenceProduct: {
      subtitle: "Reference Product Consumer",
      badge: "MVP3 package consumer",
      eyebrow: "产品侧入口",
      title: "Reference Product 最小入口",
      description:
        "这个入口只验证产品侧可以通过公开 Package 消费通用底座能力，不实现完整业务闭环，也不把产品对象放进通用 Package。",
      contractTitle: "Package 消费证据",
      contractDescription:
        "Auth 和 DB 只通过 @xwlc/platform 与 @xwlc/db 的公开入口读取通用契约，Next/Supabase adapter 仍留在 app 侧。",
      facts: {
        auth: "Auth contract",
        db: "DB contract",
        scope: "匿名边界",
        schema: "Schema checkpoint"
      },
      status: {
        verified_owner: "公开入口可消费",
        blocked: "需检查"
      },
      owner: {
        shellSubtitle: "Cat Care Reference Product",
        eyebrow: "主人侧照护产品",
        title: "猫咪照护计划",
        description:
          "把喂食、用药、门禁钥匙和异常处理放进一份交接单。照看者完成后，主人回到这里查看结果。",
        packageGate: "系统状态",
        packageGateDescription:
          "账户和数据服务可用；照护业务对象保留在产品侧，方便后续扩展成独立猫咪照护产品。",
        serviceErrorTitle: "照护产品暂不可用",
        metrics: {
          cats: "猫咪档案",
          drafts: "草稿计划",
          published: "已发布"
        },
        catForm: {
          title: "猫咪档案",
          description: "先记录猫咪的基础信息，后续计划都归属到这只猫。",
          name: "猫咪名字",
          namePlaceholder: "例如：Mochi",
          notes: "照护备注",
          notesPlaceholder: "饮食、性格、禁忌或临时注意事项。",
          submit: "保存猫咪",
          submitting: "保存中...",
          success: "猫咪档案已保存。",
          hint: "这些信息只属于当前主人账户。"
        },
        planForm: {
          title: "新建照护计划",
          description:
            "创建一个可发布的照护计划，至少包含一项照护任务。",
          cat: "选择猫咪",
          titleLabel: "计划标题",
          titlePlaceholder: "例如：周末寄养照护",
          startOn: "开始日期",
          endOn: "结束日期",
          handoffNotes: "交接说明",
          handoffPlaceholder: "门禁、钥匙、紧急联系人或整体交接信息。",
          taskTitle: "第一项任务",
          taskTitlePlaceholder: "例如：晚上 8 点喂食",
          taskInstructions: "任务说明",
          taskInstructionsPlaceholder: "份量、位置、完成标准或异常处理方式。",
          submit: "创建计划",
          submitting: "创建中...",
          success: "照护计划已创建。",
          hint: "创建后可以在照护计划卡片发布。",
          noCats: "请先创建猫咪档案。"
        },
        planList: {
          title: "照护计划",
          description:
            "主人在这里查看自己的计划状态、任务和照看提交结果。",
          emptyTitle: "还没有照护计划",
          emptyDescription: "先创建猫咪档案，再添加第一份照护计划。",
          hasSubmissions: "已有提交",
          noSubmissions: "等待提交",
          unknownCat: "未知猫咪",
          openDate: "未定",
          publish: "发布计划",
          tasks: "任务",
          submissions: "提交结果",
          submissionsEmpty:
            "当前还没有照看者提交。发布分享后，完成记录会回到这里。"
        },
        capabilities: {
          title: "产品账户",
          description:
            "管理主人资料、照护套餐、支付入口和 AI 辅助额度。",
          account: "主人账户",
          billing: "照护套餐 / 账单",
          usage: "AI Credit / 用量",
          connected: "已接入",
          planned: "待开放",
          accountAction: "查看账户",
          billingAction: "查看套餐",
          usageAction: "查看用量",
          billingDescription:
            "发布第一份计划后，这里会承接照护套餐和支付动作。",
          usageDescription:
            "照护摘要、提醒文案和异常整理会使用这里的 AI Credit。"
        },
        status: {
          draft: "草稿",
          published: "已发布",
          reviewed: "已查看",
          closed: "已关闭"
        },
        submissionStatus: {
          completed: "完成",
          note: "备注",
          exception: "异常"
        },
        errors: {
          general: "照护产品暂时无法保存，请检查表单后重试。",
          name: "请输入 1 到 80 个字符的名字。",
          notes: "备注不能超过 2000 个字符。",
          catId: "请选择有效猫咪。",
          title: "请输入 1 到 120 个字符的标题。",
          endOn: "结束日期不能早于开始日期。",
          handoffNotes: "交接说明不能超过 2000 个字符。",
          taskTitle: "请输入 1 到 120 个字符的任务标题。",
          taskInstructions: "任务说明不能超过 2000 个字符。"
        }
      }
    },
    login: {
      subtitle: "CatCare handoff workspace",
      badge: "主人账户",
      title: "登录后管理猫咪照护",
      description:
        "使用同一套账户系统进入猫咪照护产品。注册后会直接回到照护工作台，原底座 Demo 仍可单独查看。",
      sideTitle: "把临时照护交接变成一份清楚可执行的清单",
      sideDescription:
        "主人先建立猫咪档案和日常习惯，再生成临时照护计划。照看者按步骤完成，结果回到主人工作台。",
      securityLine: "账户、套餐、支付和 AI Credit 沿用底座能力；猫咪照护数据保留在产品侧。",
      createAccount: "创建账户",
      welcomeBack: "欢迎回来",
      startWithEmail: "创建主人账户",
      accessDashboard: "进入照护工作台",
      providerNote: "邮箱密码用于当前环境的猫咪照护产品账户。",
      confirmationFailed: "确认链接无法验证。如账号已完成确认，请直接登录。",
      productPoints: [
        {
          title: "照护计划归属于主人账户",
          description: "登录后创建的猫咪档案和计划只属于当前主人。"
        },
        {
          title: "套餐和 AI Credit 会接入同一账户",
          description: "支付、用量和 AI 辅助额度沿用底座能力，产品侧保留自己的业务语境。"
        }
      ],
      form: {
        email: "邮箱",
        password: "密码",
        createAccount: "创建账户",
        signIn: "登录",
        working: "处理中...",
        alreadyHaveAccount: "已有账户？",
        newHere: "还没有账户？",
        switchToSignIn: "去登录",
        switchToSignUp: "去注册",
        confirmationPending: "请查看邮箱并完成账户确认。"
      }
    },
    dashboard: {
      shellSubtitle: "eXtensible Web Launch Core",
      title: "工作台",
      eyebrow: "已登录",
      description:
        "这里保留模板当前可直接测试的功能：AI 文案草稿、demo item 读写，以及页面、Server Action、服务层、Supabase 和 RLS 的完整链路。",
      demo: {
        title: "Demo 数据",
        description:
          "创建一条最小业务记录，用于验证表单、Server Action、服务层、Supabase 和 RLS 的完整链路。",
        statusReady: "可读写",
        statusError: "需检查",
        emptyTitle: "还没有 demo item",
        emptyDescription: "创建第一条记录，验证当前账户的数据写入和读取流程。",
        privateItemsTitle: "我的数据",
        publicItemsTitle: "公共样例",
        serviceErrorTitle: "数据服务暂不可用",
        createHint: "提交会经过 Server Action 和 demo service。",
        created: "已通过服务层创建 demo item。",
        titleLabel: "标题",
        titlePlaceholder: "例如：客户 onboarding 清单",
        visibilityLabel: "可见性",
        private: "仅自己可见",
        public: "登录用户可见",
        notesLabel: "备注",
        notesPlaceholder: "可选，记录这条 demo 数据的上下文。",
        submit: "创建 demo item",
        submitting: "创建中...",
        itemVisibility: {
          private: "私有",
          public: "公开"
        },
        itemStatus: {
          active: "有效",
          archived: "已归档"
        }
      },
      ai: {
        title: "AI 文案草稿",
        description:
          "输入一个产品场景，生成一段可替换的草稿，并查看本次调用的模式、模型和 Credit 状态。",
        statusReady: "可试用",
        statusError: "需检查",
        serviceErrorTitle: "AI 服务暂不可用",
        promptLabel: "输入",
        promptPlaceholder: "例如：为一个面向独立开发者的项目管理工具写一句首页副标题",
        run: "生成草稿",
        running: "正在生成中...",
        noResult: "输入内容后生成一段草稿。",
        success: "已生成",
        blocked: "已拦截",
        failure: "生成失败",
        result: "结果",
        providerMode: "模式",
        model: "模型",
        modelSelectLabel: "模型",
        selectedModelCredit: "当前模型预估消耗",
        gateAllowed: "额度通过",
        gateBlocked: "额度不足",
        creditRequested: "预估 Credit",
        creditOutcome: "本次扣减",
        creditUnit: "Credit",
        usageRecord: "记录状态",
        usageRecordPending: "待生成",
        usageRecordDeferred: "暂未计入",
        usageRecordRecorded: "已记录",
        reasons: {
          allowed: "可以使用。",
          unauthenticated: "请先登录。",
          entitlement_missing: "当前套餐暂不可用。",
          quota_exhausted: "Credit 不足，请升级套餐或充值额度包。",
          model_unavailable: "模型暂不可用。",
          provider_unconfigured: "该模型尚未接入。",
          budget_limited: "本次请求已被预算限制拦截。",
          provider_failed: "模型服务暂时失败，请稍后重试。",
          timeout: "请求超时，请稍后重试。",
          duplicate: "重复请求已被拦截。",
          validation_failed: "请检查输入内容。",
          usage_record_deferred: "本次记录稍后同步。",
          usage_recorded: "本次使用已记录。",
          usage_record_failed: "结果已返回，但记录暂时失败。"
        }
      }
    },
    account: {
      shellSubtitle: "eXtensible Web Launch Core",
      title: "个人资料",
      eyebrow: "Profile",
      description:
        "维护当前登录用户的个人资料。这里只保留邮箱展示与 display name 保存这条真实可测试链路。",
      emailLabel: "邮箱",
      sections: {
        ariaLabel: "账户功能",
        group: "账户",
        profile: "个人资料",
        billing: "套餐",
        usage: "AI"
      },
      profile: {
        title: "个人资料",
        description: "保存后会写入当前用户自己的 profile 记录。",
        displayName: "显示名称",
        displayNamePlaceholder: "未设置",
        save: "保存资料",
        saving: "保存中...",
        updated: "资料已更新。"
      },
      billing: {
        eyebrow: "Billing",
        title: "套餐",
        description: "管理当前套餐和权益。",
        statusReady: "已同步",
        statusNeedsReview: "暂不可用",
        errorTitle: "套餐信息暂不可用",
        currentPlan: "当前套餐",
        subscriptionStatusLabel: "套餐状态",
        entitlements: "已包含权益",
        renewalDate: "续费时间",
        noRenewalDate: "暂无自动续费",
        viewUsage: "查看 AI",
        planOptionsTitle: "选择套餐",
        planOptionsDescription: "查看当前套餐，并选择适合当前阶段的套餐。",
        currentPlanSelected: "当前套餐",
        freePrice: "$0",
        perMonth: "/ 月",
        recommended: "推荐",
        baseline: "基础",
        enabled: "已包含",
        disabled: "未包含",
        creditOverviewTitle: "Credit 账户",
        creditOverviewDescription:
          "这里展示当前可用于 AI 功能的 Credit，总量由套餐和额度包共同组成。",
        creditAvailable: "可用 Credit",
        planCreditRemaining: "套餐剩余 Credit",
        packCreditRemaining: "额度包 Credit",
        creditConsumed: "已消耗 Credit",
        creditPackTitle: "充值额度包",
        creditPackDescription:
          "一次性增加 100,000 Credit，不改变当前套餐。",
        sandboxOnly: "本地模拟",
        planSwitchNote:
          "测试模式按目标套餐全额记录，不处理差额或退款。",
        upgradePlan: "升级套餐",
        switchPlan: "切换套餐",
        includedInCurrentPlan: "权益已覆盖",
        switchToFree: "切换到 Free",
        buyCreditPack: "充值额度包",
        usageDemoTitle: "模拟 AI 使用",
        usageDemoDescription:
          "先使用一次模拟 AI 生成功能，系统会检查 Credit 权益并记录本次消耗。额度不足时才提示升级套餐或充值额度包。",
        usageDemoRun: "模拟生成一次",
        usageDemoReady: "可使用",
        usageDemoBlocked: "需升级",
        usageDemoCost: 10000,
        usageDemoCostLabel: "本次消耗",
        usageDemoRemaining: "剩余 Credit",
        usageDemoLastResult: "上次结果",
        usageDemoNoResult: "尚未使用",
        usageDemoConsumed: "已消耗",
        usageDemoLimitReached: "已触发额度限制",
        creditAmount: "额度",
        price: "价格",
        planNames: {
          free: "Free",
          plus: "Plus",
          pro: "Pro"
        },
        planDescriptions: {
          free: "适合作为模板的起步套餐，包含基础功能和可验证的 AI Credit。",
          plus: "在 Free 基础上增加额外功能，并提升 AI Credit。",
          pro: "在 Plus 基础上增加高级功能，适合展示完整付费层级。"
        },
        planInheritance: {
          free: "基础能力",
          plus: "包含 Free 全部内容",
          pro: "包含 Plus 全部内容"
        },
        subscriptionStatuses: {
          none: "无订阅",
          trialing: "试用中",
          active: "有效",
          past_due: "逾期",
          canceled: "已取消",
          expired: "已过期",
          refunded: "已退款"
        },
        features: {
          projects: "基础功能一",
          pages: "基础功能二",
          leads: "额外功能一",
          ai_tokens: "AI Credit",
          custom_domain: "高级功能一"
        },
        units: {
          count: "次",
          credit: "Credit",
          token: "Credit"
        },
        planRecordsTitle: "套餐记录",
        planRecordsDescription: "最近的套餐消费记录。",
        emptyPlanRecords: "暂无套餐消费记录",
        aiRecordsTitle: "记录",
        aiRecordsDescription: "最近的充值和 Credit 消耗记录。",
        creditRecordsTitle: "充值记录",
        usageRecordsTitle: "Credit 消耗记录",
        creditConsumptionRecordTitle: "AI Credit 消耗",
        emptyCreditRecords: "暂无充值记录",
        emptyUsageRecords: "暂无 Credit 消耗记录",
        recordsErrorTitle: "记录暂不可用",
        orderStatuses: {
          pending: "处理中",
          paid: "已完成",
          failed: "失败",
          refunded: "已退款",
          canceled: "已取消"
        },
        usageStatuses: {
          reserved: "已预留",
          committed: "已记录",
          released: "已释放",
          failed: "失败"
        }
      },
      usage: {
        eyebrow: "Usage",
        title: "AI",
        description:
          "集中管理可用 Credit、额度包充值和消耗记录。"
      },
      payment: {
        eyebrow: "Payment",
        title: "升级与支付",
        description:
          "选择套餐或额度包，确认费用后完成支付。当前本地环境使用模拟支付，不会真实扣款。",
        statusReady: "可继续",
        statusNeedsReview: "需检查",
        errorTitle: "支付暂不可用",
        errorDescription:
          "当前支付结果无法确认，请返回套餐页重新发起或稍后重试。",
        providerTitle: "支付方式",
        providerDescription:
          "当前使用本地模拟支付。确认后，系统会记录购买结果并刷新套餐权益。",
        provider: "支付方式",
        mode: "环境",
        realAdapterTestModeOnly: "真实适配器 · 仅测试模式",
        entitlementSource: "权益来源",
        billingFacts: "以服务端记录为准",
        currentBillingTitle: "当前套餐状态",
        currentBillingDescription:
          "当前套餐和 Credit 始终以账户状态为准。",
        quotaGateTitle: "Quota gate 验收",
        quotaGateDescription:
          "通过服务端 Billing entitlement 检查占位权益是否可用。若被拦截，PostHog 会从服务端 decision 上报 quota_limit_reached。",
        quotaGateReady: "可检查",
        quotaGateChecked: "已检查",
        runQuotaGate: "运行 quota gate",
        featureKey: "能力",
        quotaRequested: "请求数量",
        quotaDecision: "判断结果",
        quotaAllowed: "允许",
        quotaBlocked: "拦截",
        quotaReason: "原因",
        quotaRemaining: "剩余额度",
        subscription: "订阅",
        creditPack: "额度包",
        creditPackName: "AI Credit 额度包",
        subscriptionDescription:
          "解锁更高层级的模板权益和 AI Credit。",
        creditPackDescription:
          "一次性增加 AI Credit。",
        priceId: "Price ID",
        price: "价格",
        providerMapping: "Provider 映射",
        sandboxOnly: "本地模拟",
        startCheckout: "继续",
        currentPlanSelected: "当前已是此套餐",
        includedInCurrentPlan: "权益已覆盖",
        sandboxEyebrow: "支付确认",
        planCheckoutTitle: "确认套餐变更",
        creditCheckoutTitle: "充值 AI Credit",
        sandboxTitle: "确认支付",
        sandboxDescription:
          "请确认本次支付信息。当前为本地模拟支付，不会产生真实扣款。",
        sandboxMode: "本地模拟",
        sandboxActionTitle: "支付信息",
        sandboxActionDescription:
          "确认支付后，系统会验证当前用户和本次支付会话，再更新套餐权益。",
        checkoutSession: "支付会话",
        confirmPayment: "确认支付",
        chooseSuccess: "确认支付",
        chooseCancel: "取消支付",
        chooseFailure: "模拟失败",
        resultEyebrow: "Payment Result",
        resultTitles: {
          success: "支付成功",
          cancel: "支付已取消",
          failure: "支付失败"
        },
        resultDescriptions: {
          success:
            "系统已处理本次模拟支付，当前账户权益以服务端记录为准。",
          cancel: "你取消了本次支付，套餐状态不会升级。",
          failure: "支付失败，套餐状态不会升级。"
        },
        resultLabels: {
          success: "成功",
          cancel: "取消",
          failure: "失败"
        },
        resultBoundaryTitle: "权益更新",
        resultBoundaryDescription:
          "支付结果会先记录在服务端；页面只负责展示结果与当前权益。",
        resultNoGrant: "仅展示服务端记录",
        returnToAccount: "返回账户查看权益",
        returnToBilling: "返回套餐",
        returnToUsage: "返回 AI",
        billingUnavailable: "Billing 不可用"
      }
    },
    errors: {
      fallback: "操作失败，请检查表单后重试。",
      auth: {
        accountExists: "该邮箱已经完成注册，请直接登录。",
        configuration: "当前环境的认证配置需要检查。",
        confirmationRequired: "该邮箱正在等待确认，请先完成邮箱确认。",
        email: "请输入有效邮箱。",
        password: "密码至少需要 8 个字符。",
        general: "邮箱或密码无法验证，请检查后重试。",
        signUpGeneral: "账户暂时无法创建，请检查邮箱后重试。"
      },
      profile: {
        displayName: "显示名称不能超过 80 个字符。",
        general: "资料暂时无法保存，请稍后重试。"
      },
      demo: {
        title: "标题需要 3 到 120 个字符。",
        notes: "备注不能超过 500 个字符。",
        visibility: "请选择有效的可见性。",
        general: "demo 数据暂时无法保存，请稍后重试。"
      },
      ai: {
        prompt: "请输入至少 3 个字符。",
        general: "AI 草稿暂时无法生成，请稍后重试。"
      }
    }
  },
  en: {
    common: {
      brandSubtitle: "eXtensible Web Launch Core",
      dashboard: "Dashboard",
      account: "Account",
      login: "Log in",
      signUp: "Sign up",
      signIn: "Sign in",
      signOut: "Sign out",
      saving: "Saving...",
      working: "Working...",
      backHome: "Back home",
      language: "Language",
      currentLanguage: "Current language",
      zh: "中文",
      en: "EN",
      status: {
        ready: "Ready",
        inProgress: "In progress",
        planned: "Planned",
        risk: "Needs review"
      },
      nav: {
        dashboard: "Dashboard",
        referenceProduct: "Care product",
        account: "Account",
        profile: "Profile",
        billing: "Plans",
        usage: "AI"
      },
      accountMenu: {
        label: "Account menu",
        signedIn: "Signed in",
        dashboard: "Dashboard",
        referenceProduct: "Care product",
        account: "Profile",
        billing: "Plans",
        usage: "AI",
        signOut: "Sign out",
        working: "Signing out..."
      },
      footer: {
        ariaLabel: "Footer",
        description:
          "XWLC is a commercial starter kit for validating Web product ideas with reusable account, workspace, and service-layer boundaries.",
        languageTitle: "Interface language",
        productTitle: "Product",
        productLinks: {
          home: "Home",
          signUp: "Sign up",
          login: "Log in",
          demo: "Foundation demo",
          dashboard: "Dashboard",
          referenceProduct: "Care product",
          account: "Profile",
          billing: "Plans",
          usage: "AI"
        },
        capabilitiesTitle: "Product slots",
        capabilities: [
          "Product navigation slot",
          "Core workflow slot",
          "Billing and access slot",
          "Support link slot"
        ],
        resourcesTitle: "Engineering slots",
        resources: [
          "Product spec link slot",
          "Service boundary doc slot",
          "Access and security note slot",
          "Deployment and observability slot"
        ],
        copyright: "© {year} XWLC. All rights reserved."
      }
    },
    home: {
      brandSubtitle: "CatCare handoff workspace",
      badge: "Temporary cat care",
      title: "Hand off cat care",
      titleAccent: "without a messy chat thread",
      description:
        "Give owners cat profiles, care plans, published handoffs, and returned results. Account, billing, payment, and AI Credit reuse the foundation while cat-care data gets its own model.",
      primaryAction: "Create care plan",
      primaryActionSignedIn: "Open care workspace",
      secondaryAction: "View care flow",
      secondaryActionSignedIn: "Open care workspace",
      demoLink: "Foundation demo",
      trustLine: "Built for boarding, friend care, and short home visits",
      metaLine: "Cat profile · Care plan · Handoff · Result return",
      stats: [
        {
          value: "1",
          label: "Owner account"
        },
        {
          value: "4",
          label: "Care steps"
        },
        {
          value: "AI",
          label: "Summary and reminder slot"
        }
      ],
      preview: {
        account: "Owner account",
        activePlan: "Current handoff",
        aiCredit: "AI Credit",
        billing: "Care plan",
        cat: "Mochi",
        handoff: "Awaiting result",
        note: "Door card is in the entry drawer. Call the owner first for exceptions.",
        plan: "Weekend boarding care",
        publish: "Published",
        result: "Result return",
        taskOne: "Feed at 8 PM: 30g dry food and fresh water.",
        taskTwo: "Check the litter box before bed and record exceptions.",
        title: "Cat care plan"
      },
      callouts: [
        {
          title: "Profile",
          description: "Capture habits, food, restrictions, and short-term notes."
        },
        {
          title: "Plan",
          description: "Turn care tasks, dates, and handoff notes into one card."
        },
        {
          title: "Publish",
          description: "Owners publish the handoff; private sharing can attach later."
        },
        {
          title: "Return",
          description: "Completed tasks, notes, and exceptions return to the owner board."
        }
      ]
    },
    demo: {
      subtitle: "eXtensible Web Launch Core",
      badge: "Foundation Demo",
      title: "Foundation capability demo",
      description:
        "This keeps the starter kit's original validation entry for auth, dashboard, demo data, AI drafts, plans, payment, and AI Credit. CatCare starts from the homepage and care workspace.",
      signIn: "Sign in to demo",
      openDashboard: "Open dashboard",
      productLink: "Back to CatCare",
      backToDemo: "Back to demo",
      cards: [
        {
          title: "Account and workspace",
          description: "Validate Supabase Auth, protected pages, and the account menu."
        },
        {
          title: "Demo data path",
          description: "Check the page, Server Action, service, Supabase, and RLS chain through demo items."
        },
        {
          title: "Commercial capabilities",
          description: "Reuse plans, payment, AI Credit, and AI draft review surfaces without copying them into the product pages."
        }
      ],
      login: {
        subtitle: "eXtensible Web Launch Core",
        badge: "Foundation account",
        title: "Sign in to the foundation demo",
        description:
          "This entry keeps the original demo context and returns to `/dashboard` by default. Auth still reuses the same shared service.",
        welcomeBack: "Welcome back",
        startWithEmail: "Create demo account",
        accessDashboard: "Open demo dashboard",
        providerNote: "Email and password sign in to the current foundation demo environment."
      }
    },
    referenceProduct: {
      subtitle: "Reference Product Consumer",
      badge: "MVP3 package consumer",
      eyebrow: "Product-side entry",
      title: "Reference Product minimum entry",
      description:
        "This entry only verifies that a product-side module can consume the foundation through public packages. It does not implement the full business loop or put product objects into common packages.",
      contractTitle: "Package consumption evidence",
      contractDescription:
        "Auth and DB read common contracts only through @xwlc/platform and @xwlc/db public entries. Next/Supabase adapters remain on the app side.",
      facts: {
        auth: "Auth contract",
        db: "DB contract",
        scope: "Anonymous boundary",
        schema: "Schema checkpoint"
      },
      status: {
        verified_owner: "Public entry consumed",
        blocked: "Needs review"
      },
      owner: {
        shellSubtitle: "Cat Care Reference Product",
        eyebrow: "Owner care product",
        title: "Cat care plans",
        description:
          "Put feeding, medication, door access, and exception handling into one handoff plan. After the sitter finishes, the owner reviews the results here.",
        packageGate: "System status",
        packageGateDescription:
          "Account and data services are available; care objects stay product-owned so the product can grow independently.",
        serviceErrorTitle: "Care product unavailable",
        metrics: {
          cats: "Cat profiles",
          drafts: "Draft plans",
          published: "Published"
        },
        catForm: {
          title: "Cat profile",
          description: "Start with the cat's basic care context. Plans attach to this cat.",
          name: "Cat name",
          namePlaceholder: "Mochi",
          notes: "Care notes",
          notesPlaceholder: "Food, temperament, restrictions, or short-term notes.",
          submit: "Save cat",
          submitting: "Saving...",
          success: "Cat profile saved.",
          hint: "These details stay scoped to the current owner account."
        },
        planForm: {
          title: "New care plan",
          description:
            "Create a publishable care plan with at least one care task.",
          cat: "Cat",
          titleLabel: "Plan title",
          titlePlaceholder: "Weekend boarding care",
          startOn: "Start date",
          endOn: "End date",
          handoffNotes: "Handoff notes",
          handoffPlaceholder: "Door code, keys, emergency contact, or general handoff context.",
          taskTitle: "First task",
          taskTitlePlaceholder: "Feed at 8 PM",
          taskInstructions: "Task instructions",
          taskInstructionsPlaceholder: "Amount, location, completion standard, or exception handling.",
          submit: "Create plan",
          submitting: "Creating...",
          success: "Care plan created.",
          hint: "After creation, publish the plan from its care card.",
          noCats: "Create a cat profile first."
        },
        planList: {
          title: "Care plans",
          description:
            "Owners review their plan status, tasks, and sitter submission results here.",
          emptyTitle: "No care plans yet",
          emptyDescription: "Create a cat profile, then add the first care plan.",
          hasSubmissions: "Has submissions",
          noSubmissions: "Awaiting submissions",
          unknownCat: "Unknown cat",
          openDate: "Open",
          publish: "Publish plan",
          tasks: "Tasks",
          submissions: "Submission results",
          submissionsEmpty:
            "No sitter submissions yet. Once a share is sent, completed records return here."
        },
        capabilities: {
          title: "Product account",
          description:
            "Manage owner profile, care plan billing, payment entry, and AI assistance credit.",
          account: "Owner account",
          billing: "Care plans / billing",
          usage: "AI Credit / usage",
          connected: "Connected",
          planned: "Coming soon",
          accountAction: "View account",
          billingAction: "View plans",
          usageAction: "View usage",
          billingDescription:
            "After the first plan is published, this area can carry care-plan billing and payment actions.",
          usageDescription:
            "Care summaries, reminder drafts, and exception cleanup use this AI Credit area."
        },
        status: {
          draft: "Draft",
          published: "Published",
          reviewed: "Reviewed",
          closed: "Closed"
        },
        submissionStatus: {
          completed: "Completed",
          note: "Note",
          exception: "Exception"
        },
        errors: {
          general: "The care product could not save this yet. Check the form and retry.",
          name: "Enter a name from 1 to 80 characters.",
          notes: "Notes must stay under 2000 characters.",
          catId: "Choose a valid cat.",
          title: "Enter a title from 1 to 120 characters.",
          endOn: "End date cannot be before start date.",
          handoffNotes: "Handoff notes must stay under 2000 characters.",
          taskTitle: "Enter a task title from 1 to 120 characters.",
          taskInstructions: "Task instructions must stay under 2000 characters."
        }
      }
    },
    login: {
      subtitle: "CatCare handoff workspace",
      badge: "Owner account",
      title: "Sign in to manage cat care",
      description:
        "Use the shared account system to enter the cat-care product. New signups return to the care workspace, while the foundation demo stays available separately.",
      sideTitle: "Turn a temporary care handoff into a clear, executable checklist",
      sideDescription:
        "Owners set up cat profiles and daily routines, then generate a temporary care plan. Sitters follow the steps and results return to the owner workspace.",
      securityLine: "Account, billing, payment, and AI Credit reuse the foundation; cat-care data stays product-owned.",
      createAccount: "Create account",
      welcomeBack: "Welcome back",
      startWithEmail: "Create owner account",
      accessDashboard: "Open care workspace",
      providerNote: "Email and password sign in to the current cat-care product environment.",
      confirmationFailed:
        "The confirmation link could not be verified. If the account is already confirmed, sign in directly.",
      productPoints: [
        {
          title: "Care plans belong to the owner account",
          description: "Cat profiles and plans created after login are scoped to this owner."
        },
        {
          title: "Billing and AI Credit attach to the same account",
          description: "Payment, usage, and AI assistance reuse the foundation while keeping product semantics."
        }
      ],
      form: {
        email: "Email",
        password: "Password",
        createAccount: "Create account",
        signIn: "Sign in",
        working: "Working...",
        alreadyHaveAccount: "Already have an account?",
        newHere: "New here?",
        switchToSignIn: "Sign in",
        switchToSignUp: "Create account",
        confirmationPending: "Check your email to confirm this account."
      }
    },
    dashboard: {
      shellSubtitle: "eXtensible Web Launch Core",
      title: "Dashboard",
      eyebrow: "Signed in",
      description:
        "This page keeps directly testable flows: AI draft generation, demo item reads and writes, and the page, Server Action, service layer, Supabase, and RLS path.",
      demo: {
        title: "Demo data",
        description:
          "Create a minimal business record to verify the form, Server Action, service layer, Supabase, and RLS flow.",
        statusReady: "Writable",
        statusError: "Check needed",
        emptyTitle: "No demo items yet",
        emptyDescription: "Create the first record to verify account-scoped reads and writes.",
        privateItemsTitle: "My data",
        publicItemsTitle: "Public samples",
        serviceErrorTitle: "Data service unavailable",
        createHint: "Submissions route through a Server Action and demo service.",
        created: "Created demo item through the service layer.",
        titleLabel: "Title",
        titlePlaceholder: "Customer onboarding checklist",
        visibilityLabel: "Visibility",
        private: "Private",
        public: "Public",
        notesLabel: "Notes",
        notesPlaceholder: "Optional context for this demo record.",
        submit: "Create demo item",
        submitting: "Creating...",
        itemVisibility: {
          private: "Private",
          public: "Public"
        },
        itemStatus: {
          active: "Active",
          archived: "Archived"
        }
      },
      ai: {
        title: "AI draft",
        description:
          "Enter a product scenario, generate a replaceable draft, and review the provider mode, model, and Credit state for this call.",
        statusReady: "Available",
        statusError: "Check needed",
        serviceErrorTitle: "AI service unavailable",
        promptLabel: "Input",
        promptPlaceholder: "Write a homepage subtitle for a project management tool for indie makers",
        run: "Generate draft",
        running: "Generating...",
        noResult: "Enter input to generate a draft.",
        success: "Generated",
        blocked: "Blocked",
        failure: "Failed",
        result: "Result",
        providerMode: "Mode",
        model: "Model",
        modelSelectLabel: "Model",
        selectedModelCredit: "Selected model estimate",
        gateAllowed: "Credit allowed",
        gateBlocked: "Credit blocked",
        creditRequested: "Estimated Credit",
        creditOutcome: "Credit deducted",
        creditUnit: "Credit",
        usageRecord: "Record state",
        usageRecordPending: "Pending",
        usageRecordDeferred: "Not recorded yet",
        usageRecordRecorded: "Recorded",
        reasons: {
          allowed: "Allowed.",
          unauthenticated: "Sign in first.",
          entitlement_missing: "This model is not available on the current plan.",
          quota_exhausted: "Credit is not enough. Upgrade or top up Credit.",
          model_unavailable: "This model is unavailable.",
          provider_unconfigured: "This model is not connected yet.",
          budget_limited: "This request was blocked by the budget limit.",
          provider_failed: "The model service failed. Try again later.",
          timeout: "The request timed out. Try again later.",
          duplicate: "Duplicate request blocked.",
          validation_failed: "Review the input.",
          usage_record_deferred: "This record will sync later.",
          usage_recorded: "This usage was recorded.",
          usage_record_failed: "The result returned, but recording failed."
        }
      }
    },
    account: {
      shellSubtitle: "eXtensible Web Launch Core",
      title: "Profile",
      eyebrow: "Profile",
      description:
        "Maintain the minimal profile for the signed-in user. This page keeps only the real testable email and display-name flow.",
      emailLabel: "Email",
      sections: {
        ariaLabel: "Account sections",
        group: "Account",
        profile: "Profile",
        billing: "Plans",
        usage: "AI"
      },
      profile: {
        title: "Profile",
        description: "Saving writes to the signed-in user's own profile row.",
        displayName: "Display name",
        displayNamePlaceholder: "Not set",
        save: "Save profile",
        saving: "Saving...",
        updated: "Profile updated."
      },
      billing: {
        eyebrow: "Billing",
        title: "Plans",
        description: "Manage the current plan and access.",
        statusReady: "Synced",
        statusNeedsReview: "Unavailable",
        errorTitle: "Plan details unavailable",
        currentPlan: "Current plan",
        subscriptionStatusLabel: "Plan status",
        entitlements: "Included access",
        renewalDate: "Renewal date",
        noRenewalDate: "No automatic renewal",
        viewUsage: "View AI",
        planOptionsTitle: "Choose a plan",
        planOptionsDescription:
          "Review the current plan and choose the plan that fits the current stage.",
        currentPlanSelected: "Current plan",
        freePrice: "$0",
        perMonth: "/ month",
        recommended: "Recommended",
        baseline: "Baseline",
        enabled: "Included",
        disabled: "Not included",
        creditOverviewTitle: "Credit account",
        creditOverviewDescription:
          "This shows the Credit currently available for AI features. The total comes from the plan and credit packs.",
        creditAvailable: "Available Credit",
        planCreditRemaining: "Remaining plan Credit",
        packCreditRemaining: "Credit-pack Credit",
        creditConsumed: "Consumed Credit",
        creditPackTitle: "Credit pack top-up",
        creditPackDescription:
          "Add 100,000 Credit once without changing the current plan.",
        sandboxOnly: "Local simulation",
        planSwitchNote:
          "Test mode records the target plan at full price; proration and refunds are not handled here.",
        upgradePlan: "Upgrade plan",
        switchPlan: "Switch plan",
        includedInCurrentPlan: "Covered by current plan",
        switchToFree: "Switch to Free",
        buyCreditPack: "Top up credit pack",
        usageDemoTitle: "Simulate AI usage",
        usageDemoDescription:
          "Use one simulated AI generation first. The system checks Credit access and records the usage. Upgrade the plan or top up a credit pack only when quota is blocked.",
        usageDemoRun: "Generate once",
        usageDemoReady: "Available",
        usageDemoBlocked: "Upgrade needed",
        usageDemoCost: 10000,
        usageDemoCostLabel: "This use costs",
        usageDemoRemaining: "Remaining Credit",
        usageDemoLastResult: "Last result",
        usageDemoNoResult: "Not used yet",
        usageDemoConsumed: "Consumed",
        usageDemoLimitReached: "Quota limit reached",
        creditAmount: "Credit",
        price: "Price",
        planNames: {
          free: "Free",
          plus: "Plus",
          pro: "Pro"
        },
        planDescriptions: {
          free: "For first use, with base template features and verifiable AI Credit.",
          plus:
            "Adds extra template access on top of Free and increases AI Credit.",
          pro: "Adds advanced template access on top of Plus for a full paid-tier example.",
        },
        planInheritance: {
          free: "Base access",
          plus: "Includes everything in Free",
          pro: "Includes everything in Plus"
        },
        subscriptionStatuses: {
          none: "No subscription",
          trialing: "Trialing",
          active: "Active",
          past_due: "Past due",
          canceled: "Canceled",
          expired: "Expired",
          refunded: "Refunded"
        },
        features: {
          projects: "Base feature 1",
          pages: "Base feature 2",
          leads: "Extra feature 1",
          ai_tokens: "AI Credit",
          custom_domain: "Advanced feature 1"
        },
        units: {
          count: "count",
          credit: "Credit",
          token: "Credit"
        },
        planRecordsTitle: "Plan records",
        planRecordsDescription: "Recent plan purchase records.",
        emptyPlanRecords: "No plan purchase records yet",
        aiRecordsTitle: "Records",
        aiRecordsDescription: "Recent top-up and Credit consumption records.",
        creditRecordsTitle: "Top-up records",
        usageRecordsTitle: "Credit consumption records",
        creditConsumptionRecordTitle: "AI Credit consumption",
        emptyCreditRecords: "No top-up records yet",
        emptyUsageRecords: "No Credit consumption records yet",
        recordsErrorTitle: "Records unavailable",
        orderStatuses: {
          pending: "Pending",
          paid: "Completed",
          failed: "Failed",
          refunded: "Refunded",
          canceled: "Canceled"
        },
        usageStatuses: {
          reserved: "Reserved",
          committed: "Recorded",
          released: "Released",
          failed: "Failed"
        }
      },
      usage: {
        eyebrow: "Usage",
        title: "AI",
        description:
          "Manage available Credit, credit-pack top-ups, and consumption records."
      },
      payment: {
        eyebrow: "Payment",
        title: "Upgrade and payment",
        description:
          "Choose a plan or credit pack, review the price, and confirm payment. The local environment uses simulated payment and never creates a real charge.",
        statusReady: "Ready",
        statusNeedsReview: "Needs review",
        errorTitle: "Payment unavailable",
        errorDescription:
          "This payment result could not be confirmed. Return to plans and try again.",
        providerTitle: "Payment method",
        providerDescription:
          "The local environment uses simulated payment. After confirmation, the system records the purchase result and refreshes plan access.",
        provider: "Payment method",
        mode: "Environment",
        realAdapterTestModeOnly: "Real adapter · test mode only",
        entitlementSource: "Entitlement source",
        billingFacts: "Confirmed by server records",
        currentBillingTitle: "Current plan status",
        currentBillingDescription:
          "Current plan and Credit always come from the account state.",
        quotaGateTitle: "Quota gate review",
        quotaGateDescription:
          "Runs a server-side Billing entitlement check for a placeholder access item. When blocked, PostHog receives quota_limit_reached from the service decision.",
        quotaGateReady: "Ready",
        quotaGateChecked: "Checked",
        runQuotaGate: "Run quota gate",
        featureKey: "Feature",
        quotaRequested: "Requested units",
        quotaDecision: "Decision",
        quotaAllowed: "Allowed",
        quotaBlocked: "Blocked",
        quotaReason: "Reason",
        quotaRemaining: "Remaining",
        subscription: "Subscription",
        creditPack: "Credit pack",
        creditPackName: "AI Credit pack",
        subscriptionDescription:
          "Unlock higher-tier template access and AI Credit.",
        creditPackDescription:
          "Add one-time AI Credit.",
        priceId: "Price ID",
        price: "Price",
        providerMapping: "Provider mapping",
        sandboxOnly: "local simulation",
        startCheckout: "Continue",
        currentPlanSelected: "Current plan",
        includedInCurrentPlan: "Covered by current plan",
        sandboxEyebrow: "Payment confirmation",
        planCheckoutTitle: "Confirm plan change",
        creditCheckoutTitle: "Top up AI Credit",
        sandboxTitle: "Confirm payment",
        sandboxDescription:
          "Review this payment. The local simulated payment method does not create a real charge.",
        sandboxMode: "Local simulation",
        sandboxActionTitle: "Payment details",
        sandboxActionDescription:
          "After confirmation, the system verifies the signed-in user and this payment session before updating plan access.",
        checkoutSession: "Payment session",
        confirmPayment: "Confirm payment",
        chooseSuccess: "Confirm payment",
        chooseCancel: "Cancel payment",
        chooseFailure: "Simulate failure",
        resultEyebrow: "Payment Result",
        resultTitles: {
          success: "Payment succeeded",
          cancel: "Payment canceled",
          failure: "Payment failed"
        },
        resultDescriptions: {
          success:
            "The system processed this simulated payment. Current account access follows server records.",
          cancel:
            "This payment was canceled. The plan should not upgrade.",
          failure: "Payment failed. The plan should not upgrade."
        },
        resultLabels: {
          success: "Success",
          cancel: "Canceled",
          failure: "Failed"
        },
        resultBoundaryTitle: "Access update",
        resultBoundaryDescription:
          "Payment results are recorded on the server first; this page only shows the result and current access.",
        resultNoGrant: "Server records only",
        returnToAccount: "Return to account",
        returnToBilling: "Return to plans",
        returnToUsage: "Return to AI",
        billingUnavailable: "Billing unavailable"
      }
    },
    errors: {
      fallback: "The action failed. Review the form and try again.",
      auth: {
        accountExists: "This email is already registered. Sign in instead.",
        configuration: "The Auth configuration for this environment needs review.",
        confirmationRequired: "Confirm this email before signing in.",
        email: "Enter a valid email address.",
        password: "Password must be at least 8 characters.",
        general: "The email or password could not be verified.",
        signUpGeneral: "The account could not be created. Review the email and try again."
      },
      profile: {
        displayName: "Display name must be 80 characters or fewer.",
        general: "Profile could not be saved. Try again later."
      },
      demo: {
        title: "Title must be 3 to 120 characters.",
        notes: "Notes must be 500 characters or fewer.",
        visibility: "Choose a valid visibility.",
        general: "Demo data could not be saved. Try again later."
      },
      ai: {
        prompt: "Enter at least 3 characters.",
        general: "AI draft could not be generated. Try again later."
      }
    }
  }
} as const;
