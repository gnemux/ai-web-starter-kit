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
        account: "账户",
        profile: "个人资料",
        billing: "套餐",
        usage: "AI"
      },
      accountMenu: {
        label: "账户菜单",
        signedIn: "已登录",
        dashboard: "工作台",
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
          dashboard: "工作台",
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
      badge: "产品点位 · 第一屏",
      title: "一句清晰的产品主张",
      titleAccent: "承接一个真实场景",
      description: "面向一个明确场景，交付一个可感知的结果。",
      primaryAction: "开始使用",
      secondaryAction: "登录",
      trustLine: "适用于早期验证、团队协作与持续迭代",
      metaLine: "身份 · 数据 · 服务层 · 部署",
      preview: {
        activity: "最近更新",
        description: "一条主要任务正在推进。",
        label: "产品界面",
        primaryPanel: "关键结果",
        secondaryPanel: "下一步动作",
        status: "当前状态",
        statusValue: "稳定运行",
        title: "核心工作区"
      },
      callouts: [
        {
          title: "核心场景",
          description: "用户在这里看到主要问题。"
        },
        {
          title: "用户价值",
          description: "一句话说明可以获得的结果。"
        },
        {
          title: "关键动作",
          description: "让下一步操作足够明确。"
        },
        {
          title: "结果反馈",
          description: "展示完成、进度或可信信号。"
        }
      ]
    },
    login: {
      subtitle: "eXtensible Web Launch Core",
      badge: "Supabase Auth",
      title: "登录后继续使用",
      description:
        "这里保留最小可复用账户流程：邮箱密码登录、注册、会话校验和安全事件记录。",
      createAccount: "创建账户",
      welcomeBack: "欢迎回来",
      startWithEmail: "使用邮箱注册",
      accessDashboard: "登录账户",
      providerNote: "请使用当前环境配置的 Supabase Auth 项目。",
      confirmationFailed: "确认链接无法验证。如账号已完成确认，请直接登录。",
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
        account: "Account",
        profile: "Profile",
        billing: "Plans",
        usage: "AI"
      },
      accountMenu: {
        label: "Account menu",
        signedIn: "Signed in",
        dashboard: "Dashboard",
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
          dashboard: "Dashboard",
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
      badge: "Product surface · First screen",
      title: "A clear product promise",
      titleAccent: "for one real scenario",
      description: "Focused on one audience, one job, and one visible outcome.",
      primaryAction: "Start now",
      secondaryAction: "Log in",
      trustLine: "Built for early validation, team workflows, and continuous iteration",
      metaLine: "Identity · Data · Service layer · Deployment",
      preview: {
        activity: "Recent activity",
        description: "A primary task is moving through the workspace.",
        label: "Product surface",
        primaryPanel: "Key outcome",
        secondaryPanel: "Next action",
        status: "Current state",
        statusValue: "Running steadily",
        title: "Core workspace"
      },
      callouts: [
        {
          title: "Core scene",
          description: "The main user problem is visible here."
        },
        {
          title: "User value",
          description: "A concise result the user can recognize."
        },
        {
          title: "Primary action",
          description: "The next step stays clear and reachable."
        },
        {
          title: "Outcome signal",
          description: "Progress, completion, or trust appears here."
        }
      ]
    },
    login: {
      subtitle: "eXtensible Web Launch Core",
      badge: "Supabase Auth",
      title: "Continue after login",
      description:
        "This keeps the reusable account flow small: email/password login, signup, session validation, and safe event tracking.",
      createAccount: "Create account",
      welcomeBack: "Welcome back",
      startWithEmail: "Start with email",
      accessDashboard: "Sign in",
      providerNote: "Use the Supabase Auth project configured for this environment.",
      confirmationFailed:
        "The confirmation link could not be verified. If the account is already confirmed, sign in directly.",
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
