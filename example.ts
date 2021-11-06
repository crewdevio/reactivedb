import { filterData } from "./src/shared/utils.ts";

console.log(filterData("/users/0/name"));
console.log(filterData("users/0/name"));
console.log(filterData("users"));
console.log(filterData(""));
console.log(filterData("/"));


