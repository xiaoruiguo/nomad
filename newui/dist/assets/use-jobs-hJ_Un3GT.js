import{u as s,t as n}from"./common-DZFrt5Ux.js";function a(o){return s(["jobs","list",JSON.stringify(o)],"/v1/jobs",{params:n(o)})}function e(o){return s(["jobs","detail",o],`/v1/job/${o}`,{throttleMs:1e3})}function i(o,t){return s(["jobs","allocations",o,JSON.stringify(t)],`/v1/job/${o}/allocations`,{params:n(t)})}export{e as a,i as b,a as u};
//# sourceMappingURL=use-jobs-hJ_Un3GT.js.map
