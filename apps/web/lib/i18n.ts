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
        account: "账户"
      },
      accountMenu: {
        label: "账户菜单",
        signedIn: "已登录",
        dashboard: "工作台",
        account: "账户设置",
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
          account: "账户设置"
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
      confirmationFailed: "确认链接无法验证，请重新登录或重新注册。",
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
        "这里保留模板当前可直接测试的功能：创建、读取 demo item，验证页面、Server Action、服务层、Supabase 和 RLS 的完整链路。",
      demo: {
        title: "Demo 数据",
        description:
          "创建一条最小业务记录，用于验证表单、Server Action、服务层、Supabase 和 RLS 的完整链路。",
        statusReady: "可读写",
        statusError: "需检查",
        emptyTitle: "还没有 demo item",
        emptyDescription: "创建第一条记录，验证当前账户的数据写入和读取流程。",
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
      }
    },
    account: {
      shellSubtitle: "eXtensible Web Launch Core",
      title: "账户设置",
      eyebrow: "Profile",
      description:
        "维护当前登录用户的最小账户资料。这里只保留邮箱展示与 display name 保存这条真实可测试链路。",
      emailLabel: "邮箱",
      profile: {
        title: "个人资料",
        description: "保存后会写入当前用户自己的 profile 记录。",
        displayName: "显示名称",
        save: "保存资料",
        saving: "保存中...",
        updated: "资料已更新。"
      },
      billing: {
        title: "计费与权益",
        description:
          "这里展示 MVP2 Billing 底座当前可人工验收的状态：当前账户权益、Free/Pro 套餐配置、AI 额度包和 provider 映射边界。",
        statusReady: "可验收",
        statusNeedsReview: "需检查",
        errorTitle: "Billing service 暂不可用",
        currentPlan: "当前账户计划",
        currentDescription:
          "未产生可信订阅事实时，账户默认回退到 Free 权益；后续 Payment sandbox 或真实 provider 会通过服务端事件更新 Billing facts。",
        entitlements: "当前权益",
        recommended: "推荐",
        baseline: "基础",
        enabled: "已启用",
        disabled: "未启用",
        creditPackTitle: "AI 额度包",
        creditPackDescription:
          "一次性额度包先保留为 Billing/Pricing contract，真实 checkout 与发放会由后续 Payment / AI 任务接入。",
        sandboxOnly: "Sandbox 预留",
        creditAmount: "额度",
        price: "价格",
        providerMapping: "Provider 映射",
        notMapped: "尚未绑定真实 price id",
        planNames: {
          free: "Free",
          pro: "Pro"
        },
        planDescriptions: {
          free: "默认免费计划，用于未付费账户、注册后试用和本地验收。",
          pro: "付费订阅计划模板，用于后续 sandbox checkout、真实支付和产品验证。"
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
          projects: "项目数",
          pages: "页面数",
          leads: "线索数",
          ai_tokens: "AI tokens",
          custom_domain: "自定义域名"
        },
        units: {
          count: "次",
          token: "tokens"
        }
      }
    },
    errors: {
      fallback: "操作失败，请检查表单后重试。",
      auth: {
        email: "请输入有效邮箱。",
        password: "密码至少需要 8 个字符。",
        general: "邮箱或密码无法验证，请检查后重试。"
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
        account: "Account"
      },
      accountMenu: {
        label: "Account menu",
        signedIn: "Signed in",
        dashboard: "Dashboard",
        account: "Account settings",
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
          account: "Account settings"
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
      confirmationFailed: "The confirmation link could not be verified.",
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
        "This page keeps the template's directly testable flow: create and read demo items through the page, Server Action, service layer, Supabase, and RLS.",
      demo: {
        title: "Demo data",
        description:
          "Create a minimal business record to verify the form, Server Action, service layer, Supabase, and RLS flow.",
        statusReady: "Writable",
        statusError: "Check needed",
        emptyTitle: "No demo items yet",
        emptyDescription: "Create the first record to verify account-scoped reads and writes.",
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
      }
    },
    account: {
      shellSubtitle: "eXtensible Web Launch Core",
      title: "Account settings",
      eyebrow: "Profile",
      description:
        "Maintain the minimal profile for the signed-in user. This page keeps only the real testable email and display-name flow.",
      emailLabel: "Email",
      profile: {
        title: "Profile",
        description: "Saving writes to the signed-in user's own profile row.",
        displayName: "Display name",
        save: "Save profile",
        saving: "Saving...",
        updated: "Profile updated."
      },
      billing: {
        title: "Billing and access",
        description:
          "This surfaces the MVP2 Billing foundation for human review: current account entitlements, Free/Pro plan config, AI credit pack, and provider mapping boundaries.",
        statusReady: "Reviewable",
        statusNeedsReview: "Needs review",
        errorTitle: "Billing service unavailable",
        currentPlan: "Current account plan",
        currentDescription:
          "Without a trusted subscription fact, the account falls back to Free entitlements. Future Payment sandbox or real provider events update Billing facts on the server.",
        entitlements: "Current entitlements",
        recommended: "Recommended",
        baseline: "Baseline",
        enabled: "Enabled",
        disabled: "Disabled",
        creditPackTitle: "AI credit pack",
        creditPackDescription:
          "The one-time credit pack is reserved as a Billing/Pricing contract. Real checkout and credit grants belong to later Payment / AI tasks.",
        sandboxOnly: "Sandbox reserved",
        creditAmount: "Credit",
        price: "Price",
        providerMapping: "Provider mapping",
        notMapped: "No real price id yet",
        planNames: {
          free: "Free",
          pro: "Pro"
        },
        planDescriptions: {
          free: "The default free plan for unpaid accounts, signup trials, and local review.",
          pro: "The paid subscription template for sandbox checkout, real payment, and product validation.",
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
          projects: "Projects",
          pages: "Pages",
          leads: "Leads",
          ai_tokens: "AI tokens",
          custom_domain: "Custom domain"
        },
        units: {
          count: "count",
          token: "tokens"
        }
      }
    },
    errors: {
      fallback: "The action failed. Review the form and try again.",
      auth: {
        email: "Enter a valid email address.",
        password: "Password must be at least 8 characters.",
        general: "The email or password could not be verified."
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
      }
    }
  }
} as const;
