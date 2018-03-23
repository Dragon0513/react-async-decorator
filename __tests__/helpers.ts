export interface IApi<T> {
    defer: Promise<T>;
    fetch(): Promise<T>;
    resolve(_: T): void;
    reject(_: Error): void;
}

export function createApi<T>(): IApi<T> {
    const api: IApi<T> = {
        fetch: () => api.defer,
        resolve: (_: T) => {},
        reject: (_: Error) => {}
    } as any;
    api.defer = new Promise<T>((resolve, reject) => {
        api.resolve = resolve;
        api.reject = reject;
    });
    return api;
}
