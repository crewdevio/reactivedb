
export interface Source {
  document?: any;
  schema?: any;
  rawSDL?: string;
  location?: string;
}

export type SingleFileOptions = any & {
    noRequire?: boolean;
    cwd?: string;
  };

export type WithList<T> = T | T[];
export type ElementOf<TList> = TList extends Array<infer TElement> ? TElement : never;
export type SchemaPointer = WithList<string>;
export type SchemaPointerSingle = ElementOf<SchemaPointer>;
export type DocumentGlobPathPointer = string;
export type DocumentPointer = WithList<DocumentGlobPathPointer>;
export type DocumentPointerSingle = ElementOf<DocumentPointer>;

export interface Loader<TPointer = string, TOptions extends SingleFileOptions = SingleFileOptions> {
  loaderId(): string;
  canLoad(pointer: TPointer, options?: TOptions): Promise<boolean>;
  canLoadSync?(pointer: TPointer, options?: TOptions): boolean;
  load(pointer: TPointer, options?: TOptions): Promise<Source | never>;
  loadSync?(pointer: TPointer, options?: TOptions): Source | never;
}

export type SchemaLoader<TOptions extends SingleFileOptions = SingleFileOptions> = Loader<
  SchemaPointerSingle,
  TOptions
>;

export type DocumentLoader<TOptions extends SingleFileOptions = SingleFileOptions> = Loader<
  DocumentPointerSingle,
  TOptions
>;

export type UniversalLoader<TOptions extends SingleFileOptions = SingleFileOptions> = Loader<
  SchemaPointerSingle | DocumentPointerSingle,
  TOptions
>;
