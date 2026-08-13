export type MediaType = "META" | "GOOGLE_SEARCH" | "GOOGLE_DISPLAY" | "YOUTUBE" | "NAVER_GFA" | "KAKAO_MOMENT";
export type PlacementType = "INSTAGRAM_FEED" | "INSTAGRAM_REELS" | "FACEBOOK_FEED" | "GDN_BANNER" | "NAVER_GFA_BANNER" | "KAKAO_MOMENT_FEED";
export type IndustryType = "FOOD_BEVERAGE" | "FASHION" | "BEAUTY" | "FITNESS" | "ECOMMERCE" | "TRAVEL" | "EDUCATION" | "AUTOMOBILE" | "HEALTHCARE" | "REAL_ESTATE" | "B2B_SAAS" | "FINANCE" | "ENTERTAINMENT" | "HOME_SERVICES" | "TECHNOLOGY" | "INSURANCE" | "LEGAL";
export type ObjectiveType = "AWARENESS" | "TRAFFIC" | "CONVERSION";

export interface CreativeFormData {
  label: string;
  headline: string;
  bodyText: string;
  ctaText: string;
  imageDataUrl?: string;
}

export interface WizardFormData {
  projectName: string;
  title: string;
  media: MediaType;
  placement: PlacementType;
  industry: IndustryType;
  objective: ObjectiveType;
  targetSummary: string;
  dailyBudgetKrw: number;
  plannedDays: number;
  customCtr?: number;
  customCvr?: number;
  customCpmKrw?: number;
  creatives: CreativeFormData[];
}

export const MEDIA_OPTIONS: { value: MediaType; label: string; desc: string }[] = [
  { value: "META", label: "Meta", desc: "페이스북 / 인스타그램" },
  { value: "GOOGLE_SEARCH", label: "Google 검색", desc: "검색 결과 텍스트 광고" },
  { value: "GOOGLE_DISPLAY", label: "Google 디스플레이", desc: "GDN 배너 광고" },
  { value: "YOUTUBE", label: "YouTube", desc: "인스트림 영상 광고" },
  { value: "NAVER_GFA", label: "네이버 GFA", desc: "네이버 성과형 디스플레이" },
  { value: "KAKAO_MOMENT", label: "카카오모먼트", desc: "카카오 피드 광고" },
];

export const PLACEMENT_OPTIONS: Record<MediaType, { value: PlacementType; label: string }[]> = {
  META: [
    { value: "INSTAGRAM_FEED", label: "인스타그램 피드" },
    { value: "INSTAGRAM_REELS", label: "인스타그램 릴스" },
    { value: "FACEBOOK_FEED", label: "페이스북 피드" },
  ],
  GOOGLE_SEARCH: [{ value: "GDN_BANNER", label: "검색 결과" }],
  GOOGLE_DISPLAY: [{ value: "GDN_BANNER", label: "GDN 배너" }],
  YOUTUBE: [{ value: "INSTAGRAM_FEED", label: "인스트림" }],
  NAVER_GFA: [{ value: "NAVER_GFA_BANNER", label: "네이버 GFA 배너" }],
  KAKAO_MOMENT: [{ value: "KAKAO_MOMENT_FEED", label: "카카오 피드" }],
};

export const INDUSTRY_OPTIONS: { value: IndustryType; label: string }[] = [
  { value: "FOOD_BEVERAGE", label: "식음료" },
  { value: "FASHION", label: "패션/의류" },
  { value: "BEAUTY", label: "뷰티/퍼스널케어" },
  { value: "FITNESS", label: "피트니스/웰니스" },
  { value: "ECOMMERCE", label: "이커머스(일반)" },
  { value: "TRAVEL", label: "여행/숙박" },
  { value: "EDUCATION", label: "교육" },
  { value: "AUTOMOBILE", label: "자동차" },
  { value: "HEALTHCARE", label: "헬스케어" },
  { value: "REAL_ESTATE", label: "부동산" },
  { value: "B2B_SAAS", label: "B2B/SaaS" },
  { value: "FINANCE", label: "금융" },
  { value: "ENTERTAINMENT", label: "예술/엔터테인먼트" },
  { value: "HOME_SERVICES", label: "홈서비스" },
  { value: "TECHNOLOGY", label: "기술" },
  { value: "INSURANCE", label: "보험" },
  { value: "LEGAL", label: "법률" },
];

export const OBJECTIVE_OPTIONS: { value: ObjectiveType; label: string; desc: string }[] = [
  { value: "AWARENESS", label: "인지도", desc: "시선 정지력과 브랜드 인식 중심 가중" },
  { value: "TRAFFIC", label: "트래픽", desc: "클릭 유도력과 메시지 명확성 중심 가중" },
  { value: "CONVERSION", label: "전환", desc: "가치 제안과 CTA 강도 중심 가중" },
];
