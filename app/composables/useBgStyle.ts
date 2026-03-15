export function useBgStyle(color: Ref<string>) {
  return computed(() => ({ backgroundColor: color.value }));
}
