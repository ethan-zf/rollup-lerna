import Base from '../package-base/index';
class APP2 {
  constructor() {
    console.error('in app2');
    new Base();
  }
}

(() => {
  // if (!window.KDMap) {
  //   window.KDMap = {};
  // }
  // Object.assign(window.KDMap, baseModules);
  window.APP2 = APP2;
  // window.KMAP_BASE_VERSION = process.env.KMAP_BASE_VERSION || '-';
})();
