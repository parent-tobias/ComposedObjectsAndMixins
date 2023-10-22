export const pipe = (...fns)=>(x)=>fns.reduce((acc, fn)=>fn(acc),x);
export const compose = (...fns)=>(x)=>fns.reduceRight((acc, fn)=>fn(acc),x);
