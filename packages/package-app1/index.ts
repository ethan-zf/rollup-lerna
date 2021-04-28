import Base from '../package-base/index';
class APP1 {
  constructor() {
    console.error('in app1');
    new Base();
  }
}

(() => {
  // if (!window.KDMap) {
  //   window.KDMap = {};
  // }
  // Object.assign(window.KDMap, baseModules);
  window.APP1 = APP1;
  // window.KMAP_BASE_VERSION = process.env.KMAP_BASE_VERSION || '-';
})();
