const M = {
  v: "v",
  f: function () {
    console.log(this.v);
  },
};

module.exports = M;
// M이라는 객체를 모듈 밖에서 사용할수 있게 하는 기능
