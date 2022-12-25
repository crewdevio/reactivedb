export default function (...rest: any) {
console.log('set', rest);
  return {
    done: true,
  };
}
