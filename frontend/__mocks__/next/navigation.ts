const replace = jest.fn();
const push = jest.fn();

export const useRouter = jest.fn(() => ({ replace, push }));
export const usePathname = jest.fn(() => "/");
export const useSearchParams = jest.fn(() => new URLSearchParams());
