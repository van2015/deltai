export interface ProjectSupportDetector {
  supports(path: string): Promise<boolean>;
}
