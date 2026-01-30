export interface ShowMoreOptions {
  typeElement: string;
  more: string | false;
  less: string | false;
  number: boolean;
  nobutton: boolean;
  after: number;
  btnClass: string;
  btnClassAppend: string | null;
  limit?: number;
  type?: "text" | "list" | "table";
  element?: HTMLElement;
  ellipsis?: boolean | string;
}

export const defaultOptions: Partial<ShowMoreOptions> = {
  typeElement: "span",
  more: false,
  less: false,
  number: false,
  nobutton: false,
  after: 0,
  btnClass: "show-more-btn",
  btnClassAppend: null,
};
