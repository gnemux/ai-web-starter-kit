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
        overview: "首页",
        dashboard: "工作台",
        account: "账户"
      },
      navDescription: {
        overview: "开始",
        dashboard: "数据",
        account: "资料"
      }
    },
    home: {
      badge: "模板工程",
      title: "一个干净、可生长的 Web 产品起点",
      description:
        "默认提供登录注册、受保护工作区、账户资料和服务层数据示例。界面只保留真实可用能力，方便后续产品在清晰框架上继续迭代。",
      primaryAction: "开始注册",
      secondaryAction: "已有账户，去登录",
      featureTitle: "当前已具备",
      features: [
        {
          title: "邮箱注册与登录",
          description: "Supabase Auth 负责身份、会话和受保护路由。"
        },
        {
          title: "账户资料",
          description: "用户可维护 display name，数据受 RLS 保护。"
        },
        {
          title: "Demo 数据流",
          description: "可创建 demo item，用于验证页面到服务到数据库的边界。"
        }
      ],
      workflowTitle: "推荐使用路径",
      workflow: [
        "先注册或登录测试账号",
        "登录后创建一条 demo item",
        "在账户页更新 profile，验证受保护数据链路"
      ],
      noteTitle: "开发提示",
      note:
        "未实现的支付、计费、分析和 AI 能力不会在界面中伪装成产品功能；它们应先进入规格，再进入实现。"
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
        "这里展示模板当前已经可用的功能：账户会话、profile 状态，以及经过服务层和 RLS 保护的 demo 数据。",
      accountButton: "账户设置",
      metrics: {
        session: {
          label: "会话",
          value: "有效",
          detail: "页面渲染前已通过 Supabase claims 校验。"
        },
        profile: {
          label: "Profile",
          ready: "已设置",
          empty: "未填写",
          readyDetail: "账户资料可在账户页继续维护。",
          emptyDetail: "还没有 display name，可在账户页补充。"
        },
        data: {
          label: "数据服务",
          value: "已接入",
          detail: "demo_items 通过 Server Action 和服务层写入。"
        }
      },
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
      },
      boundaries: {
        title: "实现边界",
        description:
          "页面只组合结果；鉴权、验证、Provider 调用和错误归一都在服务层内完成。",
        items: [
          "页面不直接导入 Supabase SDK",
          "受保护路由依赖服务端 session 校验",
          "用户数据由 RLS 做最终保护"
        ],
        longLabel: "长内容约束",
        longText:
          "这里保留一段较长的中文说明，用于验证真实产品文案在卡片和移动端布局中会自动换行，不会撑破容器，也不会和操作按钮重叠。"
      }
    },
    account: {
      shellSubtitle: "eXtensible Web Launch Core",
      title: "账户设置",
      eyebrow: "Profile",
      description:
        "维护当前登录用户的最小账户资料。profile 数据写入 Supabase，并由 RLS 限制为本人可改。",
      dashboardButton: "返回工作台",
      emailLabel: "邮箱",
      metrics: {
        session: {
          label: "会话",
          value: "有效",
          detail: "受保护页面渲染前已校验登录状态。"
        },
        profile: {
          label: "资料",
          ready: "已设置",
          empty: "未填写",
          readyDetail: "当前账户已存在 profile row。",
          emptyDetail: "display name 为空时会回退显示邮箱。"
        },
        analytics: {
          label: "事件",
          value: "安全",
          detail: "仅记录安全的 Auth 事件，不发送密码或 token。"
        }
      },
      profile: {
        title: "个人资料",
        description: "后续产品可在这个 profile 模型上继续扩展。",
        displayName: "显示名称",
        save: "保存资料",
        saving: "保存中...",
        updated: "资料已更新。"
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
        overview: "Home",
        dashboard: "Dashboard",
        account: "Account"
      },
      navDescription: {
        overview: "Start",
        dashboard: "Data",
        account: "Profile"
      }
    },
    home: {
      badge: "Starter template",
      title: "A clean Web product foundation that can grow",
      description:
        "The template starts with sign up, login, a protected workspace, account profile, and a service-layer data example. The interface only keeps working capabilities so future product work stays focused.",
      primaryAction: "Create account",
      secondaryAction: "Log in",
      featureTitle: "Available now",
      features: [
        {
          title: "Email auth",
          description: "Supabase Auth owns identity, sessions, and protected routes."
        },
        {
          title: "Account profile",
          description: "Users can maintain a display name protected by RLS."
        },
        {
          title: "Demo data example",
          description: "Create demo items through the page-service-database boundary."
        }
      ],
      workflowTitle: "Recommended path",
      workflow: [
        "Create or log in with a test account",
        "Create one demo item after login",
        "Update profile data on the account page"
      ],
      noteTitle: "Developer note",
      note:
        "Unimplemented payment, billing, analytics, and AI capabilities are not presented as product features. They should enter specs before implementation."
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
        "This page shows the template capabilities that work today: account session, profile state, and demo data protected by the service layer and RLS.",
      accountButton: "Account settings",
      metrics: {
        session: {
          label: "Session",
          value: "Active",
          detail: "Supabase claims are validated before the page renders."
        },
        profile: {
          label: "Profile",
          ready: "Ready",
          empty: "Empty",
          readyDetail: "Profile data can be maintained from the account page.",
          emptyDetail: "No display name yet; the UI falls back to email."
        },
        data: {
          label: "Data service",
          value: "Connected",
          detail: "demo_items writes go through a Server Action and service boundary."
        }
      },
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
      },
      boundaries: {
        title: "Implementation boundary",
        description:
          "Pages compose results only. Auth checks, validation, provider calls, and safe error mapping stay in services.",
        items: [
          "Pages do not import the Supabase SDK directly",
          "Protected routes rely on server-side session checks",
          "RLS remains the final guard for user data"
        ],
        longLabel: "Long content constraint",
        longText:
          "This longer implementation note verifies that real product copy wraps cleanly inside cards and mobile layouts without forcing horizontal scrolling or overlapping actions."
      }
    },
    account: {
      shellSubtitle: "eXtensible Web Launch Core",
      title: "Account settings",
      eyebrow: "Profile",
      description:
        "Maintain the minimal profile for the signed-in user. Profile data is written to Supabase and RLS limits updates to the owner.",
      dashboardButton: "Back to dashboard",
      emailLabel: "Email",
      metrics: {
        session: {
          label: "Session",
          value: "Active",
          detail: "Protected pages validate the signed-in state before rendering."
        },
        profile: {
          label: "Profile",
          ready: "Ready",
          empty: "Empty",
          readyDetail: "The current account has a profile row.",
          emptyDetail: "When display name is empty, the UI falls back to email."
        },
        analytics: {
          label: "Events",
          value: "Safe",
          detail: "Only safe Auth events are captured; passwords and tokens are never sent."
        }
      },
      profile: {
        title: "Profile",
        description: "Future products can extend this profile model.",
        displayName: "Display name",
        save: "Save profile",
        saving: "Saving...",
        updated: "Profile updated."
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
