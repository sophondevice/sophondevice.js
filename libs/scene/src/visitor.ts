export interface Visitor {
  visit(target: unknown): unknown;
}