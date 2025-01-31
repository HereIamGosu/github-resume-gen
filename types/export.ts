import { Project } from "./project";

export interface ExportData {
  skills: Record<string, number>;
  projects: Project[];
}

export interface ExportButtonsProps {
  data: ExportData;
  username: string;
  design: string;
}

export interface DesignConfig {
  headerColor: string;
  subHeaderColor: string;
  textColor: string;
  accentColor: string;
}