export const dictionaries = {
  zh: {
    common: {
      brandSubtitle: "猫咪照护清单",
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
        catcare: "照护产品",
        cats: "猫咪档案",
        routines: "喂养习惯",
        items: "食物用品",
        events: "事件记录",
        plans: "照护计划",
        results: "结果查看",
        account: "账户",
        profile: "个人资料",
        billing: "套餐权益",
        usage: "智能"
      },
      accountMenu: {
        label: "账户菜单",
        signedIn: "已登录",
        dashboard: "工作台",
        catcare: "照护产品",
        account: "个人资料",
        billing: "套餐权益",
        usage: "智能",
        signOut: "退出登录",
        working: "退出中..."
      },
      footer: {
        ariaLabel: "页脚",
        description:
          "CatCare 帮助猫主人把临时照护安排整理成可分享、可执行、可追踪的清单。",
        languageTitle: "界面语言",
        productTitle: "产品入口",
        productLinks: {
          home: "首页",
          signUp: "注册",
          login: "登录",
          demo: "底座 Demo",
          dashboard: "工作台",
          catcare: "照护产品",
          account: "个人资料",
          billing: "套餐",
          usage: "智能额度"
        },
        capabilitiesTitle: "核心能力",
        capabilities: [
          "猫咪档案与日常习惯",
          "智能生成临时照护清单",
          "私密分享与结果回收",
          "智能摘要、套餐与额度"
        ],
        resourcesTitle: "使用场景",
        resources: [
          "周末外出",
          "朋友上门照看",
          "临时寄养",
          "异常复盘与分享内容"
        ],
        copyright: "© {year} XWLC. 保留所有权利。"
      }
    },
    home: {
      brandSubtitle: "猫咪照护清单",
      badge: "猫咪临时照护",
      title: "记录猫咪日常，",
      titleAccent: "出门前智能生成照护清单",
      description: "",
      headerAction: "立即开始",
      headerActionSignedIn: "进入工作台",
      primaryAction: "开始生成照护清单",
      primaryActionSignedIn: "进入照护工作台",
      secondaryAction: "查看示例清单",
      secondaryActionSignedIn: "进入照护工作台",
      demoLink: "底座 Demo",
      trustLine: "适用于寄养、朋友代看、短期上门照护",
      metaLine: "猫咪档案 · 照护计划 · 发布交接 · 提交回收",
      nav: {
        flow: "产品",
        features: "功能",
        pricing: "套餐",
        aiCredit: "帮助中心"
      },
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
        aiCredit: "智能额度",
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
      pricing: {
        title: "套餐与智能额度",
        paidStepTitle: "摘要 / 付费",
        paidStepDescription: "结果页触发智能摘要、专业版或一次性额度包。",
        freeTitle: "免费版",
        freePrice: "$0 / 永久",
        freeDescription: "2 次智能照护生成 / 月，适合首次体验。",
        proTitle: "专业版",
        proPrice: "$19 / 月",
        proDescription: "无限智能照护生成，多条照看记录与报告。",
        creditTitle: "智能额度包",
        creditPrice: "$9 / 10 次",
        creditDescription: "按需购买，永不过期。"
      },
      callouts: [
        {
          title: "猫咪档案",
          description: ""
        },
        {
          title: "喂养习惯",
          description: ""
        },
        {
          title: "事件记录",
          description: ""
        },
        {
          title: "智能生成清单",
          description: ""
        },
        {
          title: "私密分享",
          description: ""
        },
        {
          title: "照看者完成",
          description: ""
        },
        {
          title: "主人看结果",
          description: ""
        },
        {
          title: "AI 复盘分析",
          description: ""
        }
      ]
    },
    demo: {
      subtitle: "eXtensible Web Launch Core",
      badge: "Foundation Demo",
      title: "底座能力 Demo",
      description:
        "这里保留 starter kit 原有验证入口，用于检查登录、工作台、demo 数据、智能草稿、套餐、支付和智能额度等底座能力。CatCare 产品从首页和照护工作台进入。",
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
          description: "复用套餐、支付、智能额度和智能草稿验证面，不把它们复制进产品页面。"
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
    catcare: {
      subtitle: "CatCare product",
      badge: "MVP3 package consumer",
      eyebrow: "产品侧入口",
      title: "CatCare",
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
        shellSubtitle: "猫咪照护清单",
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
          onboarding: "新手进度",
          drafts: "草稿计划",
          published: "已发布",
          aiCredit: "智能额度"
        },
        hero: {
          primary: "智能生成照护清单",
          secondary: "查看产品账户",
          currentHandoff: "当前交接",
          noPlan: "还没有计划",
          noCat: "先创建猫咪档案"
        },
        dashboard: {
          topTitle: "工作台",
          badge: "主人工作台",
          dataReady: "数据已连接",
          dataNeedsReview: "服务需检查",
          title: "欢迎回来，先生成第一份可交接照护清单",
          description:
            "先沉淀猫咪档案和重复习惯，出门前智能生成临时照护清单。照看者按步骤完成，主人回到这里查看结果和付费摘要入口。",
          creditPrefix: "当前智能额度：",
          creditUnavailable: "暂不可用",
          progressTitle: "新手进度",
          progressDescription:
            "先完成猫咪档案和重复习惯，再生成第一份临时照护清单。用品和事件是增强项，不阻塞第一次体验。",
          guideTitle: "使用引导",
          workflowStepCount: "4 步",
          paywallTitle: "智能摘要 / 高级功能",
          paywallDescription:
            "免费版适合完成第一次临时照护。额度用完后，结果页会触发专业版或一次性智能额度包。",
          currentPlanLabel: "当前方案",
          aiCreditLabel: "智能额度",
          catsSublabel: "猫咪数量",
          plansSublabel: "照护计划",
          pendingSublabel: "待处理",
          creditSublabel: "本月免费 / 月限",
          addCatCta: "添加猫咪",
          recentPlansTitle: "最近照护计划",
          recentPlansDescription:
            "每份计划都是一张可交接的照护卡。发布后，照看结果会回收到同一张卡片。",
          itemsAndEvents: "用品与事件",
          itemsAndEventsDescription:
            "可选补充食物用品和事件，提高后续智能生成质量。",
          aiChecklist: "智能生成清单",
          publishShare: "发布分享",
          publishShareDescription:
            "发布后生成私密分享入口，照看者只看到本次需要执行的清单。",
          completedLabel: "已完成",
          pendingLabel: "待完成"
        },
        quickFlow: [
          {
            title: "录入猫咪与习惯",
            description: "先沉淀猫咪档案、重复喂养习惯和常用用品。"
          },
          {
            title: "智能生成临时清单",
            description: "出门前选择日期和场景，生成可检查的照护任务。"
          },
          {
            title: "私密分享给照看者",
            description: "照看者只看到本次照护所需内容，不进入主人账户。"
          },
          {
            title: "查看结果并复盘",
            description: "主人查看提交结果，智能摘要和内容生成作为付费点。"
          }
        ],
        sections: {
          cats: {
            title: "猫咪档案",
            description: "维护猫咪基础信息、性格、饮食禁忌和临时注意事项。",
            status: "第一步",
            primary: "创建猫咪档案",
            emptyTitle: "还没有猫咪档案",
            emptyDescription:
              "先创建猫咪档案，后续照护清单会围绕这只猫生成。",
            previewTitle: "档案会影响什么",
            previewItems: [
              {
                title: "照护建议",
                description: "年龄、性格、禁忌会影响智能生成的任务提示。"
              },
              {
                title: "匿名可见范围",
                description: "照看者只看到执行照护所需的最小信息。"
              }
            ]
          },
          routines: {
            title: "喂养习惯",
            description: "记录每天、每周或隔日重复的喂食、饮水、猫砂和照护习惯。",
            status: "重复照护",
            primary: "设置日常习惯",
            emptyTitle: "还没有日常习惯",
            emptyDescription:
              "把重复习惯先沉淀下来，出门时不用每次从零填写清单。",
            previewTitle: "生成清单来源",
            previewItems: [
              {
                title: "重复任务",
                description: "每天、每周或隔日重复的喂食、饮水、猫砂会自动带入。"
              },
              {
                title: "临时出门计划",
                description: "主人只补日期和特殊说明，不需要每次从零填写。"
              }
            ]
          },
          items: {
            title: "食物用品",
            description: "沉淀猫粮、罐头、零食、药品和猫砂等可复用资料。",
            status: "可选增强",
            primary: "添加用品",
            emptyTitle: "还没有用品资料",
            emptyDescription:
              "用品资料提高智能生成质量，但不阻塞第一次照护计划生成。",
            previewTitle: "为什么单独管理",
            previewItems: [
              {
                title: "减少重复输入",
                description: "常用猫粮、罐头、零食和药品可复用到不同计划。"
              },
              {
                title: "后续资料增强",
                description: "品牌、规格、用量和保质期可以逐步补全，不阻塞第一次使用。"
              }
            ]
          },
          events: {
            title: "事件记录",
            description: "记录生病、用药、医院、外出、加餐和异常等时间线事件。",
            status: "可选增强",
            primary: "记录事件",
            emptyTitle: "还没有事件记录",
            emptyDescription:
              "事件历史用于复盘和未来付费内容生成，不作为首访必填。",
            previewTitle: "事件不是习惯",
            previewItems: [
              {
                title: "一次性时间线",
                description: "生病、就医、外出、加餐都按日期记录。"
              },
              {
                title: "未来付费内容",
                description: "一段时间的事件可生成图文或视频复盘。"
              }
            ]
          },
          plans: {
            title: "照护计划",
            description: "把出门场景、日期、日常习惯和交接说明整理成可发布计划。",
            status: "即将开放",
            primary: "新建照护计划",
            emptyTitle: "还没有照护计划",
            emptyDescription:
              "这里会承接智能生成、主人确认、发布和私密分享入口。",
            previewTitle: "计划生成逻辑",
            previewItems: [
              {
                title: "不是手工清单",
                description: "默认从猫咪档案和喂养习惯生成，再让主人确认。"
              },
              {
                title: "发布前检查",
                description: "日期、任务、异常说明完整后才能进入分享。"
              }
            ]
          },
          results: {
            title: "结果查看",
            description: "主人查看照看者提交、异常、照片占位和后续智能摘要入口。",
            status: "等待提交",
            primary: "查看最近结果",
            emptyTitle: "还没有提交结果",
            emptyDescription:
              "照看者提交后，主人会在这里查看结果，并触发智能摘要或付费额度。",
            previewTitle: "付费触发点",
            previewItems: [
              {
                title: "智能摘要",
                description: "免费额度用完后触发套餐或一次性额度包。"
              },
              {
                title: "内容复盘",
                description: "事件和照片可在后续生成可分享内容。"
              }
            ]
          }
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
            "管理主人资料、照护套餐、支付入口和智能辅助额度。",
          account: "主人账户",
          billing: "照护套餐 / 账单",
          usage: "智能额度 / 用量",
          connected: "已接入",
          planned: "待开放",
          accountAction: "查看账户",
          billingAction: "查看套餐",
          usageAction: "查看用量",
          billingDescription:
            "发布第一份计划后，这里会承接照护套餐和支付动作。",
          billingPublishedDescription:
            "已有发布计划，后续可按套餐开放分享次数和支付动作。",
          usageDescription:
            "照护摘要、提醒文案和异常整理会使用这里的智能额度。"
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
      subtitle: "猫咪照护清单",
      badge: "主人账户",
      title: "登录后管理猫咪照护",
      description:
        "登录后进入 CatCare 工作台，继续创建猫咪档案、日常习惯和临时照护清单。",
      sideTitle: "科学照护，让每一只猫咪更安心",
      sideDescription:
        "主人先建立猫咪档案和日常习惯，再生成临时照护计划。照看者按步骤完成，结果回到主人工作台。",
      securityLine: "账户、套餐、支付和智能额度将服务于同一个 CatCare 主人账户。",
      createAccount: "创建账户",
      welcomeBack: "欢迎回来",
      startWithEmail: "创建主人账户",
      accessDashboard: "进入照护工作台",
      providerNote: "邮箱密码用于当前环境的猫咪照护产品账户。",
      rememberMe: "记住我",
      forgotPassword: "忘记密码？",
      confirmationFailed: "确认链接无法验证。如账号已完成确认，请直接登录。",
      productPoints: [
        {
          title: "创建猫咪档案",
          description: "记录猫咪的基本信息与健康状况。"
        },
        {
          title: "设置日常习惯",
          description: "根据需要制定与追踪照护计划。"
        },
        {
          title: "生成并分享照护清单",
          description: "一键生成清单，安全分享给照看者。"
        }
      ],
      oauth: {
        title: "或",
        google: "使用 Google 登录（预留）",
        apple: "使用 Apple 登录（预留）",
        unavailable: "后续接入"
      },
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
      shellSubtitle: "猫咪照护账户",
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
        usage: "智能"
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
        eyebrow: "账单与权益",
        title: "套餐与智能额度",
        description: "管理当前套餐、测试支付入口和智能额度。",
        catcareHeroTitle: "账单与权益",
        catcareHeroDescription:
          "查看当前套餐、智能照护次数、测试订单记录，并在触发付费点后回到原照护计划继续操作。",
        catcareSandboxNotice:
          "当前为测试环境，所有订单与支付均为测试数据，不会产生真实扣费。",
        catcareCurrentPlanTitle: "当前方案",
        catcareCreditTitle: "智能照护次数",
        catcarePaywallTitle: "解锁更多照护能力",
        catcarePaywallDescription:
          "免费版适合完成第一次临时照护。生成计划、结果复盘和更多额度会在结果页触发权益检查。",
        catcareReturnToPlan: "返回最近计划",
        catcareFlowTitle: "支付成功后会发生什么？",
        catcareFlowSteps: [
          "记录测试订单",
          "更新套餐或智能照护次数",
          "返回原计划继续生成复盘"
        ],
        catcareCreditPacksTitle: "一次性智能照护次数包",
        catcareCreditPacksDescription:
          "不切换套餐，只购买额外智能照护次数。适合偶发出行或临时照护场景。",
        catcareDisplay: {
          freeAiAllowance: "2 次智能照护 / 月",
          proAiAllowance: "25 次智能照护 / 月",
          creditPackAllowance: "10 次智能照护次数",
          freeCreditSummary: "2 / 2",
          proCreditSummary: "10 / 25",
          creditPackEmpty: "0 / 10",
          creditPackOwned: "已购买",
          freePrice: "$0",
          proPrice: "$19 / 月",
          creditPackPrice: "$9",
          creditPackOptions: [
            { price: "$9 / 10 次", description: "适合临时多生成几次计划或复盘" }
          ],
          orderColumns: {
            order: "订单号",
            type: "类型",
            amount: "金额",
            status: "状态",
            time: "时间",
            environment: "环境",
            change: "变动",
            balance: "发生后余额",
            description: "说明"
          },
          sandboxTag: "测试环境",
          viewAllOrders: "查看全部订单",
          viewAllLedger: "查看全部流水"
        },
        statusReady: "已同步",
        statusNeedsReview: "暂不可用",
        errorTitle: "套餐信息暂不可用",
        currentPlan: "当前套餐",
        subscriptionStatusLabel: "套餐状态",
        entitlements: "已包含权益",
        renewalDate: "续费时间",
        noRenewalDate: "暂无自动续费",
        viewUsage: "查看智能用量",
        planOptionsTitle: "选择套餐",
        planOptionsDescription: "查看当前套餐，并选择适合当前阶段的套餐。",
        currentPlanSelected: "当前套餐",
        freePrice: "$0",
        perMonth: "/ 月",
        recommended: "推荐",
        baseline: "基础",
        enabled: "已包含",
        disabled: "未包含",
        creditOverviewTitle: "智能额度账户",
        creditOverviewDescription:
          "这里展示当前可用于智能功能的智能额度，总量由套餐和额度包共同组成。",
        creditAvailable: "可用额度",
        planCreditRemaining: "套餐剩余额度",
        packCreditRemaining: "额度包",
        creditConsumed: "已消耗额度",
        creditPackTitle: "一次性智能补充包",
        creditPackDescription:
          "一次性增加 10 次生成计划或复盘次数，不改变当前套餐。",
        sandboxOnly: "本地模拟",
        planSwitchNote:
          "测试模式按目标套餐全额记录，不处理差额或退款。",
        upgradePlan: "升级套餐",
        switchPlan: "切换套餐",
        includedInCurrentPlan: "权益已覆盖",
        switchToFree: "切换到免费版",
        buyCreditPack: "购买一次性智能补充包",
        usageDemoTitle: "模拟智能使用",
        usageDemoDescription:
          "先使用一次模拟智能生成功能，系统会检查额度权益并记录本次消耗。额度不足时才提示升级套餐或充值额度包。",
        usageDemoRun: "模拟生成一次",
        usageDemoReady: "可使用",
        usageDemoBlocked: "需升级",
        usageDemoCost: 1,
        usageDemoCostLabel: "本次消耗",
        usageDemoRemaining: "当前可用",
        usageDemoLastResult: "上次结果",
        usageDemoNoResult: "尚未使用",
        usageDemoConsumed: "已消耗",
        usageDemoLimitReached: "已触发额度限制",
        creditAmount: "额度",
        price: "价格",
        planNames: {
          free: "免费版",
          plus: "进阶版",
          pro: "专业版"
        },
        planDescriptions: {
          free: "适合首次临时照护体验，包含基础清单和每月智能额度。",
          plus: "预留中间套餐，当前照护流程不在主流程展示。",
          pro: "适合持续使用，解锁更多智能照护生成、摘要和报告能力。"
        },
        planInheritance: {
          free: "基础能力",
          plus: "包含免费版全部内容",
          pro: "包含进阶版全部内容"
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
          projects: "猫咪档案",
          pages: "照护清单",
          leads: "照看记录",
          ai_tokens: "智能额度",
          custom_domain: "报告与导出"
        },
        units: {
          count: "次",
          credit: "智能额度",
          token: "智能额度"
        },
        planRecordsTitle: "套餐记录",
        planRecordsDescription: "最近的套餐消费记录。",
        emptyPlanRecords: "暂无套餐消费记录",
        aiRecordsTitle: "智能额度记录",
        aiRecordsDescription: "最近的充值和智能额度消耗记录。",
        creditRecordsTitle: "充值记录",
        usageRecordsTitle: "智能额度消耗记录",
        creditConsumptionRecordTitle: "智能额度消耗",
        emptyCreditRecords: "暂无充值记录",
        emptyUsageRecords: "暂无智能额度消耗记录",
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
        eyebrow: "智能额度",
        title: "智能用量",
        description:
          "查看 CatCare 可用智能额度、额度包充值和消耗记录。",
        productTitle: "CatCare 智能能力用量",
        productDescription:
          "智能额度会用于照护清单生成、照看结果摘要和未来图文/视频复盘。当前为测试支付环境，不产生真实扣款。",
        productFacts: [
          "生成照护清单前先检查可用额度",
          "结果摘要和异常复盘按次消耗",
          "事件复盘属于后续付费增强"
        ],
        paywallEyebrow: "来自 CatCare",
        paywallTitle: "智能照护次数不足",
        paywallDescription:
          "这次智能生成已被额度检查拦截。可购买一次性智能补充包，支付确认后回到原照护计划继续生成。",
        returnContext: "回流页面",
        topUpAction: "购买一次性智能补充包",
        returnAction: "先返回原计划"
      },
      payment: {
        eyebrow: "支付",
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
          "当前套餐和智能额度始终以账户状态为准。",
        quotaGateTitle: "权益检查验收",
        quotaGateDescription:
          "通过服务端权益记录检查占位权益是否可用。若被拦截，会从服务端判断结果上报额度限制事件。",
        quotaGateReady: "可检查",
        quotaGateChecked: "已检查",
        runQuotaGate: "运行权益检查",
        featureKey: "能力",
        quotaRequested: "请求数量",
        quotaDecision: "判断结果",
        quotaAllowed: "允许",
        quotaBlocked: "拦截",
        quotaReason: "原因",
        quotaRemaining: "剩余额度",
        subscription: "订阅",
        creditPack: "额度包",
        creditPackName: "智能额度包",
        subscriptionDescription:
          "解锁更高层级的模板权益和智能额度。",
        creditPackDescription:
          "一次性增加智能额度。",
        priceId: "价格编号",
        price: "价格",
        providerMapping: "支付映射",
        sandboxOnly: "本地模拟",
        startCheckout: "继续",
        currentPlanSelected: "当前已是此套餐",
        includedInCurrentPlan: "权益已覆盖",
        sandboxEyebrow: "支付确认",
        planCheckoutTitle: "确认套餐变更",
        creditCheckoutTitle: "充值智能额度",
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
        resultEyebrow: "支付结果",
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
        returnToUsage: "返回智能用量",
        returnToCatCare: "返回照护计划",
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
        general: "智能草稿暂时无法生成，请稍后重试。"
      }
    }
  },
  en: {
    common: {
      brandSubtitle: "Cat care checklist",
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
        catcare: "Care product",
        cats: "Cat profiles",
        routines: "Care routines",
        items: "Food & supplies",
        events: "Event log",
        plans: "Care plans",
        results: "Results",
        account: "Account",
        profile: "Profile",
        billing: "Plans & entitlements",
        usage: "AI"
      },
      accountMenu: {
        label: "Account menu",
        signedIn: "Signed in",
        dashboard: "Dashboard",
        catcare: "Care product",
        account: "Profile",
        billing: "Plans & entitlements",
        usage: "AI",
        signOut: "Sign out",
        working: "Signing out..."
      },
      footer: {
        ariaLabel: "Footer",
        description:
          "CatCare helps owners turn temporary cat care into a shareable, executable, trackable checklist.",
        languageTitle: "Interface language",
        productTitle: "Product",
        productLinks: {
          home: "Home",
          signUp: "Sign up",
          login: "Log in",
          demo: "Foundation demo",
          dashboard: "Dashboard",
          catcare: "Care product",
          account: "Profile",
          billing: "Plans",
          usage: "AI"
        },
        capabilitiesTitle: "Core capabilities",
        capabilities: [
          "Cat profiles and recurring routines",
          "AI-generated temporary checklists",
          "Private sharing and returned results",
          "AI summaries, plans, and credit"
        ],
        resourcesTitle: "Use cases",
        resources: [
          "Weekend away",
          "Friend home visit",
          "Temporary boarding",
          "Exception review and recap"
        ],
        copyright: "© {year} XWLC. All rights reserved."
      }
    },
    home: {
      brandSubtitle: "Cat care checklist",
      badge: "Temporary cat care",
      title: "Record daily care,",
      titleAccent: "generate sitter checklists with AI",
      description:
        "Turn daily routines into a private sitter checklist before you leave.",
      headerAction: "Get started",
      headerActionSignedIn: "Open workspace",
      primaryAction: "Start checklist",
      primaryActionSignedIn: "Open care workspace",
      secondaryAction: "View sample",
      secondaryActionSignedIn: "Open care workspace",
      demoLink: "Foundation demo",
      trustLine: "Built for boarding, friend care, and short home visits",
      metaLine: "Cat profile · Care plan · Handoff · Result return",
      nav: {
        flow: "Product",
        features: "Features",
        pricing: "Plans",
        aiCredit: "Help center"
      },
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
      pricing: {
        title: "Plans and AI Credit",
        paidStepTitle: "Summary / paid step",
        paidStepDescription: "Results trigger AI summary, Pro, or one-time credit packs.",
        freeTitle: "Free",
        freePrice: "$0",
        freeDescription: "2 AI care generations per month for first-time care.",
        proTitle: "Pro",
        proPrice: "$19 / mo",
        proDescription: "Unlimited AI care generation, more records, and reports.",
        creditTitle: "AI Credit pack",
        creditPrice: "$9 / 10 uses",
        creditDescription: "One-time credits. Never expires."
      },
      callouts: [
        {
          title: "Cat profile",
          description: "Cat profile"
        },
        {
          title: "Routine",
          description: "Routine"
        },
        {
          title: "Events",
          description: "Events"
        },
        {
          title: "AI checklist",
          description: "AI checklist"
        },
        {
          title: "Share",
          description: "Private share"
        },
        {
          title: "Sitter completes",
          description: "Sitter completes"
        },
        {
          title: "Owner review",
          description: "Owner review"
        },
        {
          title: "AI review",
          description: "AI review"
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
    catcare: {
      subtitle: "CatCare product",
      badge: "MVP3 package consumer",
      eyebrow: "Product-side entry",
      title: "CatCare",
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
        shellSubtitle: "Cat care checklist",
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
          onboarding: "Onboarding",
          drafts: "Draft plans",
          published: "Published",
          aiCredit: "AI Credit"
        },
        hero: {
          primary: "Generate care checklist with AI",
          secondary: "View product account",
          currentHandoff: "Current handoff",
          noPlan: "No plan yet",
          noCat: "Create a cat profile first"
        },
        dashboard: {
          topTitle: "Dashboard",
          badge: "Owner workspace",
          dataReady: "Data connected",
          dataNeedsReview: "Service needs review",
          title: "Welcome back. Generate the first handoff-ready care checklist.",
          description:
            "Capture cat profiles and recurring routines, then use AI to generate a temporary care checklist before leaving. Sitters follow the steps; owners return here for results and paid summary entry.",
          creditPrefix: "Current AI Credit:",
          creditUnavailable: "Unavailable",
          progressTitle: "Getting started",
          progressDescription:
            "Complete the cat profile and recurring routine first, then generate the first temporary care checklist. Supplies and events improve output but do not block the first run.",
          guideTitle: "Workflow guide",
          workflowStepCount: "4 steps",
          paywallTitle: "AI summaries / advanced features",
          paywallDescription:
            "Free is enough for the first temporary-care handoff. When credit runs out, the results page prompts Pro or a one-time AI Credit pack.",
          currentPlanLabel: "Current plan",
          aiCreditLabel: "AI credits",
          catsSublabel: "Cats",
          plansSublabel: "Care plans",
          pendingSublabel: "Pending",
          creditSublabel: "Monthly free / limit",
          addCatCta: "Add cat",
          recentPlansTitle: "Recent care plans",
          recentPlansDescription:
            "Each plan is a handoff card. Once published, sitter results return to the same card.",
          itemsAndEvents: "Supplies and events",
          itemsAndEventsDescription:
            "Optionally add supplies and recent events to improve future AI-generated checklists.",
          aiChecklist: "AI checklist",
          publishShare: "Publish and share",
          publishShareDescription:
            "Publishing creates a private sharing entry so sitters only see this checklist.",
          completedLabel: "Completed",
          pendingLabel: "Pending"
        },
        quickFlow: [
          {
            title: "Capture cat and routines",
            description: "Store cat context, recurring care habits, and reusable supplies."
          },
          {
            title: "Generate a temporary checklist",
            description: "Choose dates and context before reviewing the generated care tasks."
          },
          {
            title: "Share privately with the sitter",
            description: "The sitter sees only what this handoff requires, not the owner account."
          },
          {
            title: "Review results and recap",
            description: "Owners review submissions; AI summaries and content recaps become paid triggers."
          }
        ],
        sections: {
          cats: {
            title: "Cat profiles",
            description: "Maintain basic details, temperament, food restrictions, and short-term care notes.",
            status: "First step",
            primary: "Create cat profile",
            emptyTitle: "No cat profiles yet",
            emptyDescription:
              "Create a cat profile first so future care checklists can be generated around this cat.",
            previewTitle: "What profiles affect",
            previewItems: [
              {
                title: "Care guidance",
                description: "Age, temperament, and restrictions shape generated task hints."
              },
              {
                title: "Anonymous visibility",
                description: "Sitters see only the minimum context needed for this handoff."
              }
            ]
          },
          routines: {
            title: "Care routines",
            description: "Capture daily, weekly, or every-other-day feeding, water, litter, and care routines.",
            status: "Recurring care",
            primary: "Set routine",
            emptyTitle: "No routines yet",
            emptyDescription:
              "Store repeated habits once so each trip does not start from a blank checklist.",
            previewTitle: "Checklist source",
            previewItems: [
              {
                title: "Recurring tasks",
                description: "Daily, weekly, or every-other-day feeding, water, and litter tasks are reused."
              },
              {
                title: "Temporary travel plan",
                description: "Owners add dates and exceptions instead of starting from scratch."
              }
            ]
          },
          items: {
            title: "Food & supplies",
            description: "Store reusable food, wet food, treats, medication, and litter details.",
            status: "Optional enrichment",
            primary: "Add supply",
            emptyTitle: "No supply details yet",
            emptyDescription:
              "Supply details improve AI output quality but do not block the first care-plan generation.",
            previewTitle: "Why separate it",
            previewItems: [
              {
                title: "Less repeated entry",
                description: "Food, wet food, treats, medication, and litter can be reused across plans."
              },
              {
                title: "Future recognition",
                description: "Barcode or package recognition is a later enhancement, not a first-run blocker."
              }
            ]
          },
          events: {
            title: "Event log",
            description: "Track illness, medication, vet visits, outings, extra food, and exceptions over time.",
            status: "Optional enrichment",
            primary: "Record event",
            emptyTitle: "No events yet",
            emptyDescription:
              "Event history supports review and future paid recap generation, but is not required on first visit.",
            previewTitle: "Events are not routines",
            previewItems: [
              {
                title: "One-off timeline",
                description: "Illness, vet visits, outings, and extra food are date-based records."
              },
              {
                title: "Future paid content",
                description: "A period of events can become a text or video recap later."
              }
            ]
          },
          plans: {
            title: "Care plans",
            description: "Turn travel scenarios, dates, routines, and handoff notes into publishable plans.",
            status: "Coming soon",
            primary: "New care plan",
            emptyTitle: "No care plans yet",
            emptyDescription:
              "This area will carry AI generation, owner review, publishing, and private sharing entry.",
            previewTitle: "Plan generation logic",
            previewItems: [
              {
                title: "Not a manual checklist",
                description: "Default from cat profiles and routines, then let the owner review."
              },
              {
                title: "Pre-publish check",
                description: "Dates, tasks, and exception notes should be complete before sharing."
              }
            ]
          },
          results: {
            title: "Results",
            description: "Owners review sitter submissions, exceptions, media placeholders, and future AI summary entry.",
            status: "Awaiting submissions",
            primary: "View latest result",
            emptyTitle: "No results yet",
            emptyDescription:
              "After sitter submission, owners review results here and trigger AI summaries or paid credit.",
            previewTitle: "Paid triggers",
            previewItems: [
              {
                title: "AI summary",
                description: "After the free allowance, prompt subscription or one-time credit packs."
              },
              {
                title: "Content recap",
                description: "Events and media can later generate shareable recap content."
              }
            ]
          }
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
          billingPublishedDescription:
            "A published plan exists; later plan limits and payment actions can attach here.",
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
      subtitle: "Cat care checklist",
      badge: "Owner account",
      title: "Sign in to manage cat care",
      description:
        "Sign in to the CatCare workspace and continue with cat profiles, recurring routines, and temporary care checklists.",
      sideTitle: "Scientific care for calmer cat handoffs",
      sideDescription:
        "Owners set up cat profiles and daily routines, then generate a temporary care plan. Sitters follow the steps and results return to the owner workspace.",
      securityLine: "Account, billing, payment, and AI Credit attach to the same CatCare owner account.",
      createAccount: "Create account",
      welcomeBack: "Welcome back",
      startWithEmail: "Create owner account",
      accessDashboard: "Open care workspace",
      providerNote: "Email and password sign in to the current cat-care product environment.",
      rememberMe: "Remember me",
      forgotPassword: "Forgot password?",
      confirmationFailed:
        "The confirmation link could not be verified. If the account is already confirmed, sign in directly.",
      productPoints: [
        {
          title: "Create cat profile",
          description: "Record basic cat details and health context."
        },
        {
          title: "Set daily routine",
          description: "Build and track recurring care plans."
        },
        {
          title: "Generate and share checklist",
          description: "Create a checklist and share it safely with the sitter."
        }
      ],
      oauth: {
        title: "or",
        google: "Continue with Google (reserved)",
        apple: "Continue with Apple (reserved)",
        unavailable: "Coming later"
      },
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
      shellSubtitle: "CatCare account",
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
        eyebrow: "Billing and access",
        title: "Plans and AI Credit",
        description:
          "Manage the current CatCare plan, sandbox/test payment entry, and AI credit.",
        catcareHeroTitle: "Billing and access",
        catcareHeroDescription:
          "Review the current CatCare plan, AI-summary credit, sandbox/test orders, and return to the original care plan after a paid action.",
        catcareSandboxNotice:
          "This is a sandbox/test environment. Orders and payments are test records and never create a real charge.",
        catcareCurrentPlanTitle: "Current plan",
        catcareCreditTitle: "AI care uses",
        catcarePaywallTitle: "Unlock more care capability",
        catcarePaywallDescription:
          "Free is enough for the first temporary-care handoff. Care-plan generation, result recaps, exports, and additional uses are gated from the results page.",
        catcareReturnToPlan: "Return to recent plan",
        catcareFlowTitle: "What happens after payment?",
        catcareFlowSteps: [
          "Record sandbox order",
          "Update plan or AI care uses",
          "Return to the original plan and continue the recap"
        ],
        catcareCreditPacksTitle: "One-time AI care use packs",
        catcareCreditPacksDescription:
          "Buy extra AI care uses without switching plans. Useful for occasional trips or temporary care.",
        catcareDisplay: {
          freeAiAllowance: "2 AI care uses / month",
          proAiAllowance: "25 AI care uses / month",
          creditPackAllowance: "10 AI care uses",
          freeCreditSummary: "2 / 2",
          proCreditSummary: "10 / 25",
          creditPackEmpty: "0 / 10",
          creditPackOwned: "Purchased",
          freePrice: "$0",
          proPrice: "$19 / mo",
          creditPackPrice: "$9",
          creditPackOptions: [
            { price: "$9 / 10", description: "For a few extra recaps or checklist generations" }
          ],
          orderColumns: {
            order: "Order",
            type: "Type",
            amount: "Amount (USD)",
            status: "Status",
            time: "Time",
            environment: "Environment",
            change: "Change",
            balance: "Balance after",
            description: "Description"
          },
          sandboxTag: "sandbox/test",
          viewAllOrders: "View all orders",
          viewAllLedger: "View all ledger"
        },
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
        creditPackTitle: "One-time AI top-up",
        creditPackDescription:
          "Add 100,000 Credit once without changing the current plan.",
        sandboxOnly: "Local simulation",
        planSwitchNote:
          "Test mode records the target plan at full price; proration and refunds are not handled here.",
        upgradePlan: "Upgrade plan",
        switchPlan: "Switch plan",
        includedInCurrentPlan: "Covered by current plan",
        switchToFree: "Switch to Free",
        buyCreditPack: "Buy one-time AI top-up",
        usageDemoTitle: "Simulate AI usage",
        usageDemoDescription:
          "Use one simulated AI generation first. The system checks Credit access and records the usage. Upgrade the plan or top up a credit pack only when quota is blocked.",
        usageDemoRun: "Generate once",
        usageDemoReady: "Available",
        usageDemoBlocked: "Upgrade needed",
        usageDemoCost: 1,
        usageDemoCostLabel: "This use costs",
        usageDemoRemaining: "Available now",
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
          free: "For a first temporary-care handoff, with base checklist access and monthly AI credit.",
          plus:
            "Reserved middle tier. CatCare does not show it in the main flow yet.",
          pro: "For ongoing use, with more AI care generation, summaries, and reports.",
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
          projects: "Cat profiles",
          pages: "Care checklists",
          leads: "Sitter records",
          ai_tokens: "AI Credit",
          custom_domain: "Reports and exports"
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
        eyebrow: "AI Credit",
        title: "AI usage",
        description:
          "Review CatCare AI Credit, credit-pack top-ups, and usage records.",
        productTitle: "CatCare AI usage",
        productDescription:
          "AI Credit powers care-checklist generation, sitter-result summaries, and future text/video recaps. This stays sandbox/test and creates no real charge.",
        productFacts: [
          "Check available credit before generating care plans",
          "Result summaries and exception reviews consume credits",
          "Event recaps remain a later paid enhancement"
        ],
        paywallEyebrow: "From CatCare",
        paywallTitle: "AI care uses are depleted",
        paywallDescription:
          "The Billing gate blocked this AI action. Buy a one-time AI top-up, confirm payment, and return to the care plan to continue.",
        returnContext: "Return page",
        topUpAction: "Buy one-time AI top-up",
        returnAction: "Return to plan first"
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
        returnToCatCare: "Return to care plan",
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
