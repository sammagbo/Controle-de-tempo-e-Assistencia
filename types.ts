export interface User {
  name: string;
  role: string;
  avatarUrl: string;
}

export interface AgendaItem {
  id: string;
  topic: string;
  durationMinutes: number;
  assignee?: User;
  status: 'completed' | 'active' | 'upcoming';
  startTime?: string;
}

export interface Meeting {
  id: string;
  title: string;
  description: string;
  dateRange: string;
  status: 'Upcoming' | 'Scheduled' | 'Completed';
  week: string;
  weekNumber: string;
  type: string;
}

export const CURRENT_USER: User = {
  name: "Admin",
  role: "Administrator",
  avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBHRmC1Pp7J99QakZ3NtozN0l4FOEchrYdJQuH5hKWDQdtLNMyD8QJsWOEaeCzAWidiiTPfbgLk0IA0TjWtS-yBRmgEkMR2iqgi7xnBr24laCFWg5x7cstCCfSkkjcqgtI6EK0KYmBYd3BU90J_zCrcv8UV1s_b22NlxJ5KWi6r-itf9fwcvgs5mO_ke9Af_xLSB7VgzVLAD7M525kqYtG9L_6r54XbD-VlRE4_rT63xyFEvde3dhSEWZyh3Owtfck_I5fRsYLW9I6A"
};

export const SAMPLE_USERS: Record<string, User> = {
  john: {
    name: "John Doe",
    role: "Manager",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAosbv-roUjzm7v4hGb_OZWYMZD3A4IxJLxKN0QtAvTo6MDgXIdmvRt0CeBU7SNOJ7zKDBeKlP-CSp6x6VkEVihUppuZcmP9zBxDrE8yNIGTc1Ypf_RSUmCl53JvMQmYCKZrfr7wf2WbiJBkpGsN8X3UTLjJMUcsxjOM9ybXwufTitD9oLwH6akUjL7qhfxK_GQrOfkoeBd-XTcISa3G2DBxlggHuCoUjehrs_-G_KF1jgDQQwaxupxLF41iNBw8eb4u2OxuCHcwDGe"
  },
  jane: {
    name: "Jane Smith",
    role: "CFO",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuC5-Zn6dRiLoSOLuYyi2Oo6irpw7axBIm1DTCGlH1Z02X5pwGQzKobzd-yyhMOpaj6IKAdlPXu3PP7LAnGtO2k_P9cTECzaRFNBa8DAwvtGn3iVHOPW3VmfytLHZl2eyQ2qCSWBAjGElxHw4t58fkVmDpIZqO34k79H1mDzAf3AkKLz1NwWMla4vGoSCfrRUdvB3tIToylOWPlVOLN0_HMsRFngg--4FAu2zhaVc-qpZgNM_9BbDYrNZ04qxjibDfqbWL9OZ-j_mOMz"
  },
  sarah: {
    name: "Sarah Jenkins",
    role: "Lead Researcher",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuArSlENG8IDNavlQ19VKQtvBlIqwDnvyir-jTfj4fLIfyvpfPuwejQK6WXGsA9CuTAYg0HuhQQC5G5S298NKcNhq1NnWxeS2Z0IfK0UwGmCcz4HVXzXhkqsFUi3eQB0F0bLYOcw8im9_WrPPfyzBB4BIf4IcTgZA8m-ik8KuMts4TLzBe1wFJKWPNTmvno2Po0VXNE1KroW-Mma5E50vbCSqTl59irQ8JPpbgPvCWjP18yjnIgkGpz1qlid1k1vtT56e7ZVjfp5eTxo"
  },
  mike: {
    name: "Mike Ross",
    role: "Backend Engineer",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBwcyb5cAaz90PHGa82JQAadpBk002JoRArjUPsYtEVnQ19ps691YCUj1qXhFgeUSdULN_ebUTS2zxzflAolOEA_z9w0EDTzteufpD4rtUkU9eu-W2bU05Vr9Q7BQymO6lb5rfv89ghC45jKntrrP1ai-Ol6BoqUnfllIrdQs-2pzOKk5hBGa87DUnHWcsDtxoWRRlhY5RJa_XepB3OHrruJ-F6wVzPNIR_RcdwTj0sX2QCUD-P3SFb8m91xicaZiTWPYay1NvmUMuB"
  },
  jessica: {
    name: "Jessica Pearson",
    role: "Head of Marketing",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDz9LyknVVFkweO18qBeo5VHnTA7xS-vzL1R4OswqpCN_Ql-Y2Di5QD04NQU7WR1GuEqohaljk4O8XhG6bB0fNQFy8S0aATX_BbcUwz-UIYhe89fcVW7EGcRelkKIRTxTfGzTd5nvOIB70TDcfC3VI4Y3ZqjcbB4XJkWph_pKfZZ2c0qwHe5SuKSXIBFpDhQkrjeXh7fo6LNN77STWnnJiAqt6YXlly8PVnLkbKe5H9JGp60_XMHSSOpYiNxwCIKosp5UI3bOQVwutF"
  }
};